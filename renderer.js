const { ipcRenderer } = require('electron');
const { remote } = require('electron');
const https = require('https');

// State Management
const state = {
    apiKeys: {
        openai: '',
        openrouter: '',
        anthropic: ''
    },
    currentProvider: 'openai',
    currentModel: 'gpt-4',
    systemPrompt: '',
    chatHistory: [],
    isProcessing: false,
    scene: null,
    camera: null,
    renderer: null,
    shinigami: null,
    animationFrame: null,
    startTime: Date.now()
};

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initEventListeners();
    loadSettings();
    loadChatHistory();
    startUptime();
    animate();
});

// ============================================
// THREE.JS CREATURE ANIMATION
// ============================================

function initThreeJS() {
    const canvas = document.getElementById('creature-canvas');
    const container = document.getElementById('creature-panel');
    
    // Scene setup
    state.scene = new THREE.Scene();
    state.scene.fog = new THREE.Fog(0x000000, 5, 15);
    
    // Camera setup
    state.camera = new THREE.PerspectiveCamera(
        60,
        container.offsetWidth / container.offsetHeight,
        0.1,
        1000
    );
    state.camera.position.z = 8;
    state.camera.position.y = 2;
    
    // Renderer setup
    state.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    state.renderer.setSize(container.offsetWidth, container.offsetHeight);
    state.renderer.setClearColor(0x000000, 0);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x440044, 0.3);
    state.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xff00ff, 2, 20);
    pointLight1.position.set(3, 3, 3);
    state.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 1.5, 15);
    pointLight2.position.set(-3, 2, 2);
    state.scene.add(pointLight2);
    
    // Create Shinigami Entity
    createShinigami();
    
    // Add floating particles
    createParticles();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createShinigami() {
    const group = new THREE.Group();
    
    // Head - elongated skull-like shape
    const headGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    headGeometry.scale(1, 1.3, 0.9);
    const headMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a0a1a,
        shininess: 30,
        emissive: 0x440044,
        emissiveIntensity: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3;
    group.add(head);
    
    // Eyes - glowing orbs
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 2
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.35, 3.2, 0.9);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.35, 3.2, 0.9);
    group.add(rightEye);
    
    // Eye glow
    const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.3
    });
    
    const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    leftGlow.position.copy(leftEye.position);
    group.add(leftGlow);
    
    const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    rightGlow.position.copy(rightEye.position);
    group.add(rightGlow);
    
    // Torso - dark ethereal form
    const torsoGeometry = new THREE.CylinderGeometry(0.8, 1.2, 2.5, 8);
    const torsoMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a0a0a,
        shininess: 20,
        emissive: 0x220022,
        transparent: true,
        opacity: 0.9
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 1;
    group.add(torso);
    
    // Shoulders/Arms
    const shoulderGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const shoulderMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a0a1a,
        emissive: 0x330033
    });
    
    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.set(-1.3, 1.8, 0);
    group.add(leftShoulder);
    
    const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    rightShoulder.position.set(1.3, 1.8, 0);
    group.add(rightShoulder);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.25, 0.2, 2, 8);
    const armMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a0a0a,
        emissive: 0x220022
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.3, 0.5, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.3, 0.5, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);
    
    // Claws/Hands
    const clawGeometry = new THREE.ConeGeometry(0.15, 0.8, 4);
    const clawMaterial = new THREE.MeshPhongMaterial({
        color: 0x440044,
        emissive: 0xff00ff,
        emissiveIntensity: 0.3
    });
    
    const leftClaw = new THREE.Mesh(clawGeometry, clawMaterial);
    leftClaw.position.set(-1.5, -0.5, 0);
    leftClaw.rotation.z = Math.PI;
    group.add(leftClaw);
    
    const rightClaw = new THREE.Mesh(clawGeometry, clawMaterial);
    rightClaw.position.set(1.5, -0.5, 0);
    rightClaw.rotation.z = Math.PI;
    group.add(rightClaw);
    
    // Ethereal wisps around the entity
    for (let i = 0; i < 8; i++) {
        const wispGeometry = new THREE.SphereGeometry(0.1, 6, 6);
        const wispMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.4
        });
        const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
        
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2.5;
        wisp.position.x = Math.cos(angle) * radius;
        wisp.position.y = 2 + Math.sin(i) * 0.5;
        wisp.position.z = Math.sin(angle) * radius;
        
        wisp.userData = {
            angle: angle,
            radius: radius,
            speed: 0.5 + Math.random() * 0.5,
            yOffset: Math.sin(i) * 0.5
        };
        
        group.add(wisp);
    }
    
    // Store references
    group.userData = {
        head: head,
        leftEye: leftEye,
        rightEye: rightEye,
        leftGlow: leftGlow,
        rightGlow: rightGlow,
        leftArm: leftArm,
        rightArm: rightArm,
        wisps: []
    };
    
    group.traverse((child) => {
        if (child.isMesh && child.geometry.type === 'SphereGeometry' && 
            child.material.transparent && child.material.opacity < 0.5) {
            group.userData.wisps.push(child);
        }
    });
    
    state.scene.add(group);
    state.shinigami = group;
}

