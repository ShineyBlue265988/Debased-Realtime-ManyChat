// Update your Message model:
// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  username: String,
  publicKey: String,
  timestamp: { type: Date, default: Date.now },
  cid: String, // Store the IPFS CID instead of the text
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;