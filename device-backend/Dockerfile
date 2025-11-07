# Device Backend Dockerfile
FROM node:20-alpine

# Install system dependencies for hardware access
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers \
    eudev-dev \
    libusb-dev

WORKDIR /app

# Copy package files
COPY device-backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY device-backend/ .

# Create directories for logs and artifacts
RUN mkdir -p /app/logs /app/artifacts

# Expose ports
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Run the application
CMD ["node", "index.js"]
