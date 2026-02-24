# ADVANCED CONFIGURATION GUIDE

This guide covers advanced customization options for power users who want to deeply modify the Shinigami Companion.

## Table of Contents
1. [Creature Customization](#creature-customization)
2. [UI Theme Modification](#ui-theme-modification)
3. [API Configuration](#api-configuration)
4. [Window Management](#window-management)
5. [Performance Tuning](#performance-tuning)
6. [Security Hardening](#security-hardening)
7. [Integration with Other Tools](#integration)

---

## Creature Customization

### Modifying the Shinigami Entity

Edit `renderer.js`, function `createShinigami()`:

#### Change Head Shape
```javascript
// Current: Elongated sphere
const headGeometry = new THREE.SphereGeometry(1.2, 16, 16);
headGeometry.scale(1, 1.3, 0.9);

// Alternative 1: Cubic skull
const headGeometry = new THREE.BoxGeometry(1.5, 1.8, 1.2);

// Alternative 2: More spherical
const headGeometry = new THREE.SphereGeometry(1.4, 20, 20);
```

#### Change Eye Color
```javascript
// Current: Magenta
const eyeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    emissive: 0xff00ff,
    emissiveIntensity: 2
});

// Alternative: Cyan
color: 0x00ffff,
emissive: 0x00ffff,

// Alternative: Red (classic demon)
color: 0xff0000,
emissive: 0xff0000,
```

#### Add More Body Parts

Add wings:
```javascript
// In createShinigami(), after creating the arms:

// Wings
const wingGeometry = new THREE.ConeGeometry(0.1, 2, 4);
wingGeometry.rotateZ(Math.PI / 2);

const wingMaterial = new THREE.MeshPhongMaterial({
    color: 0x0a0a0a,
    emissive: 0x440044,
    transparent: true,
    opacity: 0.6
});

const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
leftWing.position.set(-1.8, 1.5, -0.5);
leftWing.rotation.y = -0.5;
group.add(leftWing);

const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
rightWing.position.set(1.8, 1.5, -0.5);
rightWing.rotation.y = 0.5;
group.add(rightWing);

// Store references for animation
group.userData.leftWing = leftWing;
group.userData.rightWing = rightWing;
```

Then animate them in the `animate()` function:
```javascript
// Wing flap
if (state.shinigami.userData.leftWing && state.shinigami.userData.rightWing) {
    state.shinigami.userData.leftWing.rotation.y = -0.5 + Math.sin(time * 3) * 0.3;
    state.shinigami.userData.rightWing.rotation.y = 0.5 - Math.sin(time * 3) * 0.3;
}
```

#### Adjust Wisps

```javascript
// Current: 8 wisps
for (let i = 0; i < 8; i++) {

// More wisps: Change to 16 or 24
for (let i = 0; i < 16; i++) {

// Change wisp color
const wispMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff, // Changed from magenta to cyan
    transparent: true,
    opacity: 0.4
});
```

### Add Particle Effects

In `createParticles()`:

```javascript
// More particles
const particleCount = 200; // Changed from 100

// Colored particles
const colors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
    colors[i] = Math.random();     // R
    colors[i + 1] = 0;              // G
    colors[i + 2] = Math.random();  // B
}
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true, // Enable vertex colors
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
```

---

## UI Theme Modification

### Color Schemes

Edit `style.css`:

#### Cyberpunk Green (Matrix Style)
```css
:root {
    --primary: #00ff00;
    --secondary: #00aa00;
    --accent: #88ff88;
    --bg-dark: #000000;
    --bg-medium: #001100;
}

/* Apply to borders */
border: 2px solid var(--primary);
```

#### Blood Red (Darker Theme)
```css
:root {
    --primary: #ff0000;
    --secondary: #aa0000;
    --accent: #ff6666;
    --bg-dark: #000000;
    --bg-medium: #110000;
}
```

#### Retro Amber Terminal
```css
:root {
    --primary: #ffb000;
    --secondary: #ff8800;
    --accent: #ffcc66;
    --bg-dark: #000000;
    --bg-medium: #1a1000;
}
```

### Font Changes

```css
body {
    font-family: 'Fira Code', 'Courier New', monospace;
    /* Or try: */
    font-family: 'JetBrains Mono', monospace;
    font-family: 'IBM Plex Mono', monospace;
    font-family: 'Source Code Pro', monospace;
}
```

Install fonts on Arch:
```bash
sudo pacman -S ttf-fira-code ttf-jetbrains-mono ttf-ibm-plex
```

### Add Scanlines Effect

Add to `#chat-panel::before`:
```css
#chat-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255, 0, 255, 0.03) 2px,
        rgba(255, 0, 255, 0.03) 4px
    );
    pointer-events: none;
    z-index: 1;
    animation: scanline 8s linear infinite;
}

@keyframes scanline {
    0% { transform: translateY(0); }
    100% { transform: translateY(100%); }
}
```

### Custom Background Patterns

Replace solid background with pattern:
```css
#chat-panel {
    background: 
        repeating-linear-gradient(
            90deg,
            #0a0a0a,
            #0a0a0a 2px,
            #000000 2px,
            #000000 4px
        );
}
```

---

## API Configuration

### Custom API Endpoints

For self-hosted models, modify the API call functions in `renderer.js`:

```javascript
// Custom endpoint for local LLM
function callLocalLLM(apiKey, messages) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            messages: messages,
            temperature: 0.8,
            max_tokens: 1024
        });
        
        const options = {
            hostname: 'localhost', // Your server
            port: 5000,            // Your port
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        // ... rest of request logic
    });
}
```

Add to provider switch:
```javascript
case 'local':
    return await callLocalLLM(apiKey, messages);
```

### Rate Limiting

Add rate limiting to prevent API overuse:

```javascript
// At top of renderer.js
const rateLimiter = {
    lastCall: 0,
    minInterval: 3000, // 3 seconds between calls
    
    canCall() {
        const now = Date.now();
        if (now - this.lastCall < this.minInterval) {
            return false;
        }
        this.lastCall = now;
        return true;
    }
};

// In processAIResponse()
if (!rateLimiter.canCall()) {
    showSystemMessage('Please wait before sending another message');
    return;
}
```

### Retry Logic

Add automatic retry for failed requests:

```javascript
async function callAIWithRetry(userMessage, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await callAI(userMessage);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

---

## Window Management

### Custom Window Rules for Different WMs

#### i3wm
Add to `~/.config/i3/config`:
```
for_window [title="Shinigami Companion"] floating enable
for_window [title="Shinigami Companion"] sticky enable
for_window [title="Shinigami Companion"] move position 100px 100px
```

#### Sway
Add to `~/.config/sway/config`:
```
for_window [title="Shinigami Companion"] floating enable
for_window [title="Shinigami Companion"] sticky enable
```

#### bspwm
Add to `~/.config/bspwm/bspwmrc`:
```bash
bspc rule -a "Shinigami Companion" state=floating sticky=on
```

#### Openbox
Add to `~/.config/openbox/rc.xml`:
```xml
<application name="Shinigami Companion">
  <decor>no</decor>
  <layer>below</layer>
  <desktop>all</desktop>
</application>
```

### Multi-Monitor Setup

Modify `main.js` to position on specific monitor:

```javascript
const { screen } = require('electron');

function createWindow() {
    const displays = screen.getAllDisplays();
    const primaryDisplay = displays[0]; // Or choose specific display
    
    mainWindow = new BrowserWindow({
        x: primaryDisplay.bounds.x + 100,
        y: primaryDisplay.bounds.y + 100,
        // ... rest of config
    });
}
```

---

## Performance Tuning

### Reduce Rendering Load

```javascript
// In animate() function, reduce render frequency
let lastRender = 0;
const renderInterval = 1000 / 30; // 30 FPS instead of 60

function animate() {
    state.animationFrame = requestAnimationFrame(animate);
    
    const now = Date.now();
    if (now - lastRender < renderInterval) return;
    lastRender = now;
    
    // ... rest of animation code
}
```

### Optimize Particle Count

```javascript
// Reduce particles on lower-end systems
const particleCount = 50; // Instead of 100
```

### Disable Shadows

```javascript
// In createShinigami(), remove or comment out point lights
// Or reduce intensity:
const pointLight1 = new THREE.PointLight(0xff00ff, 1, 15); // Reduced from 2, 20
```

---

## Security Hardening

### Encrypt API Keys at Rest

Add encryption to electron-store:

```javascript
const Store = require('electron-store');
const crypto = require('crypto');

const store = new Store({
    encryptionKey: 'your-encryption-key-here' // Change this!
});
```

### Sandbox Rendering

Add to BrowserWindow options in `main.js`:

```javascript
webPreferences: {
    nodeIntegration: false, // Disable node integration
    contextIsolation: true, // Enable context isolation
    sandbox: true,          // Enable sandboxing
    preload: path.join(__dirname, 'preload.js')
}
```

Then create `preload.js` for safe IPC.

### Input Sanitization

```javascript
function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove HTML brackets
        .slice(0, 2000);      // Limit length
}

function sendMessage() {
    const message = sanitizeInput(input.value);
    // ... rest of logic
}
```

---

## Integration with Other Tools

### Desktop Notifications

Enhance notifications with custom icons and actions:

```javascript
const notification = new Notification({
    title: 'Shinigami Companion',
    body: question,
    icon: path.join(__dirname, 'icon.png'),
    silent: false,
    actions: [
        { type: 'button', text: 'Reply' },
        { type: 'button', text: 'Dismiss' }
    ]
});

notification.on('action', (event, index) => {
    if (index === 0) {
        // Focus window for reply
        mainWindow.show();
        mainWindow.focus();
    }
});
```

### System Tray Integration

Add tray icon to `main.js`:

```javascript
const { Tray, Menu } = require('electron');
let tray = null;

app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, 'icon.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: () => mainWindow.show() },
        { label: 'Hide', click: () => mainWindow.hide() },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);
    
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Shinigami Companion');
});
```

### Export to Markdown

Add export option:

```javascript
function exportAsMarkdown() {
    const fs = require('fs');
    const os = require('os');
    
    let markdown = '# Shinigami Companion Chat Log\n\n';
    markdown += `Exported: ${new Date().toLocaleString()}\n\n`;
    markdown += '---\n\n';
    
    state.chatHistory.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const role = msg.role === 'user' ? 'You' : 'Shinigami';
        markdown += `**[${time}] ${role}:** ${msg.content}\n\n`;
    });
    
    const filename = `shinigami-chat-${Date.now()}.md`;
    const filepath = path.join(os.homedir(), filename);
    
    fs.writeFileSync(filepath, markdown);
    showSystemMessage(`Chat exported to: ${filepath}`);
}
```

### Voice Input (Future Enhancement)

Framework for adding voice:

```javascript
// Would require additional dependencies
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('chat-input').value = transcript;
    sendMessage();
};

// Add button to activate
<button onclick="recognition.start()">🎤</button>
```

---

## Debugging

### Enable Developer Tools

In `main.js`, add:

```javascript
mainWindow.webContents.openDevTools({ mode: 'detach' });
```

### Verbose Logging

Add to `renderer.js`:

```javascript
const DEBUG = true;

function log(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
    }
}

// Use throughout code
log('Sending message:', message);
log('API response:', response);
```

### Performance Monitoring

```javascript
function measurePerformance(fn, label) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
}

// Usage
const response = await measurePerformance(
    () => callAI(userMessage),
    'API Call'
);
```

---

## Additional Resources

- Three.js Documentation: https://threejs.org/docs/
- Electron API Docs: https://www.electronjs.org/docs/latest/
- KDE Window Rules: https://userbase.kde.org/Window-specific_Settings
- OpenAI API: https://platform.openai.com/docs/
- Anthropic API: https://docs.anthropic.com/

---

**REMEMBER**: Always test changes incrementally. Back up your configuration before making major modifications.
