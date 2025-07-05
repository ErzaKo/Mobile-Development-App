const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  postgresId: {
    type: String, // lidhje me News.id nga PostgreSQL
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('NewsMetadata', newsSchema);
