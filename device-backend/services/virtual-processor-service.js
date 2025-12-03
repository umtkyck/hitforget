const { spawn, exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');

const execAsync = util.promisify(exec);

/**
 * Virtual Processor Simulation Service
 * Manages virtual embedded processors using QEMU, Renode, and SimAVR
 */
class VirtualProcessorService {
  constructor() {
    this.instances = new Map(); // instanceId -> { process, type, config, sockets }
    this.simulations = new Map(); // simulationId -> { instanceId, firmware, output }
    this.baseDir = '/tmp/visucan-virtual';
  }

  async initialize() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      console.log('Virtual Processor Service initialized');
    } catch (error) {
      console.error('Failed to initialize Virtual Processor Service:', error);
    }
  }

  /**
   * Start a virtual processor instance
   */
  async startInstance(instanceId, processorType, configuration = {}) {
    if (this.instances.has(instanceId)) {
      throw new Error('Instance already running');
    }

    const simulator = processorType.simulatorEngine || 'qemu';

    let process;
    switch (simulator) {
      case 'qemu':
        process = await this._startQEMU(instanceId, processorType, configuration);
        break;
      case 'renode':
        process = await this._startRenode(instanceId, processorType, configuration);
        break;
      case 'simavr':
        process = await this._startSimAVR(instanceId, processorType, configuration);
        break;
      default:
        throw new Error(`Unsupported simulator: ${simulator}`);
    }

    this.instances.set(instanceId, {
      process,
      type: processorType,
      config: configuration,
      startedAt: Date.now(),
      serialBuffer: '',
      sockets: new Set(),
    });

    return { success: true, instanceId, status: 'running' };
  }

  /**
   * Start QEMU instance (for ARM, RISC-V, etc.)
   */
  async _startQEMU(instanceId, processorType, config) {
    const { architecture, specifications } = processorType;

    // Example: QEMU for ARM Cortex-M (STM32)
    const machine = this._getQEMUMachine(architecture);
    const cpu = specifications?.cpu || 'cortex-m4';
    const ram = specifications?.ram || '128K';

    const instanceDir = path.join(this.baseDir, instanceId);
    await fs.mkdir(instanceDir, { recursive: true });

    const serialPort = 4000 + Math.floor(Math.random() * 1000);
    const gdbPort = 5000 + Math.floor(Math.random() * 1000);
    const monitorPort = 6000 + Math.floor(Math.random() * 1000);

    const args = [
      '-M', machine,
      '-cpu', cpu,
      '-m', ram,
      '-nographic',
      '-serial', `tcp::${serialPort},server,nowait`,
      '-gdb', `tcp::${gdbPort}`,
      '-monitor', `tcp::${monitorPort},server,nowait`,
    ];

    if (config.kernel) {
      args.push('-kernel', config.kernel);
    }

    console.log(`Starting QEMU for ${instanceId}:`, args.join(' '));
    const process = spawn('qemu-system-arm', args, {
      cwd: instanceDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    process.stdout.on('data', (data) => {
      this._handleOutput(instanceId, data.toString());
    });

    process.stderr.on('data', (data) => {
      console.log(`QEMU ${instanceId} stderr:`, data.toString());
    });

    process.on('exit', (code) => {
      console.log(`QEMU instance ${instanceId} exited with code ${code}`);
      this.instances.delete(instanceId);
    });

    // Store ports for later use
    process.serialPort = serialPort;
    process.gdbPort = gdbPort;
    process.monitorPort = monitorPort;

    return process;
  }

  /**
   * Start Renode instance (multi-platform simulator)
   */
  async _startRenode(instanceId, processorType, config) {
    const instanceDir = path.join(this.baseDir, instanceId);
    await fs.mkdir(instanceDir, { recursive: true });

    // Create Renode script
    const renodeScript = this._generateRenodeScript(processorType, config);
    const scriptPath = path.join(instanceDir, 'simulation.resc');
    await fs.writeFile(scriptPath, renodeScript);

    const telnetPort = 7000 + Math.floor(Math.random() * 1000);
    const args = [
      '--disable-xwt',
      '--port', String(telnetPort),
      scriptPath,
    ];

    console.log(`Starting Renode for ${instanceId}`);
    const process = spawn('renode', args, {
      cwd: instanceDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    process.stdout.on('data', (data) => {
      this._handleOutput(instanceId, data.toString());
    });

    process.stderr.on('data', (data) => {
      console.log(`Renode ${instanceId} stderr:`, data.toString());
    });

    process.on('exit', (code) => {
      console.log(`Renode instance ${instanceId} exited with code ${code}`);
      this.instances.delete(instanceId);
    });

    process.telnetPort = telnetPort;
    return process;
  }

  /**
   * Start SimAVR instance (for Arduino/AVR)
   */
  async _startSimAVR(instanceId, processorType, config) {
    const { specifications } = processorType;
    const mcu = specifications?.mcu || 'atmega328p';
    const frequency = specifications?.frequency || '16000000';

    const instanceDir = path.join(this.baseDir, instanceId);
    await fs.mkdir(instanceDir, { recursive: true });

    const firmwarePath = config.firmware || path.join(instanceDir, 'firmware.hex');
    const gdbPort = 5000 + Math.floor(Math.random() * 1000);

    const args = [
      '-m', mcu,
      '-f', frequency,
      firmwarePath,
      '-g',
      '-p', String(gdbPort),
    ];

    console.log(`Starting SimAVR for ${instanceId}`);
    const process = spawn('simavr', args, {
      cwd: instanceDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    process.stdout.on('data', (data) => {
      this._handleOutput(instanceId, data.toString());
    });

    process.stderr.on('data', (data) => {
      console.log(`SimAVR ${instanceId} stderr:`, data.toString());
    });

    process.on('exit', (code) => {
      console.log(`SimAVR instance ${instanceId} exited with code ${code}`);
      this.instances.delete(instanceId);
    });

    process.gdbPort = gdbPort;
    return process;
  }

  /**
   * Stop a virtual processor instance
   */
  async stopInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    return new Promise((resolve, reject) => {
      instance.process.on('exit', () => {
        this.instances.delete(instanceId);
        resolve({ success: true, instanceId, status: 'stopped' });
      });

      instance.process.kill('SIGTERM');

      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.instances.has(instanceId)) {
          instance.process.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  /**
   * Load firmware into running instance
   */
  async loadFirmware(instanceId, firmwarePath) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    const simulator = instance.type.simulatorEngine;

    if (simulator === 'qemu') {
      // For QEMU, send monitor command to load new kernel
      const monitorPort = instance.process.monitorPort;
      const command = `loadvm ${firmwarePath}\n`;
      await this._sendMonitorCommand(monitorPort, command);
    } else if (simulator === 'renode') {
      // For Renode, send telnet command
      const telnetPort = instance.process.telnetPort;
      const command = `sysbus LoadELF @${firmwarePath}\n`;
      await this._sendTelnetCommand(telnetPort, command);
    } else if (simulator === 'simavr') {
      // SimAVR needs restart with new firmware
      await this.stopInstance(instanceId);
      instance.config.firmware = firmwarePath;
      await this.startInstance(instanceId, instance.type, instance.config);
    }

    return { success: true, message: 'Firmware loaded successfully' };
  }

  /**
   * Get serial output from instance
   */
  getSerialOutput(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    return instance.serialBuffer;
  }

  /**
   * Connect WebSocket for real-time serial output
   */
  connectSerialSocket(instanceId, ws) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      ws.send(JSON.stringify({ error: 'Instance not found' }));
      ws.close();
      return;
    }

    instance.sockets.add(ws);

    // Send buffer history
    ws.send(JSON.stringify({
      type: 'history',
      data: instance.serialBuffer,
    }));

    ws.on('close', () => {
      instance.sockets.delete(ws);
    });

    ws.on('message', (message) => {
      // Send input to virtual processor
      if (instance.process && instance.process.stdin) {
        instance.process.stdin.write(message);
      }
    });
  }

  /**
   * Handle output from virtual processor
   */
  _handleOutput(instanceId, data) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.serialBuffer += data;

    // Limit buffer size
    if (instance.serialBuffer.length > 100000) {
      instance.serialBuffer = instance.serialBuffer.slice(-100000);
    }

    // Broadcast to connected sockets
    instance.sockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'output',
          data,
        }));
      }
    });
  }

  /**
   * Get QEMU machine type based on architecture
   */
  _getQEMUMachine(architecture) {
    const machineMap = {
      'ARM Cortex-M4': 'netduinoplus2',
      'ARM Cortex-M3': 'lm3s6965evb',
      'ARM Cortex-A72': 'raspi3b',
      'RISC-V': 'spike',
    };
    return machineMap[architecture] || 'none';
  }

  /**
   * Generate Renode simulation script
   */
  _generateRenodeScript(processorType, config) {
    return `
# Renode simulation script for ${processorType.name}

using sysbus
mach create

# Load platform description
machine LoadPlatformDescription @platforms/cpus/${processorType.category}.repl

# Optional: Load binary
${config.firmware ? `sysbus LoadELF @${config.firmware}` : '# No firmware specified'}

# Setup UART
showAnalyzer sysbus.usart1

# Start simulation
start
`;
  }

  /**
   * Send command to QEMU monitor
   */
  async _sendMonitorCommand(port, command) {
    const net = require('net');
    return new Promise((resolve, reject) => {
      const client = net.createConnection({ port }, () => {
        client.write(command);
        client.end();
        resolve();
      });
      client.on('error', reject);
    });
  }

  /**
   * Send command via telnet (Renode)
   */
  async _sendTelnetCommand(port, command) {
    const net = require('net');
    return new Promise((resolve, reject) => {
      const client = net.createConnection({ port }, () => {
        client.write(command);
        client.end();
        resolve();
      });
      client.on('error', reject);
    });
  }

  /**
   * Get instance status
   */
  getInstanceStatus(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return { status: 'stopped' };
    }

    const uptime = (Date.now() - instance.startedAt) / 1000;
    return {
      status: 'running',
      uptime,
      bufferSize: instance.serialBuffer.length,
      connectedClients: instance.sockets.size,
    };
  }

  /**
   * List all running instances
   */
  listInstances() {
    const instances = [];
    this.instances.forEach((instance, instanceId) => {
      instances.push({
        instanceId,
        type: instance.type.name,
        status: 'running',
        uptime: (Date.now() - instance.startedAt) / 1000,
      });
    });
    return instances;
  }
}

module.exports = new VirtualProcessorService();
