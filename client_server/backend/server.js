const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const os = require('os');
const localtunnel = require('localtunnel');

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Simple HTTP health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'running', message: 'Connection Control Backend is online.' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Helper to get formatted local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-ipv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Helper to format date/time
function getTimestamp() {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

// WebSocket server connection handler
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  const timestamp = getTimestamp();
  
  console.log(`\x1b[31m[${timestamp}] 🔴 CONNECTION ESTABLISHED from client [IP: ${clientIp}]\x1b[0m`);
  
  // Send acknowledgment back to client immediately
  const ackPayload = JSON.stringify({
    event: 'acknowledgment',
    status: 'connected',
    message: 'Hello! Your connection has been established and acknowledged by the Backend (Laptop B).'
  });
  ws.send(ackPayload);
  console.log(`\x1b[32m[${timestamp}] ✉️ SENT ACKNOWLEDGMENT to client [IP: ${clientIp}]\x1b[0m`);
  
  // Handle incoming messages (if any)
  ws.on('message', (message) => {
    const receiveTime = getTimestamp();
    try {
      const parsed = JSON.parse(message);
      console.log(`[${receiveTime}] Message from client:`, parsed);
      
      // Send message acknowledgment
      ws.send(JSON.stringify({
        event: 'msg_ack',
        status: 'success',
        message: 'Message processed and acknowledged by backend.'
      }));
      console.log(`\x1b[32m[${receiveTime}] ✉️ SENT MESSAGE ACKNOWLEDGMENT to client [IP: ${clientIp}]\x1b[0m`);
    } catch (e) {
      const rawMsg = message.toString();
      console.log(`[${receiveTime}] Raw message from client:`, rawMsg);
      
      ws.send(JSON.stringify({
        event: 'msg_ack',
        status: 'success',
        message: `Raw message acknowledged: "${rawMsg.substring(0, 20)}..."`
      }));
    }
  });

  // Handle client disconnection
  ws.on('close', (code, reason) => {
    const ts = getTimestamp();
    console.log(`\x1b[34m[${ts}] 🔵 CONNECTION RELEASED from client [IP: ${clientIp}] (Code: ${code})\x1b[0m`);
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error(`[${getTimestamp()}] WebSocket error:`, error.message);
  });
});

// Start the HTTP & WebSocket server
server.listen(port, async () => {
  console.log('==================================================');
  console.log('🔌 CONNECTION CONTROL SERVER STARTED');
  console.log(`⏰ Time: ${getTimestamp()}`);
  console.log(`📡 Server listening locally on port: ${port}`);
  console.log('--------------------------------------------------');
  console.log('🌐 Local Network URLs (same Wi-Fi only):');
  
  const ips = getLocalIPs();
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(`   👉 ws://${ip}:${port}`);
    });
  } else {
    console.log('   ⚠️ No external network interface found. Check your Wi-Fi/Ethernet.');
  }
  console.log(`   👉 ws://localhost:${port} (local machine only)`);
  console.log('--------------------------------------------------');
  console.log('🌍 Public Internet URL (Works from ANY network/Wi-Fi):');
  console.log('   🔗 Establishing secure public tunnel...');

  try {
    const tunnel = await localtunnel({ port: port });
    
    // localtunnel URL is https, WebSocket is wss (secure WebSocket)
    const publicUrl = tunnel.url.replace(/^https:\/\//, 'wss://');
    console.log(`   👉 ${publicUrl}`);
    console.log('   (Paste this URL directly into the frontend config!)');
    
    tunnel.on('close', () => {
      console.log('\n⚠️ Public internet tunnel closed.');
    });
  } catch (err) {
    console.error('   ❌ Failed to establish public internet tunnel:', err.message);
    console.log('   Please check your internet connection.');
  }
  console.log('==================================================\n');
});
