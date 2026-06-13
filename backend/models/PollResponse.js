const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const PollResponse = sequelize.define('PollResponse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  option_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.STRING }
}, {
  tableName: 'poll_responses',
  timestamps: false
});

module.exports = PollResponse;
