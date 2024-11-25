const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  publicKey: {
    type: String,
    required: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  badge: {
    type: String,
    default: 'VerifiedBadge'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  messagesCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 0
  },
  nextLevelThreshold: {
    type: Number,
    default: 100 // Example threshold for level progression
  }
});

module.exports = mongoose.model('User', userSchema);