function createParticles() {
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff00ff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    state.scene.add(particleSystem);
    state.particleSystem = particleSystem;
}

function animate() {
    state.animationFrame = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    if (state.shinigami) {
        // Gentle floating motion
        state.shinigami.position.y = Math.sin(time * 0.5) * 0.3;
        
        // Slow rotation
        state.shinigami.rotation.y = Math.sin(time * 0.2) * 0.2;
        
        // Head tilt
        if (state.shinigami.userData.head) {
            state.shinigami.userData.head.rotation.z = Math.sin(time * 0.8) * 0.1;
        }
        
        // Eye glow pulse
        if (state.shinigami.userData.leftGlow && state.shinigami.userData.rightGlow) {
            const glowIntensity = 0.2 + Math.sin(time * 2) * 0.1;
            state.shinigami.userData.leftGlow.scale.setScalar(1 + glowIntensity);
            state.shinigami.userData.rightGlow.scale.setScalar(1 + glowIntensity);
        }
        
        // Arm sway
        if (state.shinigami.userData.leftArm && state.shinigami.userData.rightArm) {
            state.shinigami.userData.leftArm.rotation.z = 0.3 + Math.sin(time * 0.7) * 0.2;
            state.shinigami.userData.rightArm.rotation.z = -0.3 - Math.sin(time * 0.7) * 0.2;
        }
        
        // Animate wisps
        if (state.shinigami.userData.wisps) {
            state.shinigami.userData.wisps.forEach((wisp) => {
                if (wisp.userData) {
                    wisp.userData.angle += 0.01 * wisp.userData.speed;
                    wisp.position.x = Math.cos(wisp.userData.angle) * wisp.userData.radius;
                    wisp.position.z = Math.sin(wisp.userData.angle) * wisp.userData.radius;
                    wisp.position.y = 2 + wisp.userData.yOffset + Math.sin(time * 2 + wisp.userData.angle) * 0.3;
                }
            });
        }
    }
    
    // Rotate particle system
    if (state.particleSystem) {
        state.particleSystem.rotation.y = time * 0.05;
        state.particleSystem.rotation.x = time * 0.03;
    }
    
    state.renderer.render(state.scene, state.camera);
}

function onWindowResize() {
    const container = document.getElementById('creature-panel');
    state.camera.aspect = container.offsetWidth / container.offsetHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(container.offsetWidth, container.offsetHeight);
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Window controls
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('minimize-btn').addEventListener('click', () => {
        remote.getCurrentWindow().minimize();
    });
    document.getElementById('close-btn').addEventListener('click', () => {
        remote.getCurrentWindow().close();
    });
    
    // Chat input
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Quick actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Settings modal
    document.querySelector('.close-modal').addEventListener('click', closeSettings);
    document.getElementById('settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
            closeSettings();
        }
    });
    
    // Save API keys
    document.querySelectorAll('.save-key-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const provider = e.target.dataset.provider;
            saveApiKey(provider);
        });
    });
    
    // Provider and model changes
    document.getElementById('provider-select').addEventListener('change', (e) => {
        state.currentProvider = e.target.value;
        updateStatusBar();
    });
    
    document.getElementById('model-input').addEventListener('change', (e) => {
        state.currentModel = e.target.value;
    });
    
    document.getElementById('system-prompt').addEventListener('change', (e) => {
        state.systemPrompt = e.target.value;
    });
    
    // IPC listeners
    ipcRenderer.on('periodic-question', (event, question) => {
        handlePeriodicQuestion(question);
    });
    
    ipcRenderer.on('api-key-saved', (event, data) => {
        showSystemMessage(`API key saved for ${data.provider}`);
    });
    
    ipcRenderer.on('api-keys-loaded', (event, keys) => {
        state.apiKeys = keys;
        document.getElementById('openai-key').value = keys.openai || '';
        document.getElementById('openrouter-key').value = keys.openrouter || '';
        document.getElementById('anthropic-key').value = keys.anthropic || '';
        updateStatusBar();
    });
    
    ipcRenderer.on('chat-history-loaded', (event, history) => {
        state.chatHistory = history;
        renderChatHistory();
    });
    
    ipcRenderer.on('chat-history-cleared', () => {
        state.chatHistory = [];
        document.getElementById('chat-messages').innerHTML = '';
        showSystemMessage(':: CHAT HISTORY CLEARED ::');
    });
}

