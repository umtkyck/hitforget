const Docker = require('dockerode');
const path = require('path');
const fs = require('fs').promises;
const winston = require('winston');

const docker = new Docker();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

class BuildService {
  constructor() {
    this.builds = new Map(); // buildId -> build info
  }

  /**
   * Build firmware from source code
   */
  async build(buildId, config) {
    const {
      projectId,
      hardwareType,
      sourceCode,
      platform = 'platformio', // 'platformio', 'arduino', 'stm32cube'
    } = config;

    logger.info(`Starting build ${buildId} for project ${projectId}`);

    const buildDir = path.join('/tmp/builds', buildId);
    await fs.mkdir(buildDir, { recursive: true });

    // Write source files
    for (const file of sourceCode) {
      const filePath = path.join(buildDir, file.filename);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content);
    }

    // Select Docker image based on platform
    const imageMap = {
      platformio: 'visucan/platformio:latest',
      arduino: 'visucan/arduino-cli:latest',
      stm32cube: 'visucan/stm32cube:latest',
    };

    const image = imageMap[platform] || imageMap.platformio;

    try {
      // Pull image if not exists
      await this.ensureImage(image);

      // Create and run container
      const container = await docker.createContainer({
        Image: image,
        Cmd: this.getBuildCommand(platform, hardwareType),
        HostConfig: {
          Binds: [`${buildDir}:/workspace`],
          AutoRemove: true,
        },
        WorkingDir: '/workspace',
      });

      const buildInfo = {
        buildId,
        projectId,
        status: 'building',
        startTime: Date.now(),
        logs: [],
      };

      this.builds.set(buildId, buildInfo);

      // Attach to container to capture logs
      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
      });

      stream.on('data', (chunk) => {
        const log = chunk.toString();
        buildInfo.logs.push(log);
        logger.info(`Build ${buildId}:`, log);
      });

      // Start container
      await container.start();

      // Wait for container to finish
      const result = await container.wait();

      buildInfo.endTime = Date.now();
      buildInfo.exitCode = result.StatusCode;

      if (result.StatusCode === 0) {
        buildInfo.status = 'success';
        // Collect artifacts
        buildInfo.artifacts = await this.collectArtifacts(buildDir);
      } else {
        buildInfo.status = 'failed';
      }

      logger.info(`Build ${buildId} completed with status: ${buildInfo.status}`);

      return buildInfo;
    } catch (error) {
      logger.error(`Build ${buildId} error:`, error);
      const buildInfo = this.builds.get(buildId);
      if (buildInfo) {
        buildInfo.status = 'failed';
        buildInfo.error = error.message;
      }
      throw error;
    }
  }

  /**
   * Ensure Docker image exists (pull if needed)
   */
  async ensureImage(image) {
    try {
      await docker.getImage(image).inspect();
    } catch (error) {
      logger.info(`Pulling image ${image}...`);
      await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    }
  }

  /**
   * Get build command based on platform
   */
  getBuildCommand(platform, hardwareType) {
    const commands = {
      platformio: ['pio', 'run'],
      arduino: ['arduino-cli', 'compile', '--fqbn', hardwareType],
      stm32cube: ['make', 'all'],
    };

    return commands[platform] || commands.platformio;
  }

  /**
   * Collect build artifacts (HEX, BIN, ELF files)
   */
  async collectArtifacts(buildDir) {
    const artifacts = [];
    const extensions = ['.hex', '.bin', '.elf'];

    async function scanDir(dir) {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          await scanDir(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (extensions.includes(ext)) {
            artifacts.push({
              filename: file,
              path: filePath,
              size: stat.size,
              type: ext.substring(1),
            });
          }
        }
      }
    }

    await scanDir(buildDir);
    return artifacts;
  }

  /**
   * Get build status
   */
  getBuildStatus(buildId) {
    return this.builds.get(buildId);
  }

  /**
   * Get build logs
   */
  getBuildLogs(buildId) {
    const buildInfo = this.builds.get(buildId);
    return buildInfo ? buildInfo.logs.join('\n') : '';
  }
}

module.exports = new BuildService();
