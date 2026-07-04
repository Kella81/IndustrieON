// ============================================
// Admin Pagina
// Dashboard met statistieken en gebruikersbeheer
// Alleen toegankelijk voor ADMIN
// ============================================

import { useState, useEffect } from 'react';
import { haalStatistieken, haalGebruikers, wijzigRol, keurGebruikerGoed, verwijderGebruiker } from '../services/api';
import SterrenRating from '../components/SterrenRating';
import Laadscherm from '../components/Laadscherm';

function AdminPagina() {
  const [stats, setStats] = useState(null);
  const [gebruikers, setGebruikers] = useState([]);
  const [tabblad, setTabblad] = useState('dashboard');
  const [laden, setLaden] = useState(true);
  const [melding, setMelding] = useState('');

  // Data laden
  useEffect(() => {
    laadAlles();
  }, []);

  const laadAlles = async () => {
    try {
      const [statsRes, gebruikersRes] = await Promise.all([
        haalStatistieken(),
        haalGebruikers()
      ]);
      setStats(statsRes.data);
      setGebruikers(gebruikersRes.data);
    } catch (err) {
      console.error('Fout bij laden admin data:', err);
    } finally {
      setLaden(false);
    }
  };

  // Toon tijdelijke melding
  const toonMelding = (tekst) => {
    setMelding(tekst);
    setTimeout(() => setMelding(''), 3000);
  };

  // Rol wijzigen
  const handleRolWijzigen = async (userId, nieuweRol) => {
    try {
      await wijzigRol(userId, nieuweRol);
      toonMelding('Rol succesvol gewijzigd!');
      const res = await haalGebruikers();
      setGebruikers(res.data);
    } catch (err) {
      toonMelding('Rol wijzigen mislukt.');
    }
  };

  const handleGoedkeuren = async (userId, naam) => {
    try {
      await keurGebruikerGoed(userId);
      toonMelding(`${naam} is goedgekeurd.`);
      const res = await haalGebruikers();
      setGebruikers(res.data);
    } catch (err) {
      toonMelding(err.response?.data?.fout || 'Goedkeuren mislukt.');
    }
  };

  // Gebruiker verwijderen
  const handleVerwijderen = async (userId, naam) => {
    if (!window.confirm(`Weet je zeker dat je ${naam} wilt verwijderen?`)) return;

    try {
      await verwijderGebruiker(userId);
      toonMelding('Gebruiker verwijderd.');
      const res = await haalGebruikers();
      setGebruikers(res.data);
    } catch (err) {
      toonMelding(err.response?.data?.fout || 'Verwijderen mislukt.');
    }
  };

  if (laden) return <Laadscherm />;

  return (
    <div className="pagina">
      {melding && <div className="melding melding--succes melding--zwevend">{melding}</div>}

      <div className="pagina__header">
        <h1>Admin Dashboard</h1>
        <p>Beheer gebruikers en bekijk statistieken</p>
      </div>

      {/* Tabbladen */}
      <div className="tabbladen">
        <button
          className={`tabblad ${tabblad === 'dashboard' ? 'tabblad--actief' : ''}`}
          onClick={() => setTabblad('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tabblad ${tabblad === 'gebruikers' ? 'tabblad--actief' : ''}`}
          onClick={() => setTabblad('gebruikers')}
        >
          👥 Gebruikers
        </button>
      </div>

      {/* Dashboard tabblad */}
      {tabblad === 'dashboard' && stats && (
        <div className="admin__dashboard">
          {/* Statistiek kaarten */}
          <div className="stats__grid">
            <div className="stat__kaart">
              <div className="stat__nummer">{stats.totaal_gebruikers}</div>
              <div className="stat__label">Gebruikers</div>
            </div>
            <div className="stat__kaart">
              <div className="stat__nummer">{stats.totaal_activiteiten}</div>
              <div className="stat__label">Activiteiten</div>
            </div>
            {stats.rol_verdeling.map(r => (
              <div key={r.role} className="stat__kaart">
                <div className="stat__nummer">{r.aantal}</div>
                <div className="stat__label">{r.role}s</div>
              </div>
            ))}
          </div>

          {/* Populairste activiteiten */}
          <div className="admin__sectie">
            <h2>Populairste activiteiten</h2>
            <div className="admin__tabel__container">
              <table className="admin__tabel">
                <thead>
                  <tr>
                    <th>Activiteit</th>
                    <th>Organisator</th>
                    <th>Datum</th>
                    <th>Deelnemers</th>
                    <th>Capaciteit</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.populairste_activiteiten.map(a => (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>{a.organizer_name}</td>
                      <td>{new Date(a.date).toLocaleDateString('nl-NL')}</td>
                      <td>{a.deelnemers_aantal}</td>
                      <td>{a.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best beoordeeld */}
          {stats.best_beoordeeld.length > 0 && (
            <div className="admin__sectie">
              <h2>Best beoordeelde activiteiten</h2>
              <div className="admin__tabel__container">
                <table className="admin__tabel">
                  <thead>
                    <tr>
                      <th>Activiteit</th>
                      <th>Gemiddelde rating</th>
                      <th>Aantal reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.best_beoordeeld.map(a => (
                      <tr key={a.id}>
                        <td>{a.title}</td>
                        <td>
                          <SterrenRating rating={Math.round(a.gemiddelde_rating)} readonly grootte="klein" />
                        </td>
                        <td>{a.aantal_reviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recente registraties */}
          {stats.recente_registraties.length > 0 && (
            <div className="admin__sectie">
              <h2>Recente registraties</h2>
              <div className="admin__tabel__container">
                <table className="admin__tabel">
                  <thead>
                    <tr>
                      <th>Gebruiker</th>
                      <th>Activiteit</th>
                      <th>Status</th>
                      <th>Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recente_registraties.map((r, i) => (
                      <tr key={i}>
                        <td>{r.user_name}</td>
                        <td>{r.activity_title}</td>
                        <td>
                          <span className={`deelnemer__status deelnemer__status--${r.status}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>{new Date(r.created_at).toLocaleString('nl-NL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gebruikers tabblad */}
      {tabblad === 'gebruikers' && (
        <div className="admin__sectie">
          <h2>Alle gebruikers ({gebruikers.length})</h2>
          <div className="admin__tabel__container">
            <table className="admin__tabel">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naam</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {gebruikers.map(g => (
                  <tr key={g.id}>
                    <td>{g.id}</td>
                    <td>{g.name}</td>
                    <td>{g.email}</td>
                    <td>
                      <select
                        value={g.role}
                        onChange={(e) => handleRolWijzigen(g.id, e.target.value)}
                        className="admin__rol__select"
                      >
                        <option value="USER">USER</option>
                        <option value="ORGANIZER">ORGANIZER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${g.status === 'ACTIVE' ? 'badge--blauw' : 'badge--oranje'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td>
                      {g.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleGoedkeuren(g.id, g.name)}
                          className="btn btn--primary btn--sm"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Goedkeuren
                        </button>
                      )}
                      <button
                        onClick={() => handleVerwijderen(g.id, g.name)}
                        className="btn btn--gevaar btn--sm"
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPagina;
