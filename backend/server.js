const express = require("express");
// const http = require("http");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const User = require('./models/User');
const { create } = require('ipfs-http-client');
const NodeCache = require('node-cache');
const fs = require("fs");
const https = require("https");

const app = express();
// const PORT = process.env.PORT || 5000;

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/backend.debase.app/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/backend.debase.app/fullchain.pem')
};

const server = https.createServer(options, app).listen(443, "167.71.99.132", () => {
  console.log(`Server running at https://167.71.99.132/`);
});

// Connect to MongoDB
connectDB();

// IPFS setup
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const clients = new Map();
const messageCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
const BATCH_SIZE = 10; // Number of messages to batch
let messageBatch = []; // Array to store batched messages

const wss = new WebSocket.Server({ server });

// IPFS functions
async function storeMessagesBatch(batch) {
  const { cid } = await ipfs.add(JSON.stringify(batch));
  return cid.toString();
}

async function getMessage(cid) {
  let message = messageCache.get(cid);
  if (!message) {
    const stream = ipfs.cat(cid);
    let data = '';
    for await (const chunk of stream) {
      data += chunk.toString();
    }
    message = JSON.parse(data);
    messageCache.set(cid, message);
  }
  return message;
}

wss.on('connection', (ws) => {
  const clientId = generateUniqueId();
  clients.set(clientId, ws);

  // Send existing messages to new client
  Message.find().sort({ timestamp: -1 }).limit(500)
    .then(async existingMessages => {
      const fullMessages = await Promise.all(existingMessages.map(async (meta) => {
        const content = await getMessage(meta.cid);
        return {
          ...meta.toObject(),
          text: content.text
        };
      }));
      ws.send(JSON.stringify({ type: 'history', messages: fullMessages }));
    });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (!data.username || !data.text || !data.publicKey) {
      console.error('Invalid message format');
      return;
    }
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

      // Store message content on IPFS
      const cid = await storeMessage({
        text: data.text,
        timestamp: new Date()
      });

      // Store metadata and CID in MongoDB
      const newMessage = new Message({
        username: data.username,
        publicKey: data.publicKey,
        timestamp: new Date(),
        cid: cid
      });

      await newMessage.save();



        // Broadcast batched messages to all connected clients
        clients.forEach((client, id) => {
          if (client.readyState === WebSocket.OPEN && id !== clientId) {
            client.send(JSON.stringify({
              type: 'message',
              message: newMessage
            }));
          }
        });
      // Add the new message to the batch
      messageBatch.push(newMessage);
       // If batch size is reached, save the batch to IPFS and MongoDB
       if (messageBatch.length >= BATCH_SIZE) {
        const cid = await storeMessagesBatch(messageBatch);

        // Save metadata and CID in MongoDB for each message
        for (let msg of messageBatch) {
          const mongoMessage = new Message({
            username: msg.username,
            publicKey: msg.publicKey,
            timestamp: msg.timestamp,
            cid: cid // Store the same CID for all batched messages
          });
          await mongoMessage.save();
        }

        // Clear the batch after saving
        messageBatch.length = 0;
        
        console.log(`Stored ${BATCH_SIZE} messages in IPFS with CID: ${cid}`);
      }

    } catch (error) {
      console.error('Error handling message:', error);
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