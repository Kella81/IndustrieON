// ============================================
// Auth Routes
// Routes voor registratie en inloggen
// ============================================

const express = require('express');
const router = express.Router();
const { registreer, login, profiel } = require('../controllers/authController');
const { authenticeer } = require('../middleware/auth');

// Publieke routes
router.post('/register', registreer);
router.post('/login', login);

// Beveiligde route
router.get('/me', authenticeer, profiel);

module.exports = router;
