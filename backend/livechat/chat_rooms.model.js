  const { DataTypes } = require('sequelize');
  const sequelize = require('../config/db');

  const ChatRoom = sequelize.define('ChatRoom', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'chat_rooms',
    timestamps: false,
  });

  module.exports = ChatRoom;
