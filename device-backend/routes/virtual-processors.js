const express = require('express');
const router = express.Router();
const virtualProcessorService = require('../services/virtual-processor-service');
const WebSocket = require('ws');

/**
 * Virtual Processor Management Routes
 */

// Start a virtual processor instance
router.post('/instances/:instanceId/start', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { processorType, configuration } = req.body;

    const result = await virtualProcessorService.startInstance(
      instanceId,
      processorType,
      configuration
    );

    res.json(result);
  } catch (error) {
    console.error('Error starting instance:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stop a virtual processor instance
router.post('/instances/:instanceId/stop', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const result = await virtualProcessorService.stopInstance(instanceId);
    res.json(result);
  } catch (error) {
    console.error('Error stopping instance:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Load firmware into running instance
router.post('/instances/:instanceId/firmware', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { firmwarePath } = req.body;

    const result = await virtualProcessorService.loadFirmware(
      instanceId,
      firmwarePath
    );

    res.json(result);
  } catch (error) {
    console.error('Error loading firmware:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get serial output
router.get('/instances/:instanceId/serial', (req, res) => {
  try {
    const { instanceId } = req.params;
    const output = virtualProcessorService.getSerialOutput(instanceId);

    res.json({
      success: true,
      output,
    });
  } catch (error) {
    console.error('Error getting serial output:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get instance status
router.get('/instances/:instanceId/status', (req, res) => {
  try {
    const { instanceId } = req.params;
    const status = virtualProcessorService.getInstanceStatus(instanceId);

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Error getting instance status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// List all running instances
router.get('/instances', (req, res) => {
  try {
    const instances = virtualProcessorService.listInstances();
    res.json({
      success: true,
      instances,
    });
  } catch (error) {
    console.error('Error listing instances:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * WebSocket handler for real-time serial console
 * Mount this in your main server file
 */
function setupWebSocketHandler(wss) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    // Match pattern: /virtual-processors/instances/:instanceId/serial
    const match = pathname.match(/^\/virtual-processors\/instances\/([^/]+)\/serial$/);

    if (!match) {
      ws.send(JSON.stringify({ error: 'Invalid WebSocket path' }));
      ws.close();
      return;
    }

    const instanceId = match[1];
    console.log(`WebSocket connection for instance ${instanceId}`);

    try {
      virtualProcessorService.connectSerialSocket(instanceId, ws);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.send(JSON.stringify({ error: error.message }));
      ws.close();
    }
  });
}

module.exports = {
  router,
  setupWebSocketHandler,
};
