// ============================================
// IndustrieON Activiteitenplanner - Server
// Hoofd entrypoint van de backend applicatie
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

async function startServer() {
  // Database initialiseren
  await db.initializeDatabase();
  db.initialiseerDatabase();

  // Routes koppelen
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/activities', require('./routes/activities'));
  app.use('/api/polls', require('./routes/polls'));
  app.use('/api/admin', require('./routes/admin'));

  // Basis route voor API status check
  app.get('/api', (req, res) => {
    res.json({ bericht: 'IndustrieON API draait!' });
  });

  // Server starten
  app.listen(PORT, () => {
    console.log(`IndustrieON server draait op http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server start error:', err);
  process.exit(1);
});
