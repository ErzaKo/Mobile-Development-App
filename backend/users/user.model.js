// users/user.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // import your db connection

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user',
  },
  created_at: {
    type: DataTypes.DATE, // Use DATE instead of TIMESTAMP in Sequelize
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  timestamps: false,
});


module.exports = User;
