// ============================================
// Seed Script
// Vult de database met voorbeelddata
// Gebruik: node seed.js
// ============================================

require('dotenv').config();
const db = require('./models/database');
const bcrypt = require('bcryptjs');

async function seed() {
  // Database initialiseren
  await db.initializeDatabase();
  db.initialiseerDatabase();

console.log('Bestaande data verwijderen...');
db.exec(`
  DELETE FROM poll_responses;
  DELETE FROM poll_options;
  DELETE FROM polls;
  DELETE FROM feedback;
  DELETE FROM comments;
  DELETE FROM registrations;
  DELETE FROM activities;
  DELETE FROM users;
`);

console.log('Voorbeeldgebruikers aanmaken...');
const wachtwoord = bcrypt.hashSync('wachtwoord123', 10);

const gebruikersInsert = db.prepare(
  'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
);

// Gebruikers aanmaken
const gebruikers = [
  { name: 'Admin Beheerder', email: 'admin@industrieon.nl', role: 'ADMIN' },
  { name: 'Lisa de Vries', email: 'lisa@industrieon.nl', role: 'ORGANIZER' },
  { name: 'Mark Jansen', email: 'mark@industrieon.nl', role: 'ORGANIZER' },
  { name: 'Sophie Bakker', email: 'sophie@industrieon.nl', role: 'USER' },
  { name: 'Thomas van Dijk', email: 'thomas@industrieon.nl', role: 'USER' },
  { name: 'Emma Visser', email: 'emma@industrieon.nl', role: 'USER' },
  { name: 'Daan Mulder', email: 'daan@industrieon.nl', role: 'USER' },
  { name: 'Julia Bos', email: 'julia@industrieon.nl', role: 'USER' },
];

const gebruikerIds = {};
for (const g of gebruikers) {
  const res = gebruikersInsert.run(g.name, g.email, wachtwoord, g.role);
  gebruikerIds[g.email] = res.lastInsertRowid;
}

console.log('Voorbeeldactiviteiten aanmaken...');
const activiteitenInsert = db.prepare(
  'INSERT INTO activities (title, description, location, date, capacity, organizer_id) VALUES (?, ?, ?, ?, ?, ?)'
);

const activiteiten = [
  {
    title: 'Fotografie Workshop',
    description: 'Leer de basis van professionele fotografie. We behandelen compositie, belichting en nabewerking. Neem je eigen camera mee als je die hebt!',
    location: 'Creatieve Studio, Verdieping 3',
    date: '2026-03-15T14:00',
    capacity: 20,
    organizer: 'lisa@industrieon.nl'
  },
  {
    title: 'Vrijdagmiddag Voetbal',
    description: 'Elke vrijdag spelen we een potje voetbal op het veld achter het kantoor. Alle niveaus welkom!',
    location: 'Sportveld achter kantoor',
    date: '2026-03-14T16:00',
    capacity: 22,
    organizer: 'mark@industrieon.nl'
  },
  {
    title: 'Pizza & Code Night',
    description: 'Een avond vol programmeren, pizza eten en kennis delen. Werk aan je eigen project of help collega\'s. Pizza wordt verzorgd!',
    location: 'Kantoor Ruimte A',
    date: '2026-03-20T18:00',
    capacity: 30,
    organizer: 'lisa@industrieon.nl'
  },
  {
    title: 'Yoga op het Dak',
    description: 'Ontspan na een drukke werkweek met yoga op het dakterras. Geschikt voor beginners en gevorderden.',
    location: 'Dakterras',
    date: '2026-03-21T12:00',
    capacity: 15,
    organizer: 'mark@industrieon.nl'
  },
  {
    title: 'Pub Quiz Avond',
    description: 'Test je kennis tijdens onze maandelijkse pub quiz! Maak teams van 4 personen. Er zijn leuke prijzen te winnen.',
    location: 'Bedrijfskantine',
    date: '2026-03-28T19:00',
    capacity: 40,
    organizer: 'lisa@industrieon.nl'
  },
  {
    title: 'Introductie Machine Learning',
    description: 'Een toegankelijke workshop over de basis van machine learning. Geen voorkennis vereist, we beginnen bij het begin.',
    location: 'Vergaderzaal Einstein',
    date: '2026-04-05T10:00',
    capacity: 25,
    organizer: 'lisa@industrieon.nl'
  }
];

const activiteitIds = {};
for (let i = 0; i < activiteiten.length; i++) {
  const a = activiteiten[i];
  const res = activiteitenInsert.run(
    a.title, a.description, a.location, a.date, a.capacity,
    gebruikerIds[a.organizer]
  );
  activiteitIds[i] = res.lastInsertRowid;
}

console.log('Registraties aanmaken...');
const regInsert = db.prepare(
  'INSERT INTO registrations (user_id, activity_id, status) VALUES (?, ?, ?)'
);

// Registraties voor Fotografie Workshop
regInsert.run(gebruikerIds['sophie@industrieon.nl'], activiteitIds[0], 'aanwezig');
regInsert.run(gebruikerIds['thomas@industrieon.nl'], activiteitIds[0], 'aanwezig');
regInsert.run(gebruikerIds['emma@industrieon.nl'], activiteitIds[0], 'misschien');
regInsert.run(gebruikerIds['daan@industrieon.nl'], activiteitIds[0], 'aanwezig');

// Registraties voor Voetbal
regInsert.run(gebruikerIds['thomas@industrieon.nl'], activiteitIds[1], 'aanwezig');
regInsert.run(gebruikerIds['daan@industrieon.nl'], activiteitIds[1], 'aanwezig');
regInsert.run(gebruikerIds['sophie@industrieon.nl'], activiteitIds[1], 'niet_aanwezig');

// Registraties voor Pizza & Code Night
regInsert.run(gebruikerIds['sophie@industrieon.nl'], activiteitIds[2], 'aanwezig');
regInsert.run(gebruikerIds['thomas@industrieon.nl'], activiteitIds[2], 'aanwezig');
regInsert.run(gebruikerIds['emma@industrieon.nl'], activiteitIds[2], 'aanwezig');
regInsert.run(gebruikerIds['julia@industrieon.nl'], activiteitIds[2], 'misschien');
regInsert.run(gebruikerIds['daan@industrieon.nl'], activiteitIds[2], 'aanwezig');

// Registraties voor Yoga
regInsert.run(gebruikerIds['emma@industrieon.nl'], activiteitIds[3], 'aanwezig');
regInsert.run(gebruikerIds['julia@industrieon.nl'], activiteitIds[3], 'aanwezig');

// Registraties voor Pub Quiz
regInsert.run(gebruikerIds['sophie@industrieon.nl'], activiteitIds[4], 'aanwezig');
regInsert.run(gebruikerIds['thomas@industrieon.nl'], activiteitIds[4], 'aanwezig');
regInsert.run(gebruikerIds['emma@industrieon.nl'], activiteitIds[4], 'aanwezig');
regInsert.run(gebruikerIds['daan@industrieon.nl'], activiteitIds[4], 'aanwezig');
regInsert.run(gebruikerIds['julia@industrieon.nl'], activiteitIds[4], 'aanwezig');

console.log('Polls aanmaken...');
const pollInsert = db.prepare('INSERT INTO polls (activity_id, question) VALUES (?, ?)');
const optieInsert = db.prepare('INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)');
const stemInsert = db.prepare('INSERT INTO poll_responses (user_id, option_id) VALUES (?, ?)');

// Poll voor Fotografie Workshop
const poll1 = pollInsert.run(activiteitIds[0], 'Heb je ervaring met fotografie?');
const opt1a = optieInsert.run(poll1.lastInsertRowid, 'Beginner');
const opt1b = optieInsert.run(poll1.lastInsertRowid, 'Gemiddeld');
const opt1c = optieInsert.run(poll1.lastInsertRowid, 'Expert');

stemInsert.run(gebruikerIds['sophie@industrieon.nl'], opt1a.lastInsertRowid);
stemInsert.run(gebruikerIds['thomas@industrieon.nl'], opt1b.lastInsertRowid);
stemInsert.run(gebruikerIds['daan@industrieon.nl'], opt1a.lastInsertRowid);

// Poll voor Pizza & Code Night
const poll2 = pollInsert.run(activiteitIds[2], 'Welke programmeertaal gebruik je het meest?');
const opt2a = optieInsert.run(poll2.lastInsertRowid, 'JavaScript');
const opt2b = optieInsert.run(poll2.lastInsertRowid, 'Python');
const opt2c = optieInsert.run(poll2.lastInsertRowid, 'Java');
const opt2d = optieInsert.run(poll2.lastInsertRowid, 'Anders');

stemInsert.run(gebruikerIds['sophie@industrieon.nl'], opt2a.lastInsertRowid);
stemInsert.run(gebruikerIds['thomas@industrieon.nl'], opt2a.lastInsertRowid);
stemInsert.run(gebruikerIds['emma@industrieon.nl'], opt2b.lastInsertRowid);
stemInsert.run(gebruikerIds['daan@industrieon.nl'], opt2d.lastInsertRowid);

console.log('Berichten aanmaken...');
const berichtInsert = db.prepare(
  'INSERT INTO comments (activity_id, user_id, message, parent_id) VALUES (?, ?, ?, ?)'
);

// Berichten bij Fotografie Workshop
const b1 = berichtInsert.run(activiteitIds[0], gebruikerIds['sophie@industrieon.nl'],
  'Moet ik mijn eigen camera meenemen of zijn er camera\'s beschikbaar?', null);
berichtInsert.run(activiteitIds[0], gebruikerIds['lisa@industrieon.nl'],
  'Er zijn een paar camera\'s beschikbaar, maar als je er zelf een hebt is dat fijn!', b1.lastInsertRowid);

berichtInsert.run(activiteitIds[0], gebruikerIds['thomas@industrieon.nl'],
  'Klinkt super! Ik kijk er naar uit.', null);

// Berichten bij Pizza & Code Night
berichtInsert.run(activiteitIds[2], gebruikerIds['daan@industrieon.nl'],
  'Zijn er ook vegetarische pizza opties?', null);
berichtInsert.run(activiteitIds[2], gebruikerIds['lisa@industrieon.nl'],
  'Jazeker! We bestellen bij een pizzeria met veel vegetarische keuzes.', null);

console.log('Feedback aanmaken...');
const feedbackInsert = db.prepare(
  'INSERT INTO feedback (activity_id, user_id, rating, comment) VALUES (?, ?, ?, ?)'
);

// Feedback voor eerdere activiteiten (we doen alsof sommige al geweest zijn)
feedbackInsert.run(activiteitIds[1], gebruikerIds['thomas@industrieon.nl'], 5,
  'Super leuk potje! Moeten we vaker doen.');
feedbackInsert.run(activiteitIds[1], gebruikerIds['daan@industrieon.nl'], 4,
  'Was gezellig, maar het veld was een beetje nat.');

feedbackInsert.run(activiteitIds[0], gebruikerIds['sophie@industrieon.nl'], 5,
  'Heel leerzaam! Lisa legt het goed uit.');
feedbackInsert.run(activiteitIds[0], gebruikerIds['thomas@industrieon.nl'], 4,
  'Goede workshop, graag een vervolg!');
feedbackInsert.run(activiteitIds[0], gebruikerIds['daan@industrieon.nl'], 5,
  'Fantastisch, ik heb veel geleerd.');

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
