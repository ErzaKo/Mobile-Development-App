const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // adjust path if needed
const User = require('../../users/user.model'); // adjust path if needed

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_answered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'questions',
  timestamps: false, // disable automatic timestamps since we're handling them manually
});

// Optional: define the relation
Question.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Question, { foreignKey: 'user_id', as: 'questions' });


module.exports = Question;