// ============================================
// CHAT FUNCTIONALITY
// ============================================

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || state.isProcessing) return;
    
    // Add user message
    addMessage('user', message);
    input.value = '';
    
    // Process with AI
    processAIResponse(message);
}

function addMessage(role, content, isSystem = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    if (isSystem) {
        messageDiv.className = 'message system-message';
    } else {
        messageDiv.className = `message ${role}-message`;
    }
    
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    
    const text = document.createElement('span');
    text.className = 'message-text';
    text.textContent = content;
    
    messageDiv.appendChild(timestamp);
    messageDiv.appendChild(text);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to history if not system message
    if (!isSystem) {
        state.chatHistory.push({ role, content, timestamp: Date.now() });
        ipcRenderer.send('save-chat-history', state.chatHistory);
    }
}

function showSystemMessage(message) {
    addMessage('system', message, true);
}

async function processAIResponse(userMessage) {
    if (!state.apiKeys[state.currentProvider]) {
        showSystemMessage('ERROR: No API key set for ' + state.currentProvider);
        return;
    }
    
    state.isProcessing = true;
    updateMood('PROCESSING');
    
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.innerHTML = '<span class="timestamp">[AI]</span><span class="message-text loading">thinking</span>';
    document.getElementById('chat-messages').appendChild(loadingDiv);
    
    try {
        const response = await callAI(userMessage);
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Add AI response
        addMessage('ai', response);
        updateMood('WATCHFUL');
        
    } catch (error) {
        loadingDiv.remove();
        showSystemMessage(`ERROR: ${error.message}`);
        updateMood('ERROR');
    } finally {
        state.isProcessing = false;
    }
}

async function callAI(userMessage) {
    const provider = state.currentProvider;
    const apiKey = state.apiKeys[provider];
    
    // Build messages array
    const messages = [];
    
    // Add system prompt if exists
    if (state.systemPrompt) {
        messages.push({ role: 'system', content: state.systemPrompt });
    }
    
    // Add recent chat history (last 10 messages)
    const recentHistory = state.chatHistory.slice(-10).filter(msg => msg.role !== 'system');
    messages.push(...recentHistory.map(msg => ({ role: msg.role, content: msg.content })));
    
    // Add current message
    messages.push({ role: 'user', content: userMessage });
    
    // Call appropriate API
    switch (provider) {
        case 'openai':
            return await callOpenAI(apiKey, messages);
        case 'openrouter':
            return await callOpenRouter(apiKey, messages);
        case 'anthropic':
            return await callAnthropic(apiKey, messages);
        default:
            throw new Error('Unknown provider');
    }
}

