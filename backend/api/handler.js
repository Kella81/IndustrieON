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
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('App initialisatie mislukt:', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Server kon niet opstarten', details: err.message });
  }
};