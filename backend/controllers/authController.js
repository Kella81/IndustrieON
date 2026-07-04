// ============================================
// Auth Controller
// Registratie en inloggen van gebruikers
// ============================================

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Registreer een nieuwe gebruiker
 * POST /api/auth/register
 */
async function registreer(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ fout: 'Naam, email en wachtwoord zijn verplicht.' });
  }

  const bestaandeGebruiker = await User.findOne({ where: { email } });
  if (bestaandeGebruiker) {
    return res.status(400).json({ fout: 'Dit emailadres is al in gebruik.' });
  }

  const gehasht = bcrypt.hashSync(password, 10);
  const gebruiker = await User.create({
    name,
    email,
    password: gehasht,
    role: 'USER',
    status: 'PENDING'
  });

  res.status(201).json({
    bericht: 'Account succesvol aangemaakt! Je account wacht op goedkeuring van de admin.',
    user: { id: gebruiker.id, name, email, role: 'USER', status: 'PENDING' }
  });
}

/**
 * Inloggen met email en wachtwoord
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ fout: 'Email en wachtwoord zijn verplicht.' });
  }

  const gebruiker = await User.findOne({ where: { email } });
  if (!gebruiker) {
    return res.status(401).json({ fout: 'Onjuist emailadres of wachtwoord.' });
  }

  const wachtwoordKlopt = bcrypt.compareSync(password, gebruiker.password);
  if (!wachtwoordKlopt) {
    return res.status(401).json({ fout: 'Onjuist emailadres of wachtwoord.' });
  }

  if (gebruiker.status !== 'ACTIVE') {
    return res.status(403).json({ fout: 'Je account moet eerst worden goedgekeurd door de admin.' });
  }

  const token = jwt.sign(
    { id: gebruiker.id, name: gebruiker.name, email: gebruiker.email, role: gebruiker.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    bericht: 'Succesvol ingelogd!',
    token,
    user: { id: gebruiker.id, name: gebruiker.name, email: gebruiker.email, role: gebruiker.role, status: gebruiker.status }
  });
}

/**
 * Haal het profiel op van de ingelogde gebruiker
 * GET /api/auth/me
 */
async function profiel(req, res) {
  const gebruiker = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'role', 'status', 'created_at']
  });
  if (!gebruiker) {
    return res.status(404).json({ fout: 'Gebruiker niet gevonden.' });
  }
  res.json(gebruiker);
}

module.exports = { registreer, login, profiel };
