# Shinigami Companion

A desktop widget for Arch Linux featuring an AI-powered chat interface with an animated shinigami (death deity) companion. The widget sits on your desktop without overlaying windows, providing periodic check-ins and chat capabilities using OpenAI, OpenRouter, or Anthropic APIs.

```
    .:[ SHINIGAMI COMPANION ]:.
    
    [ENTITY: SHINIGAMI.v1]
    [TYPE: OBSERVER]
    [STATUS: WATCHING]
```

## Features

- **Desktop Widget Integration**: Stays on desktop layer, doesn't interfere with other windows
- **Animated 3D Shinigami**: Three.js powered ethereal creature that floats and observes
- **AI Chat Interface**: Chat with your shinigami companion using various AI providers
- **Periodic Check-ins**: Companion asks you questions at random intervals (30-120 minutes)
- **Multiple API Support**: OpenAI, OpenRouter, and Anthropic
- **Persistent Chat History**: Saves conversations between sessions
- **Cyberpunk Aesthetic**: Dark, terminal-inspired UI with magenta/green color scheme
- **Customizable System Prompt**: Define your companion's personality
- **Export Chat History**: Save conversations as JSON

## Prerequisites

### System Requirements
- Arch Linux (or Arch-based distro like Endeavour OS)
- KDE Plasma (recommended) or other desktop environment
- Node.js (v16 or higher)
- npm

### System Tools (for window management)
```bash
sudo pacman -S xdotool wmctrl
```

### API Keys
You'll need at least one API key from:
- **OpenAI**: https://platform.openai.com/api-keys
- **OpenRouter**: https://openrouter.ai/keys
- **Anthropic**: https://console.anthropic.com/settings/keys

## Installation

1. **Clone or extract the application**:
```bash
cd ~/
mkdir -p apps
cd apps
# Copy the shinigami-companion folder here
```

2. **Install dependencies**:
```bash
cd shinigami-companion
npm install
```

3. **Setup desktop integration**:
```bash
npm run setup
```

This will:
- Create a `.desktop` file in `~/.local/share/applications/`
- Generate a helper script for window rules
- Check for required system dependencies

4. **Create an icon (optional)**:
Place a PNG icon at `shinigami-companion/icon.png` (512x512 recommended)

## First Time Setup

1. **Start the application**:
```bash
npm start
```

2. **Configure API Keys**:
   - Click the `[CONF]` button in the top-right
   - Enter at least one API key
   - Click `[SAVE]` for each key you add
   - Select your preferred provider from the dropdown
   - Set your preferred model (e.g., `gpt-4`, `claude-3-opus-20240229`)

3. **Customize System Prompt** (optional):
   - Edit the system prompt to define your companion's personality
   - Default: Shinigami observer character with dark humor

4. **Apply Window Rules**:

   **For KDE Plasma** (after starting the app):
   ```bash
   ./set-window-rules.sh
   ```
   
   Or manually:
   - Right-click window title bar → "More Actions" → "Special Window Settings"
   - Add rules:
     - Window type: Desktop
     - Keep below: Yes
     - Skip taskbar: Yes
     - Skip pager: Yes

   **For other window managers**:
   - Configure window rules to keep the window on desktop layer
   - Example i3 config: `for_window [title="Shinigami Companion"] floating enable, sticky enable`

## Usage

### Chat Interface

- **Send Message**: Type in the input box and press Enter or click `[SEND]`
- **Clear History**: Click `[CLEAR]` (will prompt for confirmation)
- **Export Chat**: Click `[EXPORT]` to save chat as JSON in your home directory
- **Summon Animation**: Click `[SUMMON]` to trigger a dramatic animation

### Status Bar

The top status bar shows:
- **[STATUS]**: READY when API key is configured, or NO API KEY
- **[API]**: Current AI provider (OPENAI, OPENROUTER, ANTHROPIC)
- **[MOOD]**: Current companion state (WATCHFUL, PROCESSING, CURIOUS, etc.)

### Periodic Check-ins

The companion will ask you questions at random intervals between 30-120 minutes:
- "What are you working on right now?"
- "How's your energy level? Need a break?"
- "Discovered anything cool lately?"
- And more...

