// DOM Elements
const serverUrlInput = document.getElementById('server-url-input');
const btnEstablish = document.getElementById('btn-establish-connection');
const btnRelease = document.getElementById('btn-release-connection');
const statusBadge = document.getElementById('connection-status-badge');
const statusText = document.getElementById('status-text');
const consoleOutput = document.getElementById('console-output');
const btnClearConsole = document.getElementById('btn-clear-console');

let socket = null;

// Helper: Format current time as [HH:MM:SS]
function getFormattedTime() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
}

// Helper: Log message to the console panel
function logToConsole(message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = getFormattedTime();
    
    const textSpan = document.createElement('span');
    textSpan.textContent = ` ${message}`;
    
    entry.appendChild(timeSpan);
    entry.appendChild(textSpan);
    
    consoleOutput.appendChild(entry);
    
    // Auto-scroll to the bottom
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Update UI elements based on connection state
function updateUIState(state) {
    
    // Reset classes of.
    statusBadge.className = 'status-badge';
    
    switch (state) {
        case 'disconnected':
            statusBadge.classList.add('disconnected');
            statusText.textContent = 'Disconnected';
            
            btnEstablish.disabled = false;
            btnRelease.disabled = true;
            serverUrlInput.disabled = false;
            break;
            
        case 'connecting':
            statusBadge.classList.add('connecting');
            statusText.textContent = 'Connecting...';
            
            btnEstablish.disabled = true;
            btnRelease.disabled = true;
            serverUrlInput.disabled = true;
            break;
            
        case 'connected':
            statusBadge.classList.add('connected');
            statusText.textContent = 'Connected';
            
            btnEstablish.disabled = true;
            btnRelease.disabled = false;
            serverUrlInput.disabled = true;
            break;
    }
}

// Establish Connection (Red Button)
function establishConnection() {
    let url = serverUrlInput.value.trim();
    
    // Simple validation
    if (!url) {
        logToConsole('Error: Server URL cannot be empty.', 'error');
        return;
    }
    
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
        logToConsole('Warning: Protocol missing. Prepending "ws://".', 'warning');
        url = 'ws://' + url;
        serverUrlInput.value = url;
    }
    
    logToConsole(`Attempting to connect to: ${url}`, 'info');
    updateUIState('connecting');
    
    try {
        socket = new WebSocket(url);
        
        socket.onopen = () => {
            logToConsole('🔴 Connection established successfully!', 'success');
            updateUIState('connected');
            
            // Send standard join info to server
            const payload = JSON.stringify({
                event: 'handshake',
                agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
            socket.send(payload);
        };
        
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'acknowledgment') {
                    logToConsole(`✔ Server Acknowledgment: ${data.message}`, 'success');
                } else if (data.event === 'msg_ack') {
                    logToConsole(`✔ Server Acknowledged Message: ${data.message}`, 'success');
                } else {
                    logToConsole(`Message from server: ${event.data}`, 'info');
                }
            } catch (e) {
                logToConsole(`Message from server: ${event.data}`, 'info');
            }
        };
        
        socket.onclose = (event) => {
            let reason = event.reason ? ` (${event.reason})` : '';
            logToConsole(`🔵 Connection released. Code: ${event.code}${reason}`, 'info');
            updateUIState('disconnected');
            socket = null;
        };
        
        socket.onerror = (error) => {
            logToConsole('Connection error: Could not reach the server. Make sure the server is running and the IP address is correct.', 'error');
            // Note: socket.onclose will run next automatically
        };
        
    } catch (err) {
        logToConsole(`Failed to instantiate WebSocket: ${err.message}`, 'error');
        updateUIState('disconnected');
    }
}

// Release Connection (Blue Button)
function releaseConnection() {
    if (socket) {
        logToConsole('Initiating connection release...', 'info');
        socket.close(1000, 'Released by user interaction');
    } else {
        logToConsole('No active connection to release.', 'warning');
        updateUIState('disconnected');
    }
}

// Event Listeners
btnEstablish.addEventListener('click', establishConnection);
btnRelease.addEventListener('click', releaseConnection);

btnClearConsole.addEventListener('click', () => {
    consoleOutput.innerHTML = '';
    logToConsole('Console cleared.', 'system');
});

// Initialize on load
updateUIState('disconnected');
logToConsole('System loaded. Press the RED button to establish a connection.', 'system');
// Try to pre-fill local IP placeholder advice if user is on localhost
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    logToConsole('Tip: Enter your backend laptop\'s local IP address (e.g., ws://192.168.1.XX:8080) to connect.', 'info');
}
