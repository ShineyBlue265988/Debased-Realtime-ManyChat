const express = require("express");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const User = require('./models/User');
const fs = require("fs");
const https = require("https");

const app = express();

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/backend.debase.app/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/backend.debase.app/fullchain.pem')
};

const server = https.createServer(options, app).listen(443, "167.71.99.132", () => {
  console.log(`Server running at https://167.71.99.132/`);
});

// Connect to MongoDB
connectDB();

const projectId = '0882917bbbbe443f8d259cf345a90ab7';
const projectSecret = 'lZDmFq8EvlR1vf/H/M3gK0wePTBuE6GyB9nQ1FqX4fJqTgs6fAnqOw';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Define `ipfs` as a global variable to be initialized later
let ipfs;

(async () => {
  // Dynamically import `create` from `kubo-rpc-client`
  const { create } = await import('kubo-rpc-client');

  // Initialize IPFS client
  ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth
    }
  });
})();

const clients = new Map();
const BATCH_SIZE = 10; // Number of messages to batch
let messageBatch = []; // Array to store batched messages

const wss = new WebSocket.Server({ server });

// IPFS functions
async function storeMessagesBatch(batch) {
  const { cid } = await ipfs.add(JSON.stringify(batch));
  return cid.toString();
}

async function getMessage(cid) {
  console.log('Fetching message for CID:', cid);
  const stream = ipfs.cat(cid);
  let data = '';
  for await (const chunk of stream) {
    data += chunk.toString();
  }
  return JSON.parse(data);
}

async function storeMessage(message) {
  const { cid } = await ipfs.add(JSON.stringify(message));
  return cid.toString();
}

wss.on('connection', (ws) => {
  const clientId = generateUniqueId();
  clients.set(clientId, ws);

  // Send existing messages to new client
  Message.find().sort({ timestamp: -1 }).limit(500)
    .then(async existingMessages => {
      const fullMessages = await Promise.all(existingMessages.map(async (meta) => {
        if (!meta.cid) {
          console.error('Missing CID for message:', meta);
          return null; // Handle missing CID
        }
        const content = await getMessage(meta.cid);
        return {
          ...meta.toObject(),
          text: content.text
        };
      }));

      // Filter out null messages
      const validMessages = fullMessages.filter(message => message !== null);
      ws.send(JSON.stringify({ type: 'history', messages: validMessages }));
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

      // Broadcast messages to all connected clients
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
        const batchCid = await storeMessagesBatch(messageBatch);

        // Save metadata and CID in MongoDB for each message
        for (let msg of messageBatch) {
          const mongoMessage = new Message({
            username: msg.username,
            publicKey: msg.publicKey,
            timestamp: msg.timestamp,
            cid: batchCid // Store the same CID for all batched messages
          });
          await mongoMessage.save();
        }

        // Clear the batch after saving
        messageBatch.length = 0;

        console.log(`Stored ${BATCH_SIZE} messages in IPFS with CID: ${batchCid}`);
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
  return Math.random().toString(36).substr(2, 9); // Generates a unique ID
}

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
