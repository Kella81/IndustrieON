// ============================================
// Integratietesten - Kritieke API endpoints
// Leeruitkomst 23: integratietesten schrijven
// ============================================

process.env.JWT_SECRET = 'test_secret_jest';

const request = require('supertest');
const { setupApp } = require('../app');

let app;

beforeAll(async () => {
  app = await setupApp();
});

// ---- API status ----
describe('GET /api', () => {
  test('geeft 200 terug met statusbericht', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
    expect(res.body.bericht).toBe('IndustrieON API draait!');
  });
});

// ---- Registratie ----
describe('POST /api/auth/register', () => {
  test('succesvol registreren geeft 201 + token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Gebruiker', email: `user${Date.now()}@test.nl`, password: 'test123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('USER');
  });

  test('ontbrekende velden geeft 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'onvolledig@test.nl' });
    expect(res.statusCode).toBe(400);
    expect(res.body.fout).toBeDefined();
  });

  test('dubbel email geeft 400', async () => {
    const email = `dubbel${Date.now()}@test.nl`;
    await request(app).post('/api/auth/register').send({ name: 'A', email, password: '123' });
    const res = await request(app).post('/api/auth/register').send({ name: 'B', email, password: '123' });
    expect(res.statusCode).toBe(400);
  });
});

// ---- Inloggen ----
describe('POST /api/auth/login', () => {
  test('succesvol inloggen geeft 200 + token', async () => {
    const email = `login${Date.now()}@test.nl`;
    await request(app).post('/api/auth/register').send({ name: 'Login Test', email, password: 'wachtwoord' });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wachtwoord' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('verkeerd wachtwoord geeft 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'niet@bestaan.nl', password: 'fout' });
    expect(res.statusCode).toBe(401);
    expect(res.body.fout).toBeDefined();
  });
});

// ---- Activiteiten (publiek) ----
describe('GET /api/activities', () => {
  test('geeft array van activiteiten terug', async () => {
    const res = await request(app).get('/api/activities');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ---- Beveiligde routes ----
describe('Beveiligde routes zonder token', () => {
  test('POST /api/activities zonder token geeft 401', async () => {
    const res = await request(app)
      .post('/api/activities')
      .send({ title: 'Test', description: 'Test', location: 'Test', date: '2026-01-01', capacity: 10 });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/admin/stats zonder token geeft 401', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/activities/1 zonder token geeft 401', async () => {
    const res = await request(app).delete('/api/activities/1');
    expect(res.statusCode).toBe(401);
  });
});

// ---- Autorisatie (verkeerde rol) ----
describe('Autorisatie op basis van rol', () => {
  let userToken;

  beforeAll(async () => {
    const email = `roltest${Date.now()}@test.nl`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Gewone User', email, password: 'test123' });
    userToken = res.body.token;
  });

  test('USER mag geen activiteit aanmaken (geeft 403)', async () => {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test', description: 'Test', location: 'Test', date: '2026-01-01', capacity: 10 });
    expect(res.statusCode).toBe(403);
  });

  test('USER heeft geen toegang tot admin stats (geeft 403)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});
