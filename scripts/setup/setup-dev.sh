#!/bin/bash
# Development Environment Setup Script

set -e

echo "🔧 Setting up HitForget development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker is not installed"
  echo "Please install Docker: https://docs.docker.com/get-docker/"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "❌ Error: Docker Compose is not installed"
  echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your credentials"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p device-backend/logs
mkdir -p device-backend/artifacts
mkdir -p artifacts
mkdir -p uploads
mkdir -p videos

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:generate
npm run db:migrate

echo ""
echo "✅ Development environment setup completed!"
echo ""
echo "To start the development server:"
echo "  Frontend: npm run dev"
echo "  Device Backend: cd device-backend && npm run dev"
echo "  All services: docker-compose up"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Device Backend: http://localhost:3001"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
