// ============================================
// Admin Controller
// Statistieken en gebruikersbeheer
// ============================================

const db = require('../models/database');

/**
 * Haal statistieken op voor het admin dashboard
 * GET /api/admin/stats
 */
function statistieken(req, res) {
  // Totaal aantal gebruikers
  const totaalGebruikers = db.prepare('SELECT COUNT(*) AS aantal FROM users').get();

  // Totaal aantal activiteiten
  const totaalActiviteiten = db.prepare('SELECT COUNT(*) AS aantal FROM activities').get();

  // Populairste activiteiten (meeste deelnemers)
  const populairste = db.prepare(`
    SELECT 
      a.id, a.title, a.date, a.capacity,
      u.name AS organizer_name,
      COUNT(r.id) AS deelnemers_aantal
    FROM activities a
    LEFT JOIN registrations r ON r.activity_id = a.id AND r.status != 'niet_aanwezig'
    JOIN users u ON a.organizer_id = u.id
    GROUP BY a.id
    ORDER BY deelnemers_aantal DESC
    LIMIT 10
  `).all();

  // Activiteiten met gemiddelde rating
  const beoordelingen = db.prepare(`
    SELECT 
      a.id, a.title,
      ROUND(AVG(f.rating), 1) AS gemiddelde_rating,
      COUNT(f.id) AS aantal_reviews
    FROM activities a
    JOIN feedback f ON f.activity_id = a.id
    GROUP BY a.id
    ORDER BY gemiddelde_rating DESC
    LIMIT 10
  `).all();

  // Gebruikers per rol
  const rolVerdeling = db.prepare(`
    SELECT role, COUNT(*) AS aantal FROM users GROUP BY role
  `).all();

  // Recente registraties
  const recenteRegistraties = db.prepare(`
    SELECT 
      r.status, r.created_at,
      u.name AS user_name,
      a.title AS activity_title
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    JOIN activities a ON r.activity_id = a.id
    ORDER BY r.created_at DESC
    LIMIT 15
  `).all();

  res.json({
    totaal_gebruikers: totaalGebruikers.aantal,
    totaal_activiteiten: totaalActiviteiten.aantal,
    populairste_activiteiten: populairste,
    best_beoordeeld: beoordelingen,
    rol_verdeling: rolVerdeling,
    recente_registraties: recenteRegistraties
  });
}

/**
 * Haal alle gebruikers op
 * GET /api/admin/users
 */
function alleGebruikers(req, res) {
  const gebruikers = db.prepare(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(gebruikers);
}

/**
 * Wijzig de rol van een gebruiker
 * PUT /api/admin/users/:id/role
 */
function wijzigRol(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const geldige = ['USER', 'ORGANIZER', 'ADMIN'];
  if (!role || !geldige.includes(role)) {
    return res.status(400).json({ fout: 'Ongeldige rol.' });
  }

  const gebruiker = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!gebruiker) {
    return res.status(404).json({ fout: 'Gebruiker niet gevonden.' });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  res.json({ bericht: 'Rol succesvol gewijzigd.' });
}

/**
 * Verwijder een gebruiker
 * DELETE /api/admin/users/:id
 */
function verwijderGebruiker(req, res) {
  const { id } = req.params;

  // Voorkom dat admin zichzelf verwijdert
  if (Number(id) === req.user.id) {
    return res.status(400).json({ fout: 'Je kunt jezelf niet verwijderen.' });
  }

  const gebruiker = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!gebruiker) {
    return res.status(404).json({ fout: 'Gebruiker niet gevonden.' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ bericht: 'Gebruiker verwijderd.' });
}

module.exports = { statistieken, alleGebruikers, wijzigRol, verwijderGebruiker };
