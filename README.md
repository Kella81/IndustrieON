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

## Deployen naar Vercel

Deze applicatie draait het best als twee aparte Vercel-projecten:

### 1. Frontend project
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: automatisch via Vercel voor Create React App
- Environment variable: `REACT_APP_API_URL` = de publieke URL van de backend, bijvoorbeeld `https://industrieon-backend.vercel.app/api`

### 2. Backend project
- Root directory: `backend`
- Functie-structuur: Vercel gebruikt `backend/api/index.js` en `backend/api/[...path].js`
- Environment variables: `JWT_SECRET`, `DATABASE_URL` of `DATABASE_PUBLIC_URL`

### Deployment flow
1. Deploy de backend eerst naar Vercel.
2. Kopieer de backend-URL naar `REACT_APP_API_URL` in het frontend project.
3. Deploy daarna de frontend naar Vercel.
4. Controleer of de frontend routes werken via `frontend/vercel.json` en of de API bereikbaar is onder `/api`.

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


Leeruitkomst 22:
De ICT-professional ontwerp een backend-architectuur en database van een vraagstuk uit een organisatie aan de hand van vastgelegde en geprioriteerde requirements.
Indicatoren:

De ICT-professional analyseert een organisatievraagstuk in overleg met de beroepspraktijk. 
De ICT-professional stelt requirements op voor de backend-architectuur en verzamelt feedback van mede-professionals.
De ICT-professional modelleert een databaseschema afgestemd op het organisatievraagstuk.
De ICT-professional presenteert de gemodelleerde architectuur en database. De ICT-professional documenteert de API-endpoints inclusief request/response formaten en authenticatie vereisten. 
Leeruitkomst 23:
De ICT-professional realiseert een veilige API met databasekoppeling, gebruik makend van een versiebeheersysteem en schrijft en gebruikt integratietesten om de software te valideren.
Indicatoren:

De ICT-professional ontwikkelt een API volgens de gespecificeerde architectuur, gebruik makend van een passend framework. 
De ICT-professional realiseert een databasekoppeling.
De ICT-professional implementeert beveiligingsmaatregelen in de API, waaronder authenticatie, autorisatie en input validatie.
De ICT-professional ontwikkelt en voert integratietesten uit voor kritieke endpoints.
De ICT-professional voert een code review uit en past code aan op basis van best practices en teamfeedback. 
Leeruitkomst 24:
De ICT-professional ontwerpt, configureert en implementeert een deployment pipeline binnen een DevOps-omgeving met behulp van versiebeheer, continuous integration en continuous deployment.
Indicatoren:

De ICT-professional ontwerpt een strategie voor het beheren van de deployment. 
De ICT-professional configureert een continuous integration en continuous deployment pipeline.
De ICT-professional implementeert geautomatiseerde build processen voor de backend applicatie.
De ICT-professional configureert cloudinfrastructuur voor het hosten van de backend-applicatie. 