// ============================================
// Auth Controller
// Registratie en inloggen van gebruikers
// ============================================

const db = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Registreer een nieuwe gebruiker
 * POST /api/auth/register
 */
function registreer(req, res) {
  const { name, email, password, role } = req.body;

  // Validatie van invoer
  if (!name || !email || !password) {
    return res.status(400).json({ fout: 'Naam, email en wachtwoord zijn verplicht.' });
  }

  // Controleer of email al bestaat
  const bestaandeGebruiker = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (bestaandeGebruiker) {
    return res.status(400).json({ fout: 'Dit emailadres is al in gebruik.' });
  }

  // Wachtwoord hashen voor veiligheid
  const gehasht = bcrypt.hashSync(password, 10);

  // Alleen USER of ORGANIZER mag via registratie (ADMIN wordt handmatig aangemaakt)
  const gebruikersRol = (role === 'ORGANIZER') ? 'ORGANIZER' : 'USER';

  const resultaat = db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run(name, email, gehasht, gebruikersRol);

  // JWT token genereren
  const token = jwt.sign(
    { id: resultaat.lastInsertRowid, name, email, role: gebruikersRol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    bericht: 'Account succesvol aangemaakt!',
    token,
    user: { id: resultaat.lastInsertRowid, name, email, role: gebruikersRol }
  });
}

/**
 * Inloggen met email en wachtwoord
 * POST /api/auth/login
 */
function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ fout: 'Email en wachtwoord zijn verplicht.' });
  }

  // Gebruiker opzoeken
  const gebruiker = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!gebruiker) {
    return res.status(401).json({ fout: 'Onjuist emailadres of wachtwoord.' });
  }

  // Wachtwoord vergelijken
  const wachtwoordKlopt = bcrypt.compareSync(password, gebruiker.password);
  if (!wachtwoordKlopt) {
    return res.status(401).json({ fout: 'Onjuist emailadres of wachtwoord.' });
  }

  // JWT token genereren
  const token = jwt.sign(
    { id: gebruiker.id, name: gebruiker.name, email: gebruiker.email, role: gebruiker.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    bericht: 'Succesvol ingelogd!',
    token,
    user: { id: gebruiker.id, name: gebruiker.name, email: gebruiker.email, role: gebruiker.role }
  });
}

/**
 * Haal het profiel op van de ingelogde gebruiker
 * GET /api/auth/me
 */
function profiel(req, res) {
  const gebruiker = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!gebruiker) {
    return res.status(404).json({ fout: 'Gebruiker niet gevonden.' });
  }
  res.json(gebruiker);
}

module.exports = { registreer, login, profiel };
