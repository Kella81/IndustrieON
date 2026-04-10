// ============================================
// Polls Controller
// Beheer van enquetes en stemmen
// ============================================

const db = require('../models/database');

/**
 * Maak een poll aan bij een activiteit
 * POST /api/activities/:id/polls
 */
function maakPoll(req, res) {
  const { id } = req.params;
  const { question, options } = req.body;

  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ fout: 'Vraag en minimaal 2 opties zijn verplicht.' });
  }

  // Controleer of activiteit bestaat
  const activiteit = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  // Alleen de organisator of admin mag polls aanmaken
  if (activiteit.organizer_id !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ fout: 'Je mag alleen polls toevoegen aan je eigen activiteiten.' });
  }

  // Poll aanmaken
  const pollResultaat = db.prepare(
    'INSERT INTO polls (activity_id, question) VALUES (?, ?)'
  ).run(id, question);

  const pollId = pollResultaat.lastInsertRowid;

  // Opties toevoegen
  const optieInsert = db.prepare('INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)');
  for (const optie of options) {
    optieInsert.run(pollId, optie);
  }

  // Poll met opties ophalen
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(pollId);
  poll.options = db.prepare('SELECT * FROM poll_options WHERE poll_id = ?').all(pollId);

  res.status(201).json({ bericht: 'Poll aangemaakt!', poll });
}

/**
 * Stem op een poll optie
 * POST /api/polls/:id/vote
 */
function stemOpPoll(req, res) {
  const { id } = req.params;
  const { option_id } = req.body;

  if (!option_id) {
    return res.status(400).json({ fout: 'Kies een optie om op te stemmen.' });
  }

  // Controleer of de poll bestaat
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(id);
  if (!poll) {
    return res.status(404).json({ fout: 'Poll niet gevonden.' });
  }

  // Controleer of de optie bij deze poll hoort
  const optie = db.prepare('SELECT * FROM poll_options WHERE id = ? AND poll_id = ?').get(option_id, id);
  if (!optie) {
    return res.status(400).json({ fout: 'Deze optie hoort niet bij deze poll.' });
  }

  // Controleer of gebruiker al gestemd heeft op een optie van deze poll
  const bestaand = db.prepare(`
    SELECT pr.id FROM poll_responses pr
    JOIN poll_options po ON pr.option_id = po.id
    WHERE pr.user_id = ? AND po.poll_id = ?
  `).get(req.user.id, id);

  if (bestaand) {
    // Stem bijwerken
    db.prepare('UPDATE poll_responses SET option_id = ? WHERE id = ?').run(option_id, bestaand.id);
    res.json({ bericht: 'Stem bijgewerkt!' });
  } else {
    // Nieuwe stem
    db.prepare(
      'INSERT INTO poll_responses (user_id, option_id) VALUES (?, ?)'
    ).run(req.user.id, option_id);
    res.status(201).json({ bericht: 'Stem geregistreerd!' });
  }
}

module.exports = { maakPoll, stemOpPoll };
