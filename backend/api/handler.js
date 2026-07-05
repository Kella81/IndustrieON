const { setupApp } = require('../app');

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = setupApp();
  }

  return appPromise;
}

module.exports = async (req, res) => {
  const app = await getApp();
  return app(req, res);
};