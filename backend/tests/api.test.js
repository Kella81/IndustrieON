// ============================================
// Integratietesten - Kritieke API endpoints
// Leeruitkomst 23: integratietesten schrijven
// ============================================

process.env.JWT_SECRET = 'test_secret_jest';

const request = require('supertest');
const { setupApp } = require('../app');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

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
  test('succesvol registreren geeft 201 en pending user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Gebruiker', email: `user${Date.now()}@test.nl`, password: 'test123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('USER');
    expect(res.body.user.status).toBe('PENDING');
    expect(res.body.token).toBeUndefined();
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
  test('succesvol inloggen van actieve gebruiker geeft 200 + token', async () => {
    const email = `login${Date.now()}@test.nl`;
    const password = 'wachtwoord';
    await User.create({
      name: 'Login Test',
      email,
      password: bcrypt.hashSync(password, 10),
      role: 'USER',
      status: 'ACTIVE'
    });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wachtwoord' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('pending gebruiker kan nog niet inloggen', async () => {
    const email = `pending${Date.now()}@test.nl`;
    await request(app).post('/api/auth/register').send({ name: 'Pending Test', email, password: 'wachtwoord' });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wachtwoord' });
    expect(res.statusCode).toBe(403);
    expect(res.body.fout).toMatch(/goedgekeurd/i);
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
    await User.create({
      name: 'Gewone User',
      email,
      password: bcrypt.hashSync('test123', 10),
      role: 'USER',
      status: 'ACTIVE'
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'test123' });
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

describe('Admin goedkeuringsflow', () => {
  let adminToken;

  test('ADMIN kan pending gebruiker goedkeuren waarna login werkt', async () => {
    const adminEmail = `admin${Date.now()}@test.nl`;
    const adminPassword = 'admin123';
    await User.create({
      name: 'Admin Test',
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 10),
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: adminPassword });
    adminToken = adminLogin.body.token;
    expect(adminLogin.statusCode).toBe(200);

    const userEmail = `wacht${Date.now()}@test.nl`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Wachtende User', email: userEmail, password: 'user123' });

    expect(registerRes.body.user.status).toBe('PENDING');

    const approveRes = await request(app)
      .put(`/api/admin/users/${registerRes.body.user.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approveRes.statusCode).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userEmail, password: 'user123' });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.user.status).toBe('ACTIVE');
  });
});
