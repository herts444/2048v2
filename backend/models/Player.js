// backend/models/Player.js

const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true, // Уникальный ID пользователя
  },
  name: {
    type: String,
    required: true,
  },
  bestScore: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);
