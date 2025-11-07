const express = require('express');
const WebSocket = require('ws');
const serialService = require('../services/serial-service');

const router = express.Router();

/**
 * GET /api/serial/ports
 * List available serial ports
 */
router.get('/ports', async (req, res) => {
  try {
    const ports = await serialService.listPorts();
    res.json({
      success: true,
      ports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/serial/connections
 * Get all active serial connections
 */
router.get('/connections', (req, res) => {
  const connections = serialService.getAllConnections();
  res.json({
    success: true,
    connections,
  });
});

/**
 * POST /api/serial/:deviceId/open
 * Open serial port for device
 */
router.post('/:deviceId/open', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { portPath, baudRate = 115200 } = req.body;

    if (!portPath) {
      return res.status(400).json({
        success: false,
        error: 'portPath is required',
      });
    }

    const connection = serialService.openPort(deviceId, portPath, baudRate);
    res.json({
      success: true,
      connection: {
        deviceId,
        portPath: connection.portPath,
        baudRate: connection.baudRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/serial/:deviceId/close
 * Close serial port for device
 */
router.post('/:deviceId/close', (req, res) => {
  try {
    const { deviceId } = req.params;
    serialService.closePort(deviceId);
    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/serial/:deviceId/send
 * Send data to serial port
 */
router.post('/:deviceId/send', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'data is required',
      });
    }

    serialService.send(deviceId, data);
    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * WebSocket handler for serial console
 * Should be mounted separately in the main server
 */
function handleWebSocket(ws, req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/');
  const deviceId = pathParts[pathParts.length - 2]; // /api/devices/:deviceId/console
  const baudRate = url.searchParams.get('baudRate') || '115200';

  // TODO: Get device port path from database
  const portPath = `/dev/ttyUSB${deviceId}`; // Placeholder

  try {
    // Open port if not already open
    let connection = serialService.getConnection(deviceId);
    if (!connection) {
      serialService.openPort(deviceId, portPath, baudRate);
    }

    // Add WebSocket client
    serialService.addClient(deviceId, ws);

    ws.send('Connected to serial port\r\n');
  } catch (error) {
    ws.send(`Error: ${error.message}\r\n`);
    ws.close();
  }
}

module.exports = { router, handleWebSocket };
