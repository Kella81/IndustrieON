// ============================================
// Database configuratie en initialisatie
// Gebruikt SQLite via sql.js (pure JavaScript)
// ============================================

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPad = path.join(__dirname, '..', 'industrieon.db');
let db = null;
let SQL = null;

class PreparedStatement {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
  }

  all(...params) {
    try {
      const stmt = this.database.prepare(this.sql);
      stmt.bind(params);
      const result = [];
      while (stmt.step()) {
        result.push(stmt.getAsObject());
      }
      stmt.free();
      return result;
    } catch (e) {
      console.error('Query error:', this.sql, e);
      return [];
    }
  }

  get(...params) {
    try {
      const stmt = this.database.prepare(this.sql);
      stmt.bind(params);
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    } catch (e) {
      console.error('Query error:', this.sql, e);
      return null;
    }
  }

  run(...params) {
    try {
      const stmt = this.database.prepare(this.sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
      
      const idStmt = this.database.prepare('SELECT last_insert_rowid() as id');
      idStmt.step();
      const row = idStmt.getAsObject();
      idStmt.free();
      
      saveDatabase();
      return { lastInsertRowid: row.id || 0 };
    } catch (e) {
      console.error('Query error:', this.sql, e);
      return { lastInsertRowid: 0 };
    }
  }
}

class DatabaseWrapper {
  prepare(sql) {
    return new PreparedStatement(db, sql);
  }

  exec(sql) {
    try {
      db.run(sql);
      saveDatabase();
    } catch (e) {
      console.error('Exec error:', e);
    }
  }
}

function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPad, buffer);
  } catch (e) {
    console.error('Save error:', e);
  }
}

let dbInstance = null;

async function initializeDatabase() {
  try {
    if (!SQL) {
      SQL = await initSqlJs();
    }

    if (fs.existsSync(dbPad)) {
      const fileBuffer = fs.readFileSync(dbPad);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }

    dbInstance = new DatabaseWrapper();
    return dbInstance;
  } catch (e) {
    console.error('Database init error:', e);
    throw e;
  }
}

/**
 * Maakt alle benodigde tabellen aan als ze nog niet bestaan
 */
function initialiseerDatabase() {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER' CHECK(role IN ('USER', 'ORGANIZER', 'ADMIN')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        organizer_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'aanwezig' CHECK(status IN ('aanwezig', 'misschien', 'niet_aanwezig')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        UNIQUE(user_id, activity_id)
      );

      CREATE TABLE IF NOT EXISTS polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS poll_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INTEGER NOT NULL,
        option_text TEXT NOT NULL,
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS poll_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        option_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
        UNIQUE(user_id, option_id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        parent_id INTEGER DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, activity_id)
      );
    `);

    saveDatabase();
    console.log('Database tabellen succesvol aangemaakt');
  } catch (e) {
    console.error('Table creation error:', e);
  }
}

module.exports = dbInstance || new DatabaseWrapper();
module.exports.initialiseerDatabase = initialiseerDatabase;
module.exports.initializeDatabase = initializeDatabase;
