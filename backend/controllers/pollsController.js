// ============================================
// Polls Controller
// Beheer van enquetes en stemmen
// ============================================

const { Activity, Poll, PollOption, PollResponse } = require('../models');

/**
 * Maak een poll aan bij een activiteit
 * POST /api/activities/:id/polls
 */
async function maakPoll(req, res) {
  const { id } = req.params;
  const { question, options } = req.body;

  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ fout: 'Vraag en minimaal 2 opties zijn verplicht.' });
  }

  const activiteit = await Activity.findByPk(id);
  if (!activiteit) {
    return res.status(404).json({ fout: 'Activiteit niet gevonden.' });
  }

  if (activiteit.organizer_id !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ fout: 'Je mag alleen polls toevoegen aan je eigen activiteiten.' });
  }

  const poll = await Poll.create({ activity_id: id, question });

  const optieRecords = options.map(option_text => ({ poll_id: poll.id, option_text }));
  await PollOption.bulkCreate(optieRecords);

  const volledigePoll = await Poll.findByPk(poll.id, {
    include: [{ model: PollOption, as: 'options' }]
  });

  res.status(201).json({ bericht: 'Poll aangemaakt!', poll: volledigePoll });
}

/**
 * Stem op een poll optie
 * POST /api/polls/:id/vote
 */
async function stemOpPoll(req, res) {
  const { id } = req.params;
  const { option_id } = req.body;

  if (!option_id) {
    return res.status(400).json({ fout: 'Kies een optie om op te stemmen.' });
  }

  const poll = await Poll.findByPk(id);
  if (!poll) {
    return res.status(404).json({ fout: 'Poll niet gevonden.' });
  }

  const optie = await PollOption.findOne({ where: { id: option_id, poll_id: id } });
  if (!optie) {
    return res.status(400).json({ fout: 'Deze optie hoort niet bij deze poll.' });
  }

  // Controleer of gebruiker al gestemd heeft op een optie van deze poll
  const bestaandeOptie = await PollOption.findOne({
    where: { poll_id: id },
    include: [{ model: PollResponse, where: { user_id: req.user.id }, required: true }]
  });

  if (bestaandeOptie) {
    const bestaandeStem = bestaandeOptie.PollResponses[0];
    await bestaandeStem.update({ option_id });
    res.json({ bericht: 'Stem bijgewerkt!' });
  } else {
    await PollResponse.create({ user_id: req.user.id, option_id });
    res.status(201).json({ bericht: 'Stem geregistreerd!' });
  }
}

module.exports = { maakPoll, stemOpPoll };
