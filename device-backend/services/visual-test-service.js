const cv = require('opencv4nodejs'); // OpenCV for Node.js
const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

class VisualTestService {
  /**
   * Capture frame from camera
   */
  async captureFrame(deviceId) {
    // TODO: Implement actual camera capture
    // This would interface with the camera agent
    const cameraUrl = `http://localhost:8080/camera/${deviceId}/snapshot`;

    try {
      const response = await axios.get(cameraUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const img = cv.imdecode(buffer);
      return img;
    } catch (error) {
      logger.error(`Error capturing frame for device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Detect LED state (on/off, color, brightness)
   */
  async detectLED(deviceId, roi) {
    const frame = await this.captureFrame(deviceId);

    // Extract region of interest
    const ledRegion = frame.getRegion(new cv.Rect(roi.x, roi.y, roi.width, roi.height));

    // Convert to HSV for better color detection
    const hsv = ledRegion.cvtColor(cv.COLOR_BGR2HSV);

    // Get average brightness
    const mean = hsv.mean();
    const brightness = mean.w; // V channel

    // Detect color (if LED is on)
    let color = 'off';
    if (brightness > 50) {
      const hue = mean.x;
      if (hue < 30 || hue > 330) color = 'red';
      else if (hue < 90) color = 'yellow';
      else if (hue < 150) color = 'green';
      else if (hue < 210) color = 'cyan';
      else if (hue < 270) color = 'blue';
      else color = 'magenta';
    }

    return {
      isOn: brightness > 50,
      brightness,
      color,
      roi,
    };
  }

  /**
   * Analyze LED blink pattern
   */
  async analyzeBlink(deviceId, roi, duration = 5000) {
    const startTime = Date.now();
    const samples = [];

    while (Date.now() - startTime < duration) {
      const ledState = await this.detectLED(deviceId, roi);
      samples.push({
        timestamp: Date.now(),
        isOn: ledState.isOn,
        brightness: ledState.brightness,
      });

      await new Promise(resolve => setTimeout(resolve, 50)); // 20 FPS
    }

    // Analyze pattern
    const transitions = [];
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].isOn !== samples[i - 1].isOn) {
        transitions.push({
          timestamp: samples[i].timestamp,
          state: samples[i].isOn ? 'on' : 'off',
        });
      }
    }

    // Calculate frequency
    const onOffCycles = Math.floor(transitions.length / 2);
    const frequency = onOffCycles / (duration / 1000); // Hz

    // Calculate duty cycle
    let onTime = 0;
    for (let i = 0; i < transitions.length - 1; i++) {
      if (transitions[i].state === 'on') {
        onTime += transitions[i + 1].timestamp - transitions[i].timestamp;
      }
    }
    const dutyCycle = (onTime / duration) * 100;

    return {
      frequency,
      dutyCycle,
      transitions: transitions.length,
      pattern: transitions,
    };
  }

  /**
   * Perform OCR on seven-segment display
   */
  async readSevenSegment(deviceId, roi) {
    const frame = await this.captureFrame(deviceId);
    const displayRegion = frame.getRegion(new cv.Rect(roi.x, roi.y, roi.width, roi.height));

    // Preprocess for OCR
    const gray = displayRegion.cvtColor(cv.COLOR_BGR2GRAY);
    const thresh = gray.threshold(127, 255, cv.THRESH_BINARY);

    // Use AI for OCR (call OpenAI Vision API)
    const base64Image = cv.imencode('.png', thresh).toString('base64');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'What number is displayed on this seven-segment display? Reply with only the number.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 10,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data.choices[0].message.content.trim();
      return {
        text,
        confidence: 0.9, // GPT-4 Vision doesn't provide confidence, assume high
      };
    } catch (error) {
      logger.error('OCR error:', error);
      throw error;
    }
  }

  /**
   * Detect visual anomalies (compare with golden reference)
   */
  async detectAnomaly(deviceId, roi, goldenImagePath) {
    const currentFrame = await this.captureFrame(deviceId);
    const currentRegion = currentFrame.getRegion(new cv.Rect(roi.x, roi.y, roi.width, roi.height));

    const goldenImage = cv.imread(goldenImagePath);

    // Compute structural similarity (SSIM)
    const diff = currentRegion.absdiff(goldenImage);
    const mean = diff.mean();
    const similarity = 1 - (mean.w / 255); // Normalized similarity

    return {
      similarity,
      anomalyDetected: similarity < 0.95,
      differenceMap: cv.imencode('.png', diff),
    };
  }

  /**
   * Run automated visual test
   */
  async runVisualTest(testConfig) {
    const { deviceId, testType, params } = testConfig;

    logger.info(`Running visual test ${testType} for device ${deviceId}`);

    let result;

    switch (testType) {
      case 'led_state':
        result = await this.detectLED(deviceId, params.roi);
        break;

      case 'led_blink':
        result = await this.analyzeBlink(deviceId, params.roi, params.duration);
        break;

      case 'seven_segment':
        result = await this.readSevenSegment(deviceId, params.roi);
        break;

      case 'anomaly_detection':
        result = await this.detectAnomaly(deviceId, params.roi, params.goldenImagePath);
        break;

      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    return {
      testType,
      deviceId,
      result,
      timestamp: Date.now(),
    };
  }
}

module.exports = new VisualTestService();
