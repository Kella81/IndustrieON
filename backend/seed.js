// ============================================
// Seed Script
// Vult de database met voorbeelddata
// Gebruik: node seed.js
// ============================================

require('dotenv').config();
const { sequelize, initialiseerDatabase, User, Activity, Registration, Poll, PollOption, PollResponse, Comment, Feedback } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
  await initialiseerDatabase();

  console.log('Bestaande data verwijderen...');
  await PollResponse.destroy({ where: {}, truncate: true });
  await PollOption.destroy({ where: {}, truncate: true });
  await Poll.destroy({ where: {}, truncate: true });
  await Feedback.destroy({ where: {}, truncate: true });
  await Comment.destroy({ where: {}, truncate: true });
  await Registration.destroy({ where: {}, truncate: true });
  await Activity.destroy({ where: {}, truncate: true });
  await User.destroy({ where: {}, truncate: true });

  console.log('Voorbeeldgebruikers aanmaken...');
  const wachtwoord = bcrypt.hashSync('wachtwoord123', 10);

  const gebruikersData = [
    { name: 'Admin Beheerder', email: 'admin@industrieon.nl', role: 'ADMIN' },
    { name: 'Lisa de Vries', email: 'lisa@industrieon.nl', role: 'ORGANIZER' },
    { name: 'Mark Jansen', email: 'mark@industrieon.nl', role: 'ORGANIZER' },
    { name: 'Sophie Bakker', email: 'sophie@industrieon.nl', role: 'USER' },
    { name: 'Thomas van Dijk', email: 'thomas@industrieon.nl', role: 'USER' },
    { name: 'Emma Visser', email: 'emma@industrieon.nl', role: 'USER' },
    { name: 'Daan Mulder', email: 'daan@industrieon.nl', role: 'USER' },
    { name: 'Julia Bos', email: 'julia@industrieon.nl', role: 'USER' },
  ];

  const gebruikers = {};
  for (const g of gebruikersData) {
    const u = await User.create({ ...g, password: wachtwoord, status: 'ACTIVE' });
    gebruikers[g.email] = u.id;
  }

  console.log('Voorbeeldactiviteiten aanmaken...');
  const activiteitenData = [
    { title: 'Fotografie Workshop', description: 'Leer de basis van professionele fotografie. We behandelen compositie, belichting en nabewerking. Neem je eigen camera mee als je die hebt!', location: 'Creatieve Studio, Verdieping 3', date: '2026-03-15T14:00', capacity: 20, organizer: 'lisa@industrieon.nl' },
    { title: 'Vrijdagmiddag Voetbal', description: 'Elke vrijdag spelen we een potje voetbal op het veld achter het kantoor. Alle niveaus welkom!', location: 'Sportveld achter kantoor', date: '2026-03-14T16:00', capacity: 22, organizer: 'mark@industrieon.nl' },
    { title: 'Pizza & Code Night', description: "Een avond vol programmeren, pizza eten en kennis delen. Werk aan je eigen project of help collega's. Pizza wordt verzorgd!", location: 'Kantoor Ruimte A', date: '2026-03-20T18:00', capacity: 30, organizer: 'lisa@industrieon.nl' },
    { title: 'Yoga op het Dak', description: 'Ontspan na een drukke werkweek met yoga op het dakterras. Geschikt voor beginners en gevorderden.', location: 'Dakterras', date: '2026-03-21T12:00', capacity: 15, organizer: 'mark@industrieon.nl' },
    { title: 'Pub Quiz Avond', description: 'Test je kennis tijdens onze maandelijkse pub quiz! Maak teams van 4 personen. Er zijn leuke prijzen te winnen.', location: 'Bedrijfskantine', date: '2026-03-28T19:00', capacity: 40, organizer: 'lisa@industrieon.nl' },
    { title: 'Introductie Machine Learning', description: 'Een toegankelijke workshop over de basis van machine learning. Geen voorkennis vereist, we beginnen bij het begin.', location: 'Vergaderzaal Einstein', date: '2026-04-05T10:00', capacity: 25, organizer: 'lisa@industrieon.nl' },
  ];

  const activiteiten = {};
  for (let i = 0; i < activiteitenData.length; i++) {
    const a = activiteitenData[i];
    const act = await Activity.create({ title: a.title, description: a.description, location: a.location, date: a.date, capacity: a.capacity, organizer_id: gebruikers[a.organizer] });
    activiteiten[i] = act.id;
  }

  console.log('Registraties aanmaken...');
  const registraties = [
    [gebruikers['sophie@industrieon.nl'], activiteiten[0], 'aanwezig'],
    [gebruikers['thomas@industrieon.nl'], activiteiten[0], 'aanwezig'],
    [gebruikers['emma@industrieon.nl'], activiteiten[0], 'misschien'],
    [gebruikers['daan@industrieon.nl'], activiteiten[0], 'aanwezig'],
    [gebruikers['thomas@industrieon.nl'], activiteiten[1], 'aanwezig'],
    [gebruikers['daan@industrieon.nl'], activiteiten[1], 'aanwezig'],
    [gebruikers['sophie@industrieon.nl'], activiteiten[1], 'niet_aanwezig'],
    [gebruikers['sophie@industrieon.nl'], activiteiten[2], 'aanwezig'],
    [gebruikers['thomas@industrieon.nl'], activiteiten[2], 'aanwezig'],
    [gebruikers['emma@industrieon.nl'], activiteiten[2], 'aanwezig'],
    [gebruikers['julia@industrieon.nl'], activiteiten[2], 'misschien'],
    [gebruikers['daan@industrieon.nl'], activiteiten[2], 'aanwezig'],
    [gebruikers['emma@industrieon.nl'], activiteiten[3], 'aanwezig'],
    [gebruikers['julia@industrieon.nl'], activiteiten[3], 'aanwezig'],
    [gebruikers['sophie@industrieon.nl'], activiteiten[4], 'aanwezig'],
    [gebruikers['thomas@industrieon.nl'], activiteiten[4], 'aanwezig'],
    [gebruikers['emma@industrieon.nl'], activiteiten[4], 'aanwezig'],
    [gebruikers['daan@industrieon.nl'], activiteiten[4], 'aanwezig'],
    [gebruikers['julia@industrieon.nl'], activiteiten[4], 'aanwezig'],
  ];
  for (const [user_id, activity_id, status] of registraties) {
    await Registration.create({ user_id, activity_id, status });
  }

  console.log('Polls aanmaken...');
  const poll1 = await Poll.create({ activity_id: activiteiten[0], question: 'Heb je ervaring met fotografie?' });
  const opt1a = await PollOption.create({ poll_id: poll1.id, option_text: 'Beginner' });
  const opt1b = await PollOption.create({ poll_id: poll1.id, option_text: 'Gemiddeld' });
  await PollOption.create({ poll_id: poll1.id, option_text: 'Expert' });
  await PollResponse.create({ user_id: gebruikers['sophie@industrieon.nl'], option_id: opt1a.id });
  await PollResponse.create({ user_id: gebruikers['thomas@industrieon.nl'], option_id: opt1b.id });
  await PollResponse.create({ user_id: gebruikers['daan@industrieon.nl'], option_id: opt1a.id });

  const poll2 = await Poll.create({ activity_id: activiteiten[2], question: 'Welke programmeertaal gebruik je het meest?' });
  const opt2a = await PollOption.create({ poll_id: poll2.id, option_text: 'JavaScript' });
  const opt2b = await PollOption.create({ poll_id: poll2.id, option_text: 'Python' });
  await PollOption.create({ poll_id: poll2.id, option_text: 'Java' });
  const opt2d = await PollOption.create({ poll_id: poll2.id, option_text: 'Anders' });
  await PollResponse.create({ user_id: gebruikers['sophie@industrieon.nl'], option_id: opt2a.id });
  await PollResponse.create({ user_id: gebruikers['thomas@industrieon.nl'], option_id: opt2a.id });
  await PollResponse.create({ user_id: gebruikers['emma@industrieon.nl'], option_id: opt2b.id });
  await PollResponse.create({ user_id: gebruikers['daan@industrieon.nl'], option_id: opt2d.id });

  console.log('Berichten aanmaken...');
  const b1 = await Comment.create({ activity_id: activiteiten[0], user_id: gebruikers['sophie@industrieon.nl'], message: "Moet ik mijn eigen camera meenemen of zijn er camera's beschikbaar?", parent_id: null });
  await Comment.create({ activity_id: activiteiten[0], user_id: gebruikers['lisa@industrieon.nl'], message: "Er zijn een paar camera's beschikbaar, maar als je er zelf een hebt is dat fijn!", parent_id: b1.id });
  await Comment.create({ activity_id: activiteiten[0], user_id: gebruikers['thomas@industrieon.nl'], message: 'Klinkt super! Ik kijk er naar uit.', parent_id: null });
  await Comment.create({ activity_id: activiteiten[2], user_id: gebruikers['daan@industrieon.nl'], message: 'Zijn er ook vegetarische pizza opties?', parent_id: null });
  await Comment.create({ activity_id: activiteiten[2], user_id: gebruikers['lisa@industrieon.nl'], message: 'Jazeker! We bestellen bij een pizzeria met veel vegetarische keuzes.', parent_id: null });

  console.log('Feedback aanmaken...');
  await Feedback.create({ activity_id: activiteiten[1], user_id: gebruikers['thomas@industrieon.nl'], rating: 5, comment: 'Super leuk potje! Moeten we vaker doen.' });
  await Feedback.create({ activity_id: activiteiten[1], user_id: gebruikers['daan@industrieon.nl'], rating: 4, comment: 'Was gezellig, maar het veld was een beetje nat.' });
  await Feedback.create({ activity_id: activiteiten[0], user_id: gebruikers['sophie@industrieon.nl'], rating: 5, comment: 'Heel leerzaam! Lisa legt het goed uit.' });
  await Feedback.create({ activity_id: activiteiten[0], user_id: gebruikers['thomas@industrieon.nl'], rating: 4, comment: 'Goede workshop, graag een vervolg!' });
  await Feedback.create({ activity_id: activiteiten[0], user_id: gebruikers['daan@industrieon.nl'], rating: 5, comment: 'Fantastisch, ik heb veel geleerd.' });

  console.log('');
  console.log('===================================');
  console.log('Database succesvol gevuld!');
  console.log('===================================');
  console.log('');
  console.log('Inloggegevens (wachtwoord voor iedereen: wachtwoord123):');
  console.log('');
  console.log('ADMIN:     admin@industrieon.nl');
  console.log('ORGANIZER: lisa@industrieon.nl');
  console.log('ORGANIZER: mark@industrieon.nl');
  console.log('USER:      sophie@industrieon.nl');
  console.log('USER:      thomas@industrieon.nl');
  console.log('USER:      emma@industrieon.nl');
  console.log('');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
