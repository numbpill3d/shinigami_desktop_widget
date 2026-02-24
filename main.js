const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// Periodic question intervals (in minutes)
const QUESTION_INTERVALS = [30, 45, 60, 90, 120];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        x: 100,
        y: 100,
        frame: false,
        transparent: true,
        resizable: true,
        skipTaskbar: true,
        type: 'desktop', // This makes it behave like a desktop widget
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setAlwaysOnBottom(true); // Keep it below all windows but above desktop

    // Make window stick to desktop on KDE Plasma
    if (process.platform === 'linux') {
        mainWindow.webContents.executeJavaScript(`
            const { exec } = require('child_process');
            exec('xdotool search --name "Shinigami Companion" windowtype --add desktop', (err) => {
                if (err) console.error('Could not set window type:', err);
            });
        `);
    }

    // Schedule periodic questions
    scheduleNextQuestion();
}

function scheduleNextQuestion() {
    const interval = QUESTION_INTERVALS[Math.floor(Math.random() * QUESTION_INTERVALS.length)];
    const milliseconds = interval * 60 * 1000;
    
    setTimeout(() => {
        sendPeriodicQuestion();
        scheduleNextQuestion();
    }, milliseconds);
}

function sendPeriodicQuestion() {
    const questions = [
        "What are you working on right now?",
        "How's your energy level? Need a break?",
        "Anything interesting happen today?",
        "What's on your mind?",
        "Discovered anything cool lately?",
        "How's the flow state?",
        "Need me to look something up for you?",
        "Time for coffee... or something stronger?",
        "What rabbit hole are you diving into?",
        "Still breathing? Just checking.",
        "Any demons to debug?",
        "What's the vibe right now?",
        "Feeling stuck on something?",
        "Want to talk through an idea?"
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    // Send notification
    new Notification({
        title: 'Shinigami Companion',
        body: question,
        silent: false
    }).show();
    
    // Send to renderer process
    if (mainWindow) {
        mainWindow.webContents.send('periodic-question', question);
    }
}

// IPC Handlers
ipcMain.on('save-api-key', (event, data) => {
    store.set(`apiKeys.${data.provider}`, data.key);
    event.reply('api-key-saved', { success: true, provider: data.provider });
});

ipcMain.on('get-api-keys', (event) => {
    const keys = {
        openai: store.get('apiKeys.openai', ''),
        openrouter: store.get('apiKeys.openrouter', ''),
        anthropic: store.get('apiKeys.anthropic', '')
    };
    event.reply('api-keys-loaded', keys);
});

ipcMain.on('save-chat-history', (event, history) => {
    store.set('chatHistory', history);
});

ipcMain.on('load-chat-history', (event) => {
    const history = store.get('chatHistory', []);
    event.reply('chat-history-loaded', history);
});

ipcMain.on('clear-chat-history', (event) => {
    store.set('chatHistory', []);
    event.reply('chat-history-cleared');
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
