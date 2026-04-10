// ============================================
// Polls Routes
// Routes voor stemmen op polls
// ============================================

const express = require('express');
const router = express.Router();
const { authenticeer } = require('../middleware/auth');
const { stemOpPoll } = require('../controllers/pollsController');

// Stem op een poll
router.post('/:id/vote', authenticeer, stemOpPoll);

module.exports = router;
