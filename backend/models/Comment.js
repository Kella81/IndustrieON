const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  activity_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  parent_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  created_at: { type: DataTypes.STRING }
}, {
  tableName: 'comments',
  timestamps: false
});

module.exports = Comment;
