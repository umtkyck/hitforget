#!/bin/bash
# Visucan Deployment Script

set -e

echo "🚀 Starting Visucan deployment..."

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN is not set"
  exit 1
fi

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

# Deploy to Vercel
echo "📤 Deploying frontend to Vercel..."
vercel --token="$VERCEL_TOKEN" --prod --yes

# Deploy device backend (if using Railway/Fly.io)
if [ -n "$RAILWAY_TOKEN" ]; then
  echo "📤 Deploying device backend to Railway..."
  # railway up --service device-backend
  echo "ℹ️  Railway deployment requires Railway CLI"
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run database migrations: npm run db:migrate"
echo "2. Set up environment variables in Vercel dashboard"
echo "3. Configure Vercel Postgres and KV"
echo "4. Test the deployment"
