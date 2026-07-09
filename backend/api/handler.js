const { setupApp } = require('../app');

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = setupApp().catch((err) => {
      appPromise = null; // reset zodat de volgende request het opnieuw probeert
      throw err;
    });
  }

  return appPromise;
}

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('App initialisatie mislukt:', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Server kon niet opstarten', details: err.message });
  }
};