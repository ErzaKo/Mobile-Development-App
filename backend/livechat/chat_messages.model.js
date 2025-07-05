const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ChatRoom = require('./chat_rooms.model');
const User = require('../users/user.model');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  room_id: {
    type: DataTypes.INTEGER,
    references: {
      model: ChatRoom,
      key: 'id',
    },
  },
  sender_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  mongo_message_id: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'chat_messages',
  timestamps: false,
});

module.exports = ChatMessage;