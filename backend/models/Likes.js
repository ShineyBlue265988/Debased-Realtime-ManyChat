const mongoose = require('mongoose');

const likesSchema  = new mongoose.Schema({
    _id: String,
    likes: { type: Number, default: 0 }, // Count of likes
    likedBy: { type: [String], default: [] } // Array of user IDs or usernames who liked the message
  });
  
  const Message = mongoose.model('Likes', likesSchema);