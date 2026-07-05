// ============================================
// App configuratie (apart van server start)
// Zodat de app ook in tests gebruikt kan worden
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initialiseerDatabase } = require('./models');

const app = express();
let appInitialised = false;

app.use(cors());
app.use(express.json());

async function setupApp() {
  if (appInitialised) {
    return app;
  }

  await initialiseerDatabase();

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/activities', require('./routes/activities'));
  app.use('/api/polls', require('./routes/polls'));
  app.use('/api/admin', require('./routes/admin'));

  app.get('/api', (req, res) => {
    res.json({ bericht: 'IndustrieON API draait!' });
  });

  appInitialised = true;

  return app;
}

module.exports = { app, setupApp };
