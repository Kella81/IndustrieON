// ============================================
// Database configuratie
// Gebruikt PostgreSQL op Railway, SQLite lokaal
// ============================================

const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // Railway PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Lokale SQLite
  const dbPad = path.join(__dirname, '..', 'industrieon.db');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPad,
    logging: false
  });
}

module.exports = sequelize;
