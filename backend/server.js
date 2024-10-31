const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const Message = require("./models/Message");
require("dotenv").config();

connectDB();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let messages = []; // Store last 500 messages in memory

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  // Send last 500 messages on new connection
  ws.send(JSON.stringify(messages.slice(-500)));

  ws.on("message", async (data) => {
    const message = JSON.parse(data);
    messages.push(message);
    if (messages.length > 500) messages.shift(); // Keep only last 500 messages

    await new Message(message).save(); // Save to MongoDB

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify([message]));
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));