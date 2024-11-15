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

async function unpinFile(cid) {
  try {
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    console.log(`Unpinned file with CID: ${cid}`);
  } catch (error) {
    console.error(`Error unpinning file with CID ${cid}:`, error);
  }
}

// Function to get pinned files
async function getPinnedFiles() {
  try {
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    return response.data.rows; // This will return an array of pinned files
  } catch (error) {
    console.error('Error fetching pinned files:', error);
  }
}

// Function to manage pinning
async function managePinning() {
  const pinnedFiles = await getPinnedFiles();

  if (pinnedFiles.length >= 500) {
    // Sort by timestamp or other criteria to find the oldest
    const filesToUnpin = pinnedFiles.sort((a, b) => a.timestamp - b.timestamp).slice(0, 10); // Adjust the number as needed

    for (const file of filesToUnpin) {
      await unpinFile(file.ipfs_pin_hash); // Use the correct property for the CID
    }
  }
}


// IPFS functions
async function storeMessagesBatch(batch) {
  await managePinning(); // Manage pinning before storing new messages
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


async function getMessages(cids) {
  try {
    const responses = await Promise.all(cids.map(cid => axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`)));
    return responses.map(response => response.data);
  } catch (error) {
    console.error("Error fetching messages from IPFS via Pinata gateway:", error);
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
  let fullMessages = [];
  // Create a map to store messages by CID
  const cidMap = new Map();
  // Send existing messages to new client
  Message.find().sort({ timestamp: -1 }).limit(500)
    .then(async existingMessages => {
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
      console.log("cidMap", cidMap);

      // Retrieve messages from IPFS for all unique CIDs
      return getMessages(Array.from(cidMap.keys())); // Return the promise
    })
    .then(messageContents => {
      // console.log("history messageContents", messageContents);
      const cidKeys = Array.from(cidMap.keys());

      // Construct full messages
      messageContents.forEach((content, index) => {
        const messagesWithSameCid = cidMap.get(cidKeys[index]);
        // console.log("messagesWithSameCid", messagesWithSameCid);

        if (content.batch) { // Check if content has a batch
          content.batch.forEach(message => {
            messagesWithSameCid.forEach(meta => {
              // console.log("meta", meta);
              // console.log("content", content);
              fullMessages.push({
                ...meta.toObject(),
                text: message.text // Assuming content has a 'text' field
              });
              // console.log("fullMessages", fullMessages);
            });
          });
        } else {
          console.error(`No batch found for CID: ${cidKeys[index]}`);
        }
      });
    })
    .then(() => {
      console.log("fullMessages", fullMessages);
      console.log("reversedMessageBatch", messageBatch.reverse());
      let reversedMessageBatch = messageBatch.reverse();
      // Send full messages to the client, ensuring fullMessages is populated
      fullMessages = [...reversedMessageBatch, ...fullMessages];
      ws.send(JSON.stringify({ type: 'history', messages: fullMessages }));
      reversedMessageBatch = [];
      // console.log("Sent history messages:", JSON.stringify({ type: 'history', messages: fullMessages }));
    })
    .catch(error => {
      console.error('Error retrieving or sending messages:', error);
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

      messageBatch.push(messageToSend);
      // If batch size is reached, save the batch to IPFS and MongoDB
      if (messageBatch.length >= BATCH_SIZE) {
        messageBatch .reverse();
        const batchCid = await storeMessagesBatch(messageBatch);

        // // Save metadata and CID in MongoDB for each message
        // for (let msg of messageBatch) {
        //   const mongoMessage = new Message({
        //     username: msg.username,
        //     publicKey: msg.publicKey,
        //     timestamp: msg.timestamp,
        //     cid: batchCid // Store the same CID for all batched messages
        //   });
        //   await mongoMessage.save();
        // }

        const mongoMessage = new Message({
          username: messageBatch[0].username, // You can choose to store the first user's info
          publicKey: messageBatch[0].publicKey, // Similarly, you can store the first user's public key
          timestamp: new Date(), // Timestamp for when the batch was saved
          cid: batchCid // Store the same CID for the entire batch
        });

        // Save the single message to MongoDB
        await mongoMessage.save();


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