// ============================================
// Admin Controller
// Statistieken en gebruikersbeheer
// ============================================

const { User, Activity, Registration, Feedback, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Haal statistieken op voor het admin dashboard
 * GET /api/admin/stats
 */
async function statistieken(req, res) {
  const totaalGebruikers = await User.count();
  const totaalActiviteiten = await Activity.count();

  const populairste = await Activity.findAll({
    attributes: [
      'id', 'title', 'date', 'capacity',
      [fn('COUNT', col('Registrations.id')), 'deelnemers_aantal']
    ],
    include: [
      { model: User, as: 'organisator', attributes: [['name', 'organizer_name']] },
      {
        model: Registration,
        attributes: [],
        where: { status: { [Op.ne]: 'niet_aanwezig' } },
        required: false
      }
    ],
    group: ['Activity.id'],
    order: [[literal('deelnemers_aantal'), 'DESC']],
    limit: 10,
    subQuery: false
  });

  const beoordelingen = await Activity.findAll({
    attributes: [
      'id', 'title',
      [fn('ROUND', fn('AVG', col('Feedbacks.rating')), 1), 'gemiddelde_rating'],
      [fn('COUNT', col('Feedbacks.id')), 'aantal_reviews']
    ],
    include: [{ model: Feedback, attributes: [], required: true }],
    group: ['Activity.id'],
    order: [[literal('gemiddelde_rating'), 'DESC']],
    limit: 10,
    subQuery: false
  });

  const rolVerdeling = await User.findAll({
    attributes: ['role', [fn('COUNT', col('id')), 'aantal']],
    group: ['role']
  });

  const recenteRegistraties = await Registration.findAll({
    attributes: ['status', 'created_at'],
    include: [
      { model: User, as: 'gebruiker', attributes: [['name', 'user_name']] },
      { model: Activity, attributes: [['title', 'activity_title']] }
    ],
    order: [['created_at', 'DESC']],
    limit: 15
  });

  res.json({
    totaal_gebruikers: totaalGebruikers,
    totaal_activiteiten: totaalActiviteiten,
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
async function alleGebruikers(req, res) {
  const gebruikers = await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'created_at'],
    order: [['created_at', 'DESC']]
  });
  res.json(gebruikers);
}

/**
 * Wijzig de rol van een gebruiker
 * PUT /api/admin/users/:id/role
 */
async function wijzigRol(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const geldige = ['USER', 'ORGANIZER', 'ADMIN'];
  if (!role || !geldige.includes(role)) {
    return res.status(400).json({ fout: 'Ongeldige rol.' });
  }

  const gebruiker = await User.findByPk(id);
  if (!gebruiker) {
    return res.status(404).json({ fout: 'Gebruiker niet gevonden.' });
  }

  await gebruiker.update({ role });
  res.json({ bericht: 'Rol succesvol gewijzigd.' });
}

/**
 * Verwijder een gebruiker
 * DELETE /api/admin/users/:id
 */
async function verwijderGebruiker(req, res) {
  const { id } = req.params;

  if (Number(id) === req.user.id) {
    return res.status(400).json({ fout: 'Je kunt jezelf niet verwijderen.' });
  }

  const gebruiker = await User.findByPk(id);
  if (!gebruiker) {
    return res.status(404).json({ fout: 'Gebruiker niet gevonden.' });
  }

  await gebruiker.destroy();
  res.json({ bericht: 'Gebruiker verwijderd.' });
}

module.exports = { statistieken, alleGebruikers, wijzigRol, verwijderGebruiker };
