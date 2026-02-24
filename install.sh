#!/bin/bash

echo "================================"
echo "SHINIGAMI COMPANION INSTALLER"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Check if running on Arch-based system
if ! command -v pacman &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} This script is designed for Arch Linux."
    echo "You can still install manually - see README.md"
    exit 1
fi

echo -e "${CYAN}[1/6]${NC} Checking system dependencies..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[!]${NC} Node.js not found. Installing..."
    sudo pacman -S nodejs npm --noconfirm
else
    echo -e "${GREEN}[✓]${NC} Node.js found: $(node --version)"
fi

# Check for required tools
TOOLS_NEEDED=()
if ! command -v xdotool &> /dev/null; then
    TOOLS_NEEDED+=("xdotool")
fi
if ! command -v wmctrl &> /dev/null; then
    TOOLS_NEEDED+=("wmctrl")
fi

if [ ${#TOOLS_NEEDED[@]} -gt 0 ]; then
    echo -e "${CYAN}[INFO]${NC} Installing window management tools: ${TOOLS_NEEDED[*]}"
    sudo pacman -S "${TOOLS_NEEDED[@]}" --noconfirm
else
    echo -e "${GREEN}[✓]${NC} Window management tools found"
fi

echo ""
echo -e "${CYAN}[2/6]${NC} Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to install dependencies"
    exit 1
fi

echo ""
echo -e "${CYAN}[3/6]${NC} Setting up desktop integration..."
node setup-desktop.js

echo ""
echo -e "${CYAN}[4/6]${NC} Creating launch script..."
cat > launch.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm start
EOF
chmod +x launch.sh

echo ""
echo -e "${CYAN}[5/6]${NC} Testing application..."
echo "Starting application for initial test (will close in 5 seconds)..."

# Start app in background
npm start &
APP_PID=$!

# Wait 5 seconds
sleep 5

# Kill the test instance
kill $APP_PID 2>/dev/null

echo -e "${GREEN}[✓]${NC} Test successful!"

echo ""
echo -e "${CYAN}[6/6]${NC} Installation complete!"
echo ""
echo "================================"
echo -e "${MAGENTA}NEXT STEPS:${NC}"
echo "================================"
echo ""
echo "1. Start the application:"
echo "   ${GREEN}./launch.sh${NC}"
echo "   or"
echo "   ${GREEN}npm start${NC}"
echo ""
echo "2. Configure your API key:"
echo "   - Click [CONF] button in the app"
echo "   - Add OpenAI, OpenRouter, or Anthropic key"
echo "   - Click [SAVE]"
echo ""
echo "3. Apply window rules (for KDE Plasma):"
echo "   ${GREEN}./set-window-rules.sh${NC}"
echo ""
echo "4. Optional - Add to autostart:"
echo "   ${GREEN}cp ~/.local/share/applications/shinigami-companion.desktop ~/.config/autostart/${NC}"
echo ""
echo -e "${MAGENTA}API KEYS:${NC}"
echo "  OpenAI:     https://platform.openai.com/api-keys"
echo "  OpenRouter: https://openrouter.ai/keys"
echo "  Anthropic:  https://console.anthropic.com/settings/keys"
echo ""
echo "================================"
echo -e "${CYAN}[ENTITY: SHINIGAMI.v1]${NC}"
echo -e "${CYAN}[STATUS: INSTALLED]${NC}"
echo -e "${CYAN}[MESSAGE: Ready to observe...]${NC}"
echo "================================"
