const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  organizer_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.STRING }
}, {
  tableName: 'activities',
  timestamps: false
});

module.exports = Activity;
