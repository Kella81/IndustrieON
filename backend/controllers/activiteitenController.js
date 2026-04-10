// ============================================
// Activiteiten Controller
// CRUD operaties voor activiteiten
// ============================================

const db = require('../models/database');

/**
 * Haal alle activiteiten op
 * GET /api/activities
 */
function alleActiviteiten(req, res) {
  const activiteiten = db.prepare(`
    SELECT 
      a.*,
      u.name AS organizer_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id AND r.status != 'niet_aanwezig') AS deelnemers_aantal
    FROM activities a
    JOIN users u ON a.organizer_id = u.id
    ORDER BY a.date ASC
  `).all();

  res.json(activiteiten);
}

/**
 * Haal een specifieke activiteit op met details
 * GET /api/activities/:id
 */
function activiteitDetail(req, res) {
  const { id } = req.params;

  // Activiteit ophalen met organisator naam
  const activiteit = db.prepare(`
    SELECT 
      a.*,
      u.name AS organizer_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.activity_id = a.id AND r.status != 'niet_aanwezig') AS deelnemers_aantal
    FROM activities a
    JOIN users u ON a.organizer_id = u.id
    WHERE a.id = ?
  `).get(id);

  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  // Deelnemers ophalen
  const deelnemers = db.prepare(`
    SELECT r.status, u.id, u.name, u.email
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    WHERE r.activity_id = ?
  `).all(id);

  // Polls ophalen met opties en stemmen
  const polls = db.prepare('SELECT * FROM polls WHERE activity_id = ?').all(id);
  for (const poll of polls) {
    poll.options = db.prepare(`
      SELECT po.*, 
        (SELECT COUNT(*) FROM poll_responses pr WHERE pr.option_id = po.id) AS stemmen
      FROM poll_options po
      WHERE po.poll_id = ?
    `).all(poll.id);
  }

  // Feedback ophalen
  const feedback = db.prepare(`
    SELECT f.*, u.name AS user_name
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    WHERE f.activity_id = ?
    ORDER BY f.created_at DESC
  `).all(id);

  // Gemiddelde rating berekenen
  const ratingData = db.prepare(`
    SELECT AVG(rating) AS gemiddelde, COUNT(*) AS aantal
    FROM feedback
    WHERE activity_id = ?
  `).get(id);

  res.json({
    ...activiteit,
    deelnemers,
    polls,
    feedback,
    gemiddelde_rating: ratingData.gemiddelde ? Math.round(ratingData.gemiddelde * 10) / 10 : null,
    feedback_aantal: ratingData.aantal
  });
}

/**
 * Maak een nieuwe activiteit aan (alleen ORGANIZER en ADMIN)
 * POST /api/activities
 */
function maakActiviteit(req, res) {
  const { title, description, location, date, capacity } = req.body;

  if (!title || !description || !location || !date || !capacity) {
    return res.status(400).json({ fout: 'Alle velden zijn verplicht.' });
  }

  const resultaat = db.prepare(
    'INSERT INTO activities (title, description, location, date, capacity, organizer_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, description, location, date, capacity, req.user.id);

  const activiteit = db.prepare('SELECT * FROM activities WHERE id = ?').get(resultaat.lastInsertRowid);

  res.status(201).json({
    bericht: 'Activiteit succesvol aangemaakt!',
    activiteit
  });
}

/**
 * Werk een activiteit bij (alleen de organisator of ADMIN)
 * PUT /api/activities/:id
 */
function werkActiviteitBij(req, res) {
  const { id } = req.params;
  const { title, description, location, date, capacity } = req.body;

  const activiteit = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  // Alleen de organisator of een admin mag bewerken
  if (activiteit.organizer_id !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ fout: 'Je mag deze activiteit niet bewerken.' });
  }

  db.prepare(`
    UPDATE activities SET 
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      location = COALESCE(?, location),
      date = COALESCE(?, date),
      capacity = COALESCE(?, capacity)
    WHERE id = ?
  `).run(title, description, location, date, capacity, id);

  const bijgewerkt = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  res.json({ bericht: 'Activiteit bijgewerkt!', activiteit: bijgewerkt });
}

/**
 * Verwijder een activiteit (alleen ADMIN)
 * DELETE /api/activities/:id
 */
function verwijderActiviteit(req, res) {
  const { id } = req.params;

  const activiteit = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  res.json({ bericht: 'Activiteit succesvol verwijderd.' });
}

