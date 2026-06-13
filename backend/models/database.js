// ============================================
// Database configuratie
// Gebruikt SQLite via Sequelize ORM
// ============================================

const { Sequelize } = require('sequelize');
const path = require('path');

const dbPad = path.join(__dirname, '..', 'industrieon.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPad,
  logging: false
});

module.exports = sequelize;
