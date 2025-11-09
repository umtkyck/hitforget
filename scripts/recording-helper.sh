#!/bin/bash

# HitForget Virtual Processors - Video Recording Helper
# Bu script video kaydı için tarayıcıyı ve ortamı hazırlar

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}║   📹 HitForget Virtual Processors                      ║${NC}"
echo -e "${CYAN}║      Video Recording Helper                            ║${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
echo -e "${BLUE}[1/6]${NC} Checking if development server is running..."

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running at http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Server not running!${NC}"
    echo ""
    echo "Please start the server first:"
    echo -e "  ${CYAN}npm run dev${NC}"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Display demo URLs
echo ""
echo -e "${BLUE}[2/6]${NC} Demo URLs ready:"
echo -e "  ${GREEN}✓${NC} Marketplace:      ${CYAN}http://localhost:3000/virtual-processors${NC}"
echo -e "  ${GREEN}✓${NC} Instances:        ${CYAN}http://localhost:3000/virtual-instances${NC}"
echo -e "  ${GREEN}✓${NC} Demo Script:      ${CYAN}demo/DEMO-SCRIPT.md${NC}"

# Recording software check
echo ""
echo -e "${BLUE}[3/6]${NC} Screen recording software:"
echo ""
echo "Recommended tools:"
echo -e "  ${GREEN}•${NC} OBS Studio      (Free, professional) - ${CYAN}https://obsproject.com${NC}"
echo -e "  ${GREEN}•${NC} Loom            (Easy, cloud-based)  - ${CYAN}https://loom.com${NC}"
echo -e "  ${GREEN}•${NC} QuickTime       (Mac built-in)"
echo -e "  ${GREEN}•${NC} Xbox Game Bar   (Windows built-in)"
echo ""

read -p "$(echo -e ${YELLOW}"Do you have screen recording software ready? (y/n): "${NC})" RECORDING_READY

if [[ ! "$RECORDING_READY" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${RED}Please install screen recording software first.${NC}"
    echo "Recommended: OBS Studio (free and professional)"
    exit 1
fi

# Recording settings reminder
echo ""
echo -e "${BLUE}[4/6]${NC} Recommended recording settings:"
echo ""
echo -e "  ${CYAN}Resolution:${NC}    1920x1080 (Full HD)"
echo -e "  ${CYAN}Frame Rate:${NC}   30 FPS"
echo -e "  ${CYAN}Format:${NC}       MP4 (H.264)"
echo -e "  ${CYAN}Audio:${NC}        44.1kHz, enable microphone"
echo ""

# Browser setup
echo -e "${BLUE}[5/6]${NC} Browser setup instructions:"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC} Follow these steps before recording:"
echo ""
echo "  1. Open browser in INCOGNITO/PRIVATE mode"
echo "  2. Set zoom to 100% (Cmd/Ctrl + 0)"
echo "  3. Clear cache and cookies"
echo "  4. Disable browser extensions"
echo "  5. Enable Do Not Disturb mode on computer"
echo "  6. Close unnecessary tabs and windows"
echo ""

read -p "$(echo -e ${YELLOW}"Browser ready in incognito mode? (y/n): "${NC})" BROWSER_READY

if [[ ! "$BROWSER_READY" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Please prepare your browser first, then run again.${NC}"
    exit 1
fi

# Pre-recording checklist
echo ""
echo -e "${BLUE}[6/6]${NC} Pre-recording checklist:"
echo ""

CHECKLIST=(
    "Microphone tested (audio levels good)"
    "Demo script reviewed (demo/DEMO-SCRIPT.md)"
    "Quiet environment (no background noise)"
    "Good lighting (if showing face)"
    "Phone on silent mode"
    "Notifications disabled"
    "Water ready (avoid dry mouth)"
    "Relaxed and ready to record"
)

for item in "${CHECKLIST[@]}"; do
    echo -e "  ${YELLOW}☐${NC} $item"
done

echo ""
read -p "$(echo -e ${GREEN}"All items checked? Ready to record? (y/n): "${NC})" READY

if [[ ! "$READY" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Take your time to prepare. Good luck!${NC}"
    exit 0
fi

# Final instructions
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎬 Ready to Record!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Recording Flow:${NC}"
echo ""
echo "  1. Start screen recording"
echo "  2. Navigate to: http://localhost:3000/virtual-processors"
echo "  3. Follow demo/DEMO-SCRIPT.md step by step"
echo "  4. Expected duration: 3-5 minutes"
echo ""
echo -e "${CYAN}Pro Tips:${NC}"
echo ""
echo "  • Speak slowly and clearly"
echo "  • Pause 2 seconds after each major action"
echo "  • Move cursor deliberately (not too fast)"
echo "  • Don't worry about mistakes (you'll edit later)"
echo "  • Record 2-3 takes, pick the best one"
echo ""
echo -e "${YELLOW}Remember:${NC} First take is rarely perfect. That's OK!"
echo ""
echo -e "${GREEN}Good luck! You've got this! 🎥✨${NC}"
echo ""

# Open demo script
if command -v cat > /dev/null 2>&1; then
    echo -e "${BLUE}Demo Script Preview (first 20 lines):${NC}"
    echo ""
    echo "────────────────────────────────────────────────────────"
    head -n 20 demo/DEMO-SCRIPT.md
    echo "..."
    echo "────────────────────────────────────────────────────────"
    echo ""
    echo -e "${CYAN}Full script:${NC} demo/DEMO-SCRIPT.md"
fi

# Optional: Open URLs in browser
echo ""
read -p "$(echo -e ${YELLOW}"Open demo URLs in browser now? (y/n): "${NC})" OPEN_BROWSER

if [[ "$OPEN_BROWSER" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}Opening URLs...${NC}"

    # Detect OS and open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "http://localhost:3000/virtual-processors"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "http://localhost:3000/virtual-processors" 2>/dev/null || echo "Please open manually"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start "http://localhost:3000/virtual-processors"
    fi

    sleep 2
fi

echo ""
echo -e "${GREEN}✅ Everything ready. Start recording when you're ready!${NC}"
echo ""
echo "Press Ctrl+C when done with recording session."
echo ""

# Keep script running to maintain context
while true; do
    sleep 60
done