/**
 * Meld aan voor een activiteit
 * POST /api/activities/:id/register
 */
function registreer(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  // Valideer status
  const geldige = ['aanwezig', 'misschien', 'niet_aanwezig'];
  if (!status || !geldige.includes(status)) {
    return res.status(400).json({ fout: 'Ongeldige status. Kies: aanwezig, misschien of niet_aanwezig.' });
  }

  // Controleer of activiteit bestaat
  const activiteit = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  // Controleer capaciteit (alleen als status niet "niet_aanwezig" is)
  if (status !== 'niet_aanwezig') {
    const aantalDeelnemers = db.prepare(
      "SELECT COUNT(*) AS aantal FROM registrations WHERE activity_id = ? AND status != 'niet_aanwezig'"
    ).get(id);

    // Check of er al een bestaande registratie is
    const bestaand = db.prepare(
      'SELECT * FROM registrations WHERE user_id = ? AND activity_id = ?'
    ).get(userId, id);

    // Als er geen bestaande registratie is en de activiteit is vol
    if (!bestaand && aantalDeelnemers.aantal >= activiteit.capacity) {
      return res.status(400).json({ fout: 'Deze activiteit zit helaas vol.' });
    }
  }

  // Upsert: bijwerken als al aangemeld, anders nieuw aanmaken
  const bestaand = db.prepare(
    'SELECT * FROM registrations WHERE user_id = ? AND activity_id = ?'
  ).get(userId, id);

  if (bestaand) {
    db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run(status, bestaand.id);
    res.json({ bericht: 'Aanmelding bijgewerkt!', status });
  } else {
    db.prepare(
      'INSERT INTO registrations (user_id, activity_id, status) VALUES (?, ?, ?)'
    ).run(userId, id, status);
    res.status(201).json({ bericht: 'Succesvol aangemeld!', status });
  }
}

/**
 * Voeg een bericht toe aan een activiteit
 * POST /api/activities/:id/comments
 */
function plaatsBericht(req, res) {
  const { id } = req.params;
  const { message, parent_id } = req.body;

  if (!message) {
    return res.status(400).json({ fout: 'Bericht mag niet leeg zijn.' });
  }

  const activiteit = db.prepare('SELECT id FROM activities WHERE id = ?').get(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  const resultaat = db.prepare(
    'INSERT INTO comments (activity_id, user_id, message, parent_id) VALUES (?, ?, ?, ?)'
  ).run(id, req.user.id, message, parent_id || null);

  const bericht = db.prepare(`
    SELECT c.*, u.name AS user_name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(resultaat.lastInsertRowid);

  res.status(201).json(bericht);
}

/**
 * Haal berichten op van een activiteit
 * GET /api/activities/:id/comments
 */
function haalBerichten(req, res) {
  const { id } = req.params;

  const berichten = db.prepare(`
    SELECT c.*, u.name AS user_name, u.role AS user_role
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.activity_id = ?
    ORDER BY c.created_at ASC
  `).all(id);

  res.json(berichten);
}

/**
 * Geef feedback op een activiteit
 * POST /api/activities/:id/feedback
 */
function geefFeedback(req, res) {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ fout: 'Rating moet tussen 1 en 5 zijn.' });
  }

  const activiteit = db.prepare('SELECT id FROM activities WHERE id = ?').get(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  // Controleer of gebruiker al feedback heeft gegeven
  const bestaand = db.prepare(
    'SELECT id FROM feedback WHERE user_id = ? AND activity_id = ?'
  ).get(req.user.id, id);

  if (bestaand) {
    db.prepare('UPDATE feedback SET rating = ?, comment = ? WHERE id = ?').run(rating, comment || null, bestaand.id);
    res.json({ bericht: 'Feedback bijgewerkt!' });
  } else {
    db.prepare(
      'INSERT INTO feedback (activity_id, user_id, rating, comment) VALUES (?, ?, ?, ?)'
    ).run(id, req.user.id, rating, comment || null);
    res.status(201).json({ bericht: 'Feedback toegevoegd!' });
  }
}

module.exports = {
  alleActiviteiten,
  activiteitDetail,
  maakActiviteit,
  werkActiviteitBij,
  verwijderActiviteit,
  registreer,
  plaatsBericht,
  haalBerichten,
  geefFeedback
};
