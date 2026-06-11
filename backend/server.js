// ============================================
// IndustrieON Activiteitenplanner - Server
// Hoofd entrypoint van de backend applicatie
// ============================================

const { setupApp } = require('./app');

const PORT = process.env.PORT || 5000;

setupApp().then(app => {
  app.listen(PORT, () => {
    console.log(`IndustrieON server draait op http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Server start error:', err);
  process.exit(1);
});
