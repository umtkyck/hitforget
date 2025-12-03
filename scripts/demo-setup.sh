#!/bin/bash

# Visucan Virtual Processors - Demo Quick Start
# Bu script tüm demo ortamını otomatik olarak hazırlar

set -e

echo "════════════════════════════════════════════════════════════"
echo "  🚀 Visucan Virtual Processors - Demo Setup"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step counter
STEP=1

# Function to print step
print_step() {
    echo ""
    echo -e "${BLUE}[$STEP/8]${NC} $1"
    ((STEP++))
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check Prerequisites
print_step "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"

# 2. Install Dependencies
print_step "Installing dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Running npm install..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# 3. Environment Variables Check
print_step "Checking environment variables..."

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from .env.example...${NC}"

    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local${NC}"
        echo -e "${YELLOW}⚠️  Please update database credentials in .env.local${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found. Skipping...${NC}"
    fi
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi

# 4. Database Setup
print_step "Setting up database..."

echo "Checking database connection..."
if npm run db:push 2>/dev/null; then
    echo -e "${GREEN}✅ Database schema applied${NC}"
else
    echo -e "${YELLOW}⚠️  Database migration skipped (check connection)${NC}"
    echo "Run manually: npm run db:push"
fi

# 5. Seed Demo Data
print_step "Seeding demo data..."

if [ -f "scripts/seed-virtual-processors.js" ]; then
    echo "Populating virtual processors..."
    if node scripts/seed-virtual-processors.js 2>/dev/null; then
        echo -e "${GREEN}✅ Demo data seeded successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Seeding skipped (database might not be ready)${NC}"
        echo "Run manually: node scripts/seed-virtual-processors.js"
    fi
else
    echo -e "${YELLOW}⚠️  Seed script not found${NC}"
fi

# 6. Build Project
print_step "Building project..."

echo "Running build..."
if npm run build 2>/dev/null; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${YELLOW}⚠️  Build skipped${NC}"
    echo "For development, you can use: npm run dev"
fi

# 7. Check Demo Files
print_step "Verifying demo files..."

DEMO_FILES=(
    "demo/README.md"
    "demo/DEMO-SCRIPT.md"
    "demo/SOCIAL-MEDIA-CONTENT.md"
    "demo/VISUAL-ASSETS-GUIDE.md"
    "demo/arduino-examples/led-blink/led-blink.ino"
    "demo/arduino-examples/interactive-led/interactive-led.ino"
)

ALL_FOUND=true
for file in "${DEMO_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file ${RED}(missing)${NC}"
        ALL_FOUND=false
    fi
done

if [ "$ALL_FOUND" = true ]; then
    echo -e "${GREEN}✅ All demo files present${NC}"
fi

# 8. Generate Summary
print_step "Setup complete!"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ Demo Environment Ready!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1️⃣  Start development server:"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "2️⃣  Open browser:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "3️⃣  Navigate to Virtual Processors:"
echo "   ${BLUE}http://localhost:3000/virtual-processors${NC}"
echo ""
echo "4️⃣  Read demo guide:"
echo "   ${BLUE}cat demo/README.md${NC}"
echo ""
echo "5️⃣  Start video recording:"
echo "   ${BLUE}Follow demo/DEMO-SCRIPT.md${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}📹 Recording Tips:${NC}"
echo "   • Use OBS Studio or Loom"
echo "   • Resolution: 1920x1080, 30fps"
echo "   • Browser: Incognito mode, 100% zoom"
echo "   • Test audio levels before recording"
echo ""
echo -e "${YELLOW}📱 Social Media:${NC}"
echo "   • Twitter: demo/SOCIAL-MEDIA-CONTENT.md (Line 5)"
echo "   • Instagram: demo/SOCIAL-MEDIA-CONTENT.md (Line 120)"
echo "   • YouTube: demo/SOCIAL-MEDIA-CONTENT.md (Line 280)"
echo ""
echo -e "${GREEN}Good luck with your demo! 🚀${NC}"
echo ""
