// models/ChatMessage.js

const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  senderId: {
    type: Number,    // foreign key → User.id in Postgres
    required: true,
  },
  receiverId: {
    type: Number,    // foreign key → User.id in Postgres
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
