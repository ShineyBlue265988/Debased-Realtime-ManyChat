const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const User = require('./models/User');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const clients = new Map();
let messages = []; // Store last 500 messages in memory

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const clientId = generateUniqueId();
  clients.set(clientId, ws);

  // Send existing messages to new client
  Message.find().sort({ timestamp: 1 }).limit(500)
    .then(existingMessages => {
      ws.send(JSON.stringify({ type: 'history', messages: existingMessages }));
    });

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    console.log('Received message:', data);
    try {
      await User.findOneAndUpdate(
        { username: data.username },
        { 
          username: data.username,
          publicKey: data.publicKey,
          lastSeen: new Date()
        },
        { upsert: true }
      );

  }catch (error) {
    console.error('Error handling user', error);
  }
  const newMessage = new Message({
    username: data.username,
    text: data.text,
    timestamp: new Date()
  });
    try {
      await newMessage.save();
      messages.push(newMessage);
      
      // Keep only last 500 messages in memory
      if (messages.length > 500) {
        messages.shift();
      }

      // Broadcast to all connected clients
clients.forEach((client, id) => {
  if (client.readyState === WebSocket.OPEN && id !== clientId) {  // Only send to other clients
    client.send(JSON.stringify({
      type: 'message',
      message: newMessage
    }));
  }
});

    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
  });
});

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
