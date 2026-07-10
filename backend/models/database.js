// ============================================
// Database configuratie
// Gebruikt PostgreSQL op Railway, SQLite lokaal
// ============================================

const { Sequelize } = require('sequelize');
const path = require('path');

// Expliciet requiren zodat Vercel's bundler pg meeneemt in de deployment
require('pg');

let sequelize;

const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (dbUrl) {
  // Railway PostgreSQL
  sequelize = new Sequelize(dbUrl, {
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