You can disable periodic notifications in Settings.

### The Shinigami Entity

The right panel displays an animated 3D shinigami creature:
- Floating/breathing motion
- Glowing magenta eyes that pulse
- Ethereal wisps orbiting the entity
- Swaying arms
- Reacts to periodic questions with eye flashing

## Configuration Files

### Chat History
Stored at: `~/.config/shinigami-companion/config.json`

### API Keys
Encrypted and stored securely in the app's data directory

## Autostart (Optional)

To launch automatically on login:

**Method 1: Desktop Entry**
```bash
cp ~/.local/share/applications/shinigami-companion.desktop ~/.config/autostart/
```

**Method 2: KDE Plasma Autostart**
1. System Settings → Startup and Shutdown → Autostart
2. Click "Add" → "Add Application"
3. Select "Shinigami Companion"

**Method 3: Custom Script**
Add to your `.bashrc` or startup script:
```bash
cd ~/apps/shinigami-companion && npm start &
```

## Customization

### Change Colors
Edit `style.css`:
- `#ff00ff` - Magenta (primary accent)
- `#00ff00` - Green (user messages)
- `#00ffff` - Cyan (secondary accent)

### Modify Creature Appearance
Edit the `createShinigami()` function in `renderer.js`:
- Adjust geometries for different shapes
- Change colors via materials
- Add or remove body parts
- Modify wisp count and behavior

### Adjust Check-in Frequency
Edit `main.js`, line ~14:
```javascript
const QUESTION_INTERVALS = [30, 45, 60, 90, 120]; // minutes
```

### Custom Questions
Edit `main.js`, function `sendPeriodicQuestion()`, add to the questions array

## Troubleshooting

### Window Appears Above Other Windows
- Run `./set-window-rules.sh` after starting the app
- Or manually configure window rules in your window manager

### API Errors
- Verify API key is correct
- Check model name matches your provider's available models
- Ensure you have API credits remaining
- Check internet connection

### Transparent Background Issues
- Some window managers may not support transparency
- Try setting `transparent: false` in `main.js` createWindow options

### Electron Not Found
```bash
cd ~/apps/shinigami-companion
npm install
```

### Application Won't Start
Check Node.js version:
```bash
node --version  # Should be v16 or higher
```

Update Node.js if needed:
```bash
sudo pacman -S nodejs npm
```

## Building Distributable Package

Create an AppImage:
```bash
npm run build
```

The built package will be in the `dist/` folder.

## API Provider Notes

### OpenAI
- Models: `gpt-4`, `gpt-4-turbo-preview`, `gpt-3.5-turbo`
- Rate limits apply based on your account tier

### OpenRouter
- Access to multiple models from different providers
- Models: `openai/gpt-4`, `anthropic/claude-3-opus`, etc.
- Pay-per-use pricing

### Anthropic
- Models: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`
- Different pricing tiers

## Architecture

```
shinigami-companion/
├── main.js              # Electron main process
├── renderer.js          # UI logic, Three.js, API calls
├── index.html           # UI structure
├── style.css            # Cyberpunk styling
├── package.json         # Dependencies and scripts
├── setup-desktop.js     # Desktop integration setup
└── set-window-rules.sh  # Window manager helper
```

## Technology Stack

- **Electron**: Desktop application framework
- **Three.js**: 3D graphics for animated creature
- **Node.js HTTPS**: Direct API calls (no external libraries)
- **electron-store**: Persistent configuration storage
- **Pure HTML/CSS/JS**: No frameworks, just vanilla web tech

## Privacy & Security

- All API keys are stored locally on your machine
- Chat history is saved locally only
- No data is sent to third parties except your chosen AI provider
- API keys are never logged or transmitted except to authenticate with providers

## Contributing

This is a personal project, but feel free to:
- Fork and modify for your own use
- Report bugs or issues
- Suggest features
- Share your custom creature designs

## Credits

Created by Splicer for the underground web, e-waste recycling, and hacker communities.

## License

MIT License - Do whatever you want with it.

---

```
[ENTITY: SHINIGAMI.v1]
[STATUS: OBSERVING]
[MESSAGE: May your code compile and your demons stay debugged]
```
