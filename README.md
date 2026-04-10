<<<<<<< HEAD
# IndustrieON Activiteitenplanner

Een webapplicatie voor het centraal beheren van interne bedrijfsactiviteiten.
Gebouwd met React (frontend) en Node.js/Express (backend).

## Snel starten

### Methode 1: Start script
```bash
cd /mnt/HC_Volume_104064564/industrieon
./start.sh
```

### Methode 2: Handmatig starten

**Terminal 1 - Backend:**
```bash
cd /mnt/HC_Volume_104064564/industrieon/backend
npm install
npm run seed
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /mnt/HC_Volume_104064564/industrieon/frontend
npm install
npm start
```

## Openen in de browser

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:5000/api |

## Inloggegevens

Wachtwoord voor alle accounts: `wachtwoord123`

| Rol       | Email                    |
|-----------|--------------------------|
| ADMIN     | admin@industrieon.nl     |
| ORGANIZER | lisa@industrieon.nl      |
| ORGANIZER | mark@industrieon.nl      |
| USER      | sophie@industrieon.nl    |
| USER      | thomas@industrieon.nl    |
| USER      | emma@industrieon.nl      |

## Projectstructuur

```
industrieon/
├── backend/
│   ├── controllers/          # Logica per functionaliteit
│   │   ├── authController.js
│   │   ├── activiteitenController.js
│   │   ├── pollsController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js           # JWT authenticatie
│   ├── models/
│   │   └── database.js       # SQLite database setup
│   ├── routes/               # API route definities
│   │   ├── auth.js
│   │   ├── activities.js
│   │   ├── polls.js
│   │   └── admin.js
│   ├── server.js             # Express server
│   ├── seed.js               # Voorbeelddata
│   └── .env                  # Configuratie
├── frontend/
│   └── src/
│       ├── components/       # Herbruikbare componenten
│       ├── pages/            # Pagina componenten
│       ├── services/         # API communicatie
│       ├── context/          # React context (auth)
│       ├── App.js            # Hoofd component + routing
│       └── App.css           # Styling
└── start.sh                  # Start script
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Account aanmaken
- `POST /api/auth/login` - Inloggen
- `GET /api/auth/me` - Profiel ophalen

### Activiteiten
- `GET /api/activities` - Alle activiteiten
- `GET /api/activities/:id` - Activiteit details
- `POST /api/activities` - Nieuwe activiteit (ORGANIZER/ADMIN)
- `PUT /api/activities/:id` - Activiteit bewerken
- `DELETE /api/activities/:id` - Verwijderen (ADMIN)

### Registraties
- `POST /api/activities/:id/register` - Aanmelden/afmelden

### Berichten
- `GET /api/activities/:id/comments` - Berichten ophalen
- `POST /api/activities/:id/comments` - Bericht plaatsen

### Feedback
- `POST /api/activities/:id/feedback` - Feedback geven

### Polls
- `POST /api/activities/:id/polls` - Poll aanmaken
- `POST /api/polls/:id/vote` - Stemmen

### Admin
- `GET /api/admin/stats` - Statistieken
- `GET /api/admin/users` - Gebruikers lijst
- `PUT /api/admin/users/:id/role` - Rol wijzigen
- `DELETE /api/admin/users/:id` - Gebruiker verwijderen

## Technologieen

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via better-sqlite3)
- **Authenticatie:** JWT (JSON Web Tokens)
- **Wachtwoorden:** bcrypt hashing
