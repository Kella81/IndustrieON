const ALLOWED_ORIGINS = [
  'https://industrie-on.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const { setupApp } = require('../app');
      return setupApp();
    })().catch((err) => {
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('App initialisatie mislukt:', err);
    res.status(500).json({ error: 'Server kon niet opstarten', details: err.message });
  }
};