const mongoose = require('mongoose');

const likesSchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    likedBy: [{ type: String }],
    likes: { type: Number, default: 0 },
});

const Likes = mongoose.model('Likes', likesSchema);
module.exports = Likes;