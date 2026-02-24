const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('Setting up Shinigami Companion desktop integration...\n');

// Create .desktop file
const desktopEntry = `[Desktop Entry]
Type=Application
Name=Shinigami Companion
Comment=AI Desktop Companion Widget
Exec=${process.cwd()}/node_modules/.bin/electron ${process.cwd()}
Icon=${process.cwd()}/icon.png
Terminal=false
Categories=Utility;
StartupNotify=false
`;

const desktopPath = path.join(os.homedir(), '.local', 'share', 'applications', 'shinigami-companion.desktop');

// Ensure directory exists
const dir = path.dirname(desktopPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Write desktop file
fs.writeFileSync(desktopPath, desktopEntry);
console.log('✓ Desktop entry created at:', desktopPath);

// Make it executable
try {
    fs.chmodSync(desktopPath, '755');
    console.log('✓ Desktop entry made executable');
} catch (error) {
    console.log('⚠ Could not make desktop entry executable:', error.message);
}

// Create autostart entry (optional)
console.log('\nTo make Shinigami Companion start automatically:');
console.log('1. Copy the desktop file to autostart:');
console.log(`   cp ${desktopPath} ~/.config/autostart/`);
console.log('\n2. Or add it to your window manager startup applications\n');

// KDE Plasma specific instructions
console.log('For KDE Plasma window rules:');
console.log('1. Right-click on the window title bar when app is running');
console.log('2. Select "More Actions" > "Special Window Settings"');
console.log('3. Add these rules:');
console.log('   - Window type: Desktop');
console.log('   - Keep below: Yes');
console.log('   - Skip taskbar: Yes');
console.log('   - Skip pager: Yes\n');

// Create a simple icon if it doesn't exist
const iconPath = path.join(process.cwd(), 'icon.png');
if (!fs.existsSync(iconPath)) {
    console.log('⚠ No icon.png found. Create one at:', iconPath);
    console.log('  Recommended size: 512x512 or 256x256\n');
}

// Create helper script for KDE window rules
const kdeRulesScript = `#!/bin/bash
# Helper script to set window rules via xdotool
# Run this after starting the application

WINDOW_ID=$(xdotool search --name "Shinigami Companion")

if [ -n "$WINDOW_ID" ]; then
    # Set window type to desktop
    xdotool windowtype --type desktop "$WINDOW_ID"
    
    # Set to stay below other windows
    wmctrl -i -r "$WINDOW_ID" -b add,below
    
    echo "Window rules applied to Shinigami Companion"
else
    echo "Shinigami Companion window not found"
fi
`;

const helperScriptPath = path.join(process.cwd(), 'set-window-rules.sh');
fs.writeFileSync(helperScriptPath, kdeRulesScript);
fs.chmodSync(helperScriptPath, '755');
console.log('✓ Helper script created:', helperScriptPath);
console.log('  Run this after starting the app to apply window rules\n');

// Check for required system dependencies
console.log('Checking system dependencies...');
const dependencies = ['xdotool', 'wmctrl'];

dependencies.forEach(dep => {
    try {
        execSync(`which ${dep}`, { stdio: 'ignore' });
        console.log(`✓ ${dep} found`);
    } catch (error) {
        console.log(`✗ ${dep} not found - install with: sudo pacman -S ${dep}`);
    }
});

console.log('\n=== Setup Complete ===');
console.log('Start the application with: npm start');
console.log('Or from your application menu: Shinigami Companion\n');
