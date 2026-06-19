// ============================================
// App configuratie (apart van server start)
// Zodat de app ook in tests gebruikt kan worden
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initialiseerDatabase } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

const frontendBuild = path.join(__dirname, '../frontend/build');

async function setupApp() {
  await initialiseerDatabase();

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/activities', require('./routes/activities'));
  app.use('/api/polls', require('./routes/polls'));
  app.use('/api/admin', require('./routes/admin'));

  app.get('/api', (req, res) => {
    res.json({ bericht: 'IndustrieON API draait!' });
  });

  // Serveer React frontend
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });

  return app;
}

module.exports = { app, setupApp };
