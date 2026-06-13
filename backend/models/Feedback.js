const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  activity_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.STRING }
}, {
  tableName: 'feedback',
  timestamps: false
});

module.exports = Feedback;
