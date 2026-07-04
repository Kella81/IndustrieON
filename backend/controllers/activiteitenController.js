// ============================================
// Activiteiten Controller
// CRUD operaties voor activiteiten
// ============================================

const { Activity, User, Registration, Poll, PollOption, PollResponse, Comment, Feedback, sequelize } = require('../models');
const { fn, col, literal, Op } = require('sequelize');

/**
 * Haal alle activiteiten op
 * GET /api/activities
 */
async function alleActiviteiten(req, res) {
  const activiteiten = await Activity.findAll({
    attributes: {
      include: [
        [
          literal(`(SELECT COUNT(*) FROM registrations r WHERE r.activity_id = Activity.id AND r.status != 'niet_aanwezig')`),
          'deelnemers_aantal'
        ]
      ]
    },
    include: [{ model: User, as: 'organisator', attributes: [['name', 'organizer_name']] }],
    order: [['date', 'ASC']]
  });

  res.json(activiteiten);
}

/**
 * Haal een specifieke activiteit op met details
 * GET /api/activities/:id
 */
async function activiteitDetail(req, res) {
  const { id } = req.params;

  const activiteit = await Activity.findByPk(id, {
    attributes: {
      include: [
        [
          literal(`(SELECT COUNT(*) FROM registrations r WHERE r.activity_id = Activity.id AND r.status != 'niet_aanwezig')`),
          'deelnemers_aantal'
        ]
      ]
    },
    include: [{ model: User, as: 'organisator', attributes: [['name', 'organizer_name']] }]
  });

  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  const deelnemers = await Registration.findAll({
    where: { activity_id: id },
    include: [{ model: User, as: 'gebruiker', attributes: ['id', 'name', 'email'] }]
  });

  const polls = await Poll.findAll({
    where: { activity_id: id },
    include: [{
      model: PollOption,
      as: 'options',
      attributes: {
        include: [
          [literal(`(SELECT COUNT(*) FROM poll_responses pr WHERE pr.option_id = options.id)`), 'stemmen']
        ]
      }
    }]
  });

  const feedback = await Feedback.findAll({
    where: { activity_id: id },
    include: [{ model: User, as: 'gebruiker', attributes: [['name', 'user_name']] }],
    order: [['created_at', 'DESC']]
  });

  const ratingData = await Feedback.findOne({
    where: { activity_id: id },
    attributes: [
      [fn('AVG', col('rating')), 'gemiddelde'],
      [fn('COUNT', col('id')), 'aantal']
    ]
  });

  const gemiddelde = ratingData?.dataValues?.gemiddelde;

  res.json({
    ...activiteit.toJSON(),
    deelnemers,
    polls,
    feedback,
    gemiddelde_rating: gemiddelde ? Math.round(gemiddelde * 10) / 10 : null,
    feedback_aantal: ratingData?.dataValues?.aantal ?? 0
  });
}

/**
 * Maak een nieuwe activiteit aan (alleen ORGANIZER en ADMIN)
 * POST /api/activities
 */
async function maakActiviteit(req, res) {
  const { title, description, location, date, capacity } = req.body;

  if (!title || !description || !location || !date || !capacity) {
    return res.status(400).json({ fout: 'Alle velden zijn verplicht.' });
  }

  const activiteit = await Activity.create({
    title, description, location, date, capacity, organizer_id: req.user.id
  });

  res.status(201).json({
    bericht: 'Activiteit succesvol aangemaakt!',
    activiteit
  });
}

/**
 * Werk een activiteit bij (alleen de organisator of ADMIN)
 * PUT /api/activities/:id
 */
async function werkActiviteitBij(req, res) {
  const { id } = req.params;
  const { title, description, location, date, capacity } = req.body;

  const activiteit = await Activity.findByPk(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  if (activiteit.organizer_id !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ fout: 'Je mag deze activiteit niet bewerken.' });
  }

  await activiteit.update({
    title: title ?? activiteit.title,
    description: description ?? activiteit.description,
    location: location ?? activiteit.location,
    date: date ?? activiteit.date,
    capacity: capacity ?? activiteit.capacity
  });

  res.json({ bericht: 'Activiteit bijgewerkt!', activiteit });
}

/**
 * Verwijder een activiteit (alleen ADMIN)
 * DELETE /api/activities/:id
 */
async function verwijderActiviteit(req, res) {
  const { id } = req.params;

  const activiteit = await Activity.findByPk(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  await activiteit.destroy();
  res.json({ bericht: 'Activiteit succesvol verwijderd.' });
}

/**
 * Meld aan voor een activiteit
 * POST /api/activities/:id/register
 */
async function registreer(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const geldige = ['aanwezig', 'misschien', 'niet_aanwezig'];
  if (!status || !geldige.includes(status)) {
    return res.status(400).json({ fout: 'Ongeldige status. Kies: aanwezig, misschien of niet_aanwezig.' });
  }

  const activiteit = await Activity.findByPk(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  if (status !== 'niet_aanwezig') {
    const aantalDeelnemers = await Registration.count({
      where: { activity_id: id, status: { [Op.ne]: 'niet_aanwezig' } }
    });

    const bestaand = await Registration.findOne({ where: { user_id: userId, activity_id: id } });

    if (!bestaand && aantalDeelnemers >= activiteit.capacity) {
      return res.status(400).json({ fout: 'Deze activiteit zit helaas vol.' });
    }
  }

  const bestaand = await Registration.findOne({ where: { user_id: userId, activity_id: id } });

  if (bestaand) {
    await bestaand.update({ status });
    res.json({ bericht: 'Aanmelding bijgewerkt!', status });
  } else {
    await Registration.create({ user_id: userId, activity_id: id, status });
    res.status(201).json({ bericht: 'Succesvol aangemeld!', status });
  }
}

/**
 * Voeg een bericht toe aan een activiteit
 * POST /api/activities/:id/comments
 */
async function plaatsBericht(req, res) {
  const { id } = req.params;
  const { message, parent_id } = req.body;

  if (!message) {
    return res.status(400).json({ fout: 'Bericht mag niet leeg zijn.' });
  }

  const activiteit = await Activity.findByPk(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  const bericht = await Comment.create({
    activity_id: id,
    user_id: req.user.id,
    message,
    parent_id: parent_id || null
  });

  const volledig = await Comment.findByPk(bericht.id, {
    include: [{ model: User, as: 'gebruiker', attributes: [['name', 'user_name']] }]
  });

  res.status(201).json(volledig);
}

/**
 * Haal berichten op van een activiteit
 * GET /api/activities/:id/comments
 */
async function haalBerichten(req, res) {
  const { id } = req.params;

  const berichten = await Comment.findAll({
    where: { activity_id: id },
    include: [{ model: User, as: 'gebruiker', attributes: [['name', 'user_name'], ['role', 'user_role']] }],
    order: [['created_at', 'ASC']]
  });

  res.json(berichten);
}

/**
 * Geef feedback op een activiteit
 * POST /api/activities/:id/feedback
 */
async function geefFeedback(req, res) {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ fout: 'Rating moet tussen 1 en 5 zijn.' });
  }

  const activiteit = await Activity.findByPk(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  const bestaand = await Feedback.findOne({ where: { user_id: req.user.id, activity_id: id } });

  if (bestaand) {
    await bestaand.update({ rating, comment: comment || null });
    res.json({ bericht: 'Feedback bijgewerkt!' });
  } else {
    await Feedback.create({ activity_id: id, user_id: req.user.id, rating, comment: comment || null });
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
