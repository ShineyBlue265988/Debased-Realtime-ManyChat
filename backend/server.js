const express = require("express");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const User = require('./models/User');
// import {create} from 'kubo-rpc-client';
const fs = require("fs");
const https = require("https");
const axios = require('axios');
const app = express();
const mongoose = require("mongoose");
const PINATA_API_KEY = '938d269e80d74e636354';
const PINATA_API_SECRET = 'e1c7451ef6efea8a999af55ab661e636442997e1e89144c83b43c818bf2c2629';
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

// const ipfs = create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth
//   }
// });

const clients = new Map();
const BATCH_SIZE = 10; // Number of messages to batch
let messageBatch = []; // Array to store batched messages

const wss = new WebSocket.Server({ server });

// IPFS functions
async function storeMessagesBatch(batch) {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      { batch },
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET
        }
      }
    );
    console.log(`Stored batch of messages on IPFS with CID: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error storing message batch on Pinata:", error);
    throw error;
  }
}


async function getMessage(cid) {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log("Fetched message from IPFS via Pinata gateway:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching message from IPFS via Pinata gateway:", error);
    throw error;
  }
}

async function storeMessage(message) {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      message,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET
        }
      }
    );
    console.log("Stored message CID:", response.data.IpfsHash);
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error storing message on Pinata:", error);
    throw error;
  }
}

wss.on('connection', (ws) => {
  const clientId = generateUniqueId();
  clients.set(clientId, ws);

  // Send existing messages to new client
  Message.find().sort({ timestamp: -1 }).limit(500)
  .then(async existingMessages => {
    // Create a map to store messages by CID
    const cidMap = new Map();
    
    existingMessages.forEach(meta => {
      if (!meta.cid) {
        console.error('Missing CID for message:', meta);
        return; // Handle missing CID
      }
      if (!cidMap.has(meta.cid)) {
        cidMap.set(meta.cid, []);
      }
      cidMap.get(meta.cid).push(meta);
    });

    // Retrieve messages from IPFS for all unique CIDs
    const messageContents = await getMessages(Array.from(cidMap.keys()));

    // Construct full messages
    const fullMessages = [];
    messageContents.forEach((content, index) => {
      const messagesWithSameCid = cidMap.get(Array.from(cidMap.keys())[index]);
      messagesWithSameCid.forEach(meta => {
        fullMessages.push({
          ...meta.toObject(),
          text: content.text // Assuming content has a 'text' field
        });
      });
    });

    // Send the full messages to the client
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
      const temporaryId = new mongoose.Types.ObjectId();
      const messageToSend = {
        _id: temporaryId, // Add the temporary _id
        username: data.username,
        publicKey: data.publicKey,
        timestamp: new Date(),
        text: data.text // Include the message text here
      };
    
      // Broadcast the message to all connected clients
      clients.forEach((client, id) => {
        if (client.readyState === WebSocket.OPEN && id !== clientId) {
          client.send(JSON.stringify({
            type: 'message',
            message: messageToSend,
          }));
        }
      });
    
      messageBatch.push(messageToStore);

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

        console.log(`Stored ${BATCH_SIZE} messages in IPFS with CID: ${batchCid}`);}

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