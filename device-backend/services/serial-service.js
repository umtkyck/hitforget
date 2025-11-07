const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

class SerialService {
  constructor() {
    this.connections = new Map(); // deviceId -> { port, clients: Set<WebSocket> }
  }

  /**
   * List available serial ports
   */
  async listPorts() {
    try {
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        vendorId: port.vendorId,
        productId: port.productId,
      }));
    } catch (error) {
      logger.error('Error listing serial ports:', error);
      throw error;
    }
  }

  /**
   * Open serial port for a device
   */
  openPort(deviceId, portPath, baudRate = 115200) {
    if (this.connections.has(deviceId)) {
      logger.warn(`Port already open for device ${deviceId}`);
      return this.connections.get(deviceId);
    }

    const port = new SerialPort({
      path: portPath,
      baudRate: parseInt(baudRate),
      autoOpen: true,
    });

    const connection = {
      port,
      portPath,
      baudRate,
      clients: new Set(),
    };

    port.on('error', (err) => {
      logger.error(`Serial port error for ${deviceId}:`, err);
      this.closePort(deviceId);
    });

    port.on('close', () => {
      logger.info(`Serial port closed for ${deviceId}`);
      this.connections.delete(deviceId);
    });

    // Broadcast incoming data to all connected clients
    port.on('data', (data) => {
      const message = data.toString();
      connection.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    this.connections.set(deviceId, connection);
    logger.info(`Opened serial port ${portPath} for device ${deviceId} at ${baudRate} baud`);

    return connection;
  }

  /**
   * Close serial port for a device
   */
  closePort(deviceId) {
    const connection = this.connections.get(deviceId);
    if (connection) {
      connection.port.close();
      connection.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.close();
        }
      });
      this.connections.delete(deviceId);
      logger.info(`Closed serial port for device ${deviceId}`);
    }
  }

  /**
   * Add WebSocket client to device connection
   */
  addClient(deviceId, ws) {
    const connection = this.connections.get(deviceId);
    if (!connection) {
      throw new Error(`No serial port open for device ${deviceId}`);
    }

    connection.clients.add(ws);

    ws.on('message', (data) => {
      // Send data from client to serial port
      if (connection.port.isOpen) {
        connection.port.write(data.toString());
      }
    });

    ws.on('close', () => {
      connection.clients.delete(ws);
      logger.info(`WebSocket client disconnected from device ${deviceId}`);

      // Close port if no more clients
      if (connection.clients.size === 0) {
        setTimeout(() => {
          if (connection.clients.size === 0) {
            this.closePort(deviceId);
          }
        }, 5000); // 5 second grace period
      }
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket error for device ${deviceId}:`, error);
      connection.clients.delete(ws);
    });

    logger.info(`WebSocket client connected to device ${deviceId}`);
  }

  /**
   * Remove WebSocket client from device connection
   */
  removeClient(deviceId, ws) {
    const connection = this.connections.get(deviceId);
    if (connection) {
      connection.clients.delete(ws);
    }
  }

  /**
   * Send data to serial port
   */
  send(deviceId, data) {
    const connection = this.connections.get(deviceId);
    if (!connection || !connection.port.isOpen) {
      throw new Error(`No open serial port for device ${deviceId}`);
    }

    connection.port.write(data);
  }

  /**
   * Get connection info for a device
   */
  getConnection(deviceId) {
    const connection = this.connections.get(deviceId);
    if (!connection) {
      return null;
    }

    return {
      deviceId,
      portPath: connection.portPath,
      baudRate: connection.baudRate,
      isOpen: connection.port.isOpen,
      clientCount: connection.clients.size,
    };
  }

  /**
   * Get all connections
   */
  getAllConnections() {
    const connections = [];
    this.connections.forEach((connection, deviceId) => {
      connections.push(this.getConnection(deviceId));
    });
    return connections;
  }
}

module.exports = new SerialService();
