const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Categories = sequelize.define('Categories', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'categories',
  timestamps: true, 
});

module.exports = Categories;
