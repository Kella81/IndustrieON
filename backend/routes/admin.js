// ============================================
// Admin Routes
// Routes voor beheer en statistieken
// ============================================

const express = require('express');
const router = express.Router();
const { authenticeer, autoriseer } = require('../middleware/auth');
const { statistieken, alleGebruikers, wijzigRol, verwijderGebruiker } = require('../controllers/adminController');

// Alle admin routes vereisen ADMIN rol
router.use(authenticeer, autoriseer('ADMIN'));

router.get('/stats', statistieken);
router.get('/users', alleGebruikers);
router.put('/users/:id/role', wijzigRol);
router.delete('/users/:id', verwijderGebruiker);

module.exports = router;
