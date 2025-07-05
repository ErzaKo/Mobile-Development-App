const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('../users/user.model');
const ChatRoom = require('./chat_rooms.model');

const ChatRoomParticipant = sequelize.define('ChatRoomParticipant', {
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
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'chat_room_participants',
  timestamps: false,
});

module.exports = ChatRoomParticipant;