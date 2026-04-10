// ============================================
// Activiteiten Routes
// Routes voor activiteiten, registraties, 
// berichten en feedback
// ============================================

const express = require('express');
const router = express.Router();
const { authenticeer, autoriseer } = require('../middleware/auth');
const {
  alleActiviteiten,
  activiteitDetail,
  maakActiviteit,
  werkActiviteitBij,
  verwijderActiviteit,
  registreer,
  plaatsBericht,
  haalBerichten,
  geefFeedback
} = require('../controllers/activiteitenController');
const { maakPoll } = require('../controllers/pollsController');

// Publieke routes (activiteiten bekijken)
router.get('/', alleActiviteiten);
router.get('/:id', activiteitDetail);

// Beveiligde routes
router.post('/', authenticeer, autoriseer('ORGANIZER', 'ADMIN'), maakActiviteit);
router.put('/:id', authenticeer, autoriseer('ORGANIZER', 'ADMIN'), werkActiviteitBij);
router.delete('/:id', authenticeer, autoriseer('ADMIN'), verwijderActiviteit);

// Registraties
router.post('/:id/register', authenticeer, registreer);

// Berichten
router.get('/:id/comments', haalBerichten);
router.post('/:id/comments', authenticeer, plaatsBericht);

// Feedback
router.post('/:id/feedback', authenticeer, geefFeedback);

// Polls
router.post('/:id/polls', authenticeer, autoriseer('ORGANIZER', 'ADMIN'), maakPoll);

module.exports = router;
