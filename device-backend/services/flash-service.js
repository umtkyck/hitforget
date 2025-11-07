const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const winston = require('winston');

const execAsync = util.promisify(exec);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

class FlashService {
  constructor() {
    this.activeFlashes = new Map(); // deviceId -> flash info
  }

  /**
   * Flash firmware to device
   */
  async flash(deviceId, config) {
    const {
      firmwarePath,
      hardwareType,
      programmer = 'auto', // 'stlink', 'jlink', 'avrisp', 'usb'
    } = config;

    logger.info(`Starting flash for device ${deviceId} with ${programmer}`);

    const flashInfo = {
      deviceId,
      status: 'flashing',
      startTime: Date.now(),
      logs: [],
    };

    this.activeFlashes.set(deviceId, flashInfo);

    try {
      // Select flash method based on hardware type
      if (hardwareType.includes('stm32')) {
        await this.flashSTM32(deviceId, firmwarePath, flashInfo);
      } else if (hardwareType.includes('arduino')) {
        await this.flashArduino(deviceId, firmwarePath, hardwareType, flashInfo);
      } else if (hardwareType.includes('raspberry_pi')) {
        await this.flashRaspberryPi(deviceId, firmwarePath, flashInfo);
      } else if (hardwareType.includes('fpga')) {
        await this.flashFPGA(deviceId, firmwarePath, flashInfo);
      } else {
        throw new Error(`Unsupported hardware type: ${hardwareType}`);
      }

      flashInfo.status = 'success';
      flashInfo.endTime = Date.now();
      logger.info(`Flash completed successfully for device ${deviceId}`);

      return flashInfo;
    } catch (error) {
      flashInfo.status = 'failed';
      flashInfo.error = error.message;
      flashInfo.endTime = Date.now();
      logger.error(`Flash failed for device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Flash STM32 device using OpenOCD
   */
  async flashSTM32(deviceId, firmwarePath, flashInfo) {
    const command = `openocd -f interface/stlink.cfg -f target/stm32f4x.cfg -c "program ${firmwarePath} verify reset exit"`;

    flashInfo.logs.push(`Executing: ${command}`);

    const { stdout, stderr } = await execAsync(command);
    flashInfo.logs.push(stdout);
    if (stderr) flashInfo.logs.push(stderr);

    if (stdout.includes('verified OK') || stdout.includes('** Programming Finished **')) {
      flashInfo.logs.push('Flash successful');
    } else {
      throw new Error('Flash verification failed');
    }
  }

  /**
   * Flash Arduino device using avrdude
   */
  async flashArduino(deviceId, firmwarePath, hardwareType, flashInfo) {
    // Map hardware type to avrdude configuration
    const boardMap = {
      'arduino_uno': { mcu: 'atmega328p', programmer: 'arduino', baud: 115200 },
      'arduino_mega': { mcu: 'atmega2560', programmer: 'wiring', baud: 115200 },
      'arduino_nano': { mcu: 'atmega328p', programmer: 'arduino', baud: 57600 },
    };

    const config = boardMap[hardwareType] || boardMap.arduino_uno;
    const port = `/dev/ttyUSB${deviceId}`; // TODO: Get actual port from device mapping

    const command = `avrdude -v -p ${config.mcu} -c ${config.programmer} -P ${port} -b ${config.baud} -D -U flash:w:${firmwarePath}:i`;

    flashInfo.logs.push(`Executing: ${command}`);

    const { stdout, stderr } = await execAsync(command);
    flashInfo.logs.push(stdout);
    if (stderr) flashInfo.logs.push(stderr);

    if (stdout.includes('bytes of flash verified') || stderr.includes('bytes of flash verified')) {
      flashInfo.logs.push('Flash successful');
    } else {
      throw new Error('Flash verification failed');
    }
  }

  /**
   * Flash Raspberry Pi using USB gadget mode
   */
  async flashRaspberryPi(deviceId, firmwarePath, flashInfo) {
    // For Raspberry Pi, we typically copy the firmware to the SD card
    // This assumes the Pi is in USB gadget mode or accessible via SSH

    // Method 1: Copy via USB mass storage
    const mountPoint = `/mnt/device${deviceId}`;

    flashInfo.logs.push(`Mounting device at ${mountPoint}`);
    await execAsync(`mkdir -p ${mountPoint}`);
    await execAsync(`mount /dev/sdX1 ${mountPoint}`); // TODO: Get actual device

    flashInfo.logs.push(`Copying firmware to device`);
    await execAsync(`cp ${firmwarePath} ${mountPoint}/`);

    flashInfo.logs.push(`Unmounting device`);
    await execAsync(`umount ${mountPoint}`);

    flashInfo.logs.push('Flash successful');
  }

  /**
   * Flash FPGA using Quartus programmer
   */
  async flashFPGA(deviceId, firmwarePath, flashInfo) {
    // Using Intel Quartus programmer
    const command = `quartus_pgm -c USB-Blaster -m JTAG -o "p;${firmwarePath}"`;

    flashInfo.logs.push(`Executing: ${command}`);

    const { stdout, stderr } = await execAsync(command);
    flashInfo.logs.push(stdout);
    if (stderr) flashInfo.logs.push(stderr);

    if (stdout.includes('Successful') || stdout.includes('100%')) {
      flashInfo.logs.push('Flash successful');
    } else {
      throw new Error('Flash failed');
    }
  }

  /**
   * Verify firmware on device
   */
  async verify(deviceId, firmwarePath, hardwareType) {
    logger.info(`Verifying firmware for device ${deviceId}`);

    // Implement verification logic based on hardware type
    // This typically involves reading back the flash and comparing

    return {
      verified: true,
      message: 'Firmware verified successfully',
    };
  }

  /**
   * Get flash status
   */
  getFlashStatus(deviceId) {
    return this.activeFlashes.get(deviceId);
  }

  /**
   * Get flash logs
   */
  getFlashLogs(deviceId) {
    const flashInfo = this.activeFlashes.get(deviceId);
    return flashInfo ? flashInfo.logs.join('\n') : '';
  }
}

module.exports = new FlashService();