function callOpenAI(apiKey, messages) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: state.currentModel || 'gpt-4',
            messages: messages,
            temperature: 0.8
        });
        
        const options = {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': data.length
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(responseData);
                    if (json.error) {
                        reject(new Error(json.error.message));
                    } else {
                        resolve(json.choices[0].message.content);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callOpenRouter(apiKey, messages) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: state.currentModel || 'openai/gpt-4',
            messages: messages
        });
        
        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://github.com/shinigami-companion',
                'X-Title': 'Shinigami Companion',
                'Content-Length': data.length
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(responseData);
                    if (json.error) {
                        reject(new Error(json.error.message));
                    } else {
                        resolve(json.choices[0].message.content);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function callAnthropic(apiKey, messages) {
    return new Promise((resolve, reject) => {
        // Extract system message if present
        let systemMessage = '';
        const userMessages = messages.filter(msg => {
            if (msg.role === 'system') {
                systemMessage = msg.content;
                return false;
            }
            return true;
        });
        
        const data = JSON.stringify({
            model: state.currentModel || 'claude-3-opus-20240229',
            messages: userMessages,
            system: systemMessage,
            max_tokens: 1024
        });
        
        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Length': data.length
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(responseData);
                    if (json.error) {
                        reject(new Error(json.error.message));
                    } else {
                        resolve(json.content[0].text);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function handleQuickAction(action) {
    switch (action) {
        case 'clear':
            if (confirm('Clear all chat history?')) {
                ipcRenderer.send('clear-chat-history');
            }
            break;
        case 'export':
            exportChatHistory();
            break;
        case 'summon':
            triggerSummonAnimation();
            break;
    }
}

function exportChatHistory() {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const exportData = {
        exported: new Date().toISOString(),
        messages: state.chatHistory
    };
    
    const filename = `shinigami-chat-${Date.now()}.json`;
    const filepath = path.join(os.homedir(), filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    showSystemMessage(`Chat exported to: ${filepath}`);
}

function triggerSummonAnimation() {
    if (state.shinigami) {
        // Quick dramatic animation
        const originalY = state.shinigami.position.y;
        let step = 0;
        
        const summonInterval = setInterval(() => {
            step++;
            state.shinigami.position.y = originalY + Math.sin(step * 0.5) * 2;
            state.shinigami.rotation.y += 0.2;
            
            if (step >= 20) {
                clearInterval(summonInterval);
                state.shinigami.position.y = originalY;
            }
        }, 50);
    }
    
    showSystemMessage(':: SHINIGAMI SUMMONED ::');
}

function handlePeriodicQuestion(question) {
    addMessage('ai', question);
    updateMood('CURIOUS');
    
    // Flash the creature's eyes
    if (state.shinigami && state.shinigami.userData.leftEye && state.shinigami.userData.rightEye) {
        const flashInterval = setInterval(() => {
            state.shinigami.userData.leftEye.material.emissiveIntensity = 
                state.shinigami.userData.leftEye.material.emissiveIntensity === 2 ? 4 : 2;
            state.shinigami.userData.rightEye.material.emissiveIntensity = 
                state.shinigami.userData.rightEye.material.emissiveIntensity === 2 ? 4 : 2;
        }, 200);
        
        setTimeout(() => {
            clearInterval(flashInterval);
            state.shinigami.userData.leftEye.material.emissiveIntensity = 2;
            state.shinigami.userData.rightEye.material.emissiveIntensity = 2;
            updateMood('WATCHFUL');
        }, 2000);
    }
}

function openSettings() {
    document.getElementById('settings-modal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}

function saveApiKey(provider) {
    const inputId = `${provider}-key`;
    const key = document.getElementById(inputId).value.trim();
    
    if (!key) {
        showSystemMessage(`ERROR: No key provided for ${provider}`);
        return;
    }
    
    state.apiKeys[provider] = key;
    ipcRenderer.send('save-api-key', { provider, key });
}

function loadSettings() {
    ipcRenderer.send('get-api-keys');
    
    // Load defaults
    const systemPrompt = document.getElementById('system-prompt');
    state.systemPrompt = systemPrompt.value;
    
    const modelInput = document.getElementById('model-input');
    modelInput.value = state.currentModel;
}

function loadChatHistory() {
    ipcRenderer.send('load-chat-history');
}

function renderChatHistory() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';
    
    state.chatHistory.forEach(msg => {
        addMessage(msg.role, msg.content);
    });
}

function updateStatusBar() {
    const connectionStatus = document.getElementById('connection-status');
    const apiProvider = document.getElementById('api-provider');
    
    if (state.apiKeys[state.currentProvider]) {
        connectionStatus.textContent = 'READY';
        connectionStatus.classList.add('online');
    } else {
        connectionStatus.textContent = 'NO API KEY';
        connectionStatus.classList.remove('online');
    }
    
    apiProvider.textContent = state.currentProvider.toUpperCase();
}

function updateMood(mood) {
    const moodIndicator = document.getElementById('mood-indicator');
    moodIndicator.textContent = mood;
}

function startUptime() {
    setInterval(() => {
        const elapsed = Date.now() - state.startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const uptimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('uptime').textContent = uptimeStr;
    }, 1000);
}
