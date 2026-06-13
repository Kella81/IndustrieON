const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Poll = sequelize.define('Poll', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  activity_id: { type: DataTypes.INTEGER, allowNull: false },
  question: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.STRING }
}, {
  tableName: 'polls',
  timestamps: false
});

module.exports = Poll;
