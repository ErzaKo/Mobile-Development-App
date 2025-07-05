const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room_id: Number,
  sender_id: Number,
  message: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChatMessageMongo', chatMessageSchema);