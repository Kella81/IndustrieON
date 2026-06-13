const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Registration = sequelize.define('Registration', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  activity_id: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'aanwezig',
    validate: { isIn: [['aanwezig', 'misschien', 'niet_aanwezig']] }
  },
  created_at: { type: DataTypes.STRING }
}, {
  tableName: 'registrations',
  timestamps: false
});

module.exports = Registration;
