const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USER',
    validate: { isIn: [['USER', 'ORGANIZER', 'ADMIN']] }
  },
  created_at: { type: DataTypes.STRING }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
