// ============================================
// Activiteit Detail Pagina
// Toont alle details van een activiteit met
// aanmelden, polls, berichten en feedback
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  haalActiviteit, meldAan, haalBerichten, plaatsBericht,
  geefFeedback, stemOpPoll, maakPoll
} from '../services/api';
import SterrenRating from '../components/SterrenRating';
import Laadscherm from '../components/Laadscherm';

function ActiviteitDetailPagina() {
  const { id } = useParams();
  const { user, isIngelogd, heeftRol } = useAuth();

  const [activiteit, setActiviteit] = useState(null);
  const [berichten, setBerichten] = useState([]);
  const [laden, setLaden] = useState(true);

  // Formulier states
  const [aanmeldStatus, setAanmeldStatus] = useState('aanwezig');
  const [nieuwBericht, setNieuwBericht] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackTekst, setFeedbackTekst] = useState('');
  const [melding, setMelding] = useState('');
  const [pollVraag, setPollVraag] = useState('');
  const [pollOpties, setPollOpties] = useState(['', '']);
  const [pollAanmaken, setPollAanmaken] = useState(false);

  // Data laden
  const laadData = useCallback(async () => {
    try {
      const [actRes, berRes] = await Promise.all([
        haalActiviteit(id),
        haalBerichten(id)
      ]);
      setActiviteit(actRes.data);
      setBerichten(berRes.data);
    } catch (err) {
      console.error('Fout bij laden:', err);
    } finally {
      setLaden(false);
    }
  }, [id]);

  useEffect(() => {
    laadData();
  }, [laadData]);

  // Toon tijdelijke melding
  const toonMelding = (tekst) => {
    setMelding(tekst);
    setTimeout(() => setMelding(''), 3000);
  };

  // Aanmelden voor activiteit
  const handleAanmelden = async () => {
    try {
      await meldAan(id, aanmeldStatus);
      toonMelding('Aanmelding geregistreerd!');
      laadData();
    } catch (err) {
      toonMelding(err.response?.data?.fout || 'Aanmelden mislukt.');
    }
  };

  // Bericht plaatsen
  const handleBericht = async (e) => {
    e.preventDefault();
    if (!nieuwBericht.trim()) return;

    try {
      await plaatsBericht(id, nieuwBericht);
      setNieuwBericht('');
      const res = await haalBerichten(id);
      setBerichten(res.data);
    } catch (err) {
      toonMelding('Bericht plaatsen mislukt.');
    }
  };

  // Feedback geven
  const handleFeedback = async (e) => {
    e.preventDefault();
    if (feedbackRating === 0) {
      toonMelding('Selecteer een rating.');
      return;
    }

    try {
      await geefFeedback(id, feedbackRating, feedbackTekst);
      toonMelding('Feedback verzonden!');
      setFeedbackRating(0);
      setFeedbackTekst('');
      laadData();
    } catch (err) {
      toonMelding(err.response?.data?.fout || 'Feedback mislukt.');
    }
  };

  // Stemmen op poll
  const handleStem = async (pollId, optionId) => {
    try {
      await stemOpPoll(pollId, optionId);
      toonMelding('Stem geregistreerd!');
      laadData();
    } catch (err) {
      toonMelding(err.response?.data?.fout || 'Stemmen mislukt.');
    }
  };

  // Poll aanmaken
  const handleMaakPoll = async (e) => {
    e.preventDefault();
    const geldige = pollOpties.filter(o => o.trim());
    if (!pollVraag.trim() || geldige.length < 2) {
      toonMelding('Vul een vraag en minimaal 2 opties in.');
      return;
    }
    try {
      await maakPoll(id, pollVraag, geldige);
      toonMelding('Poll aangemaakt!');
      setPollVraag('');
      setPollOpties(['', '']);
      setPollAanmaken(false);
      laadData();
    } catch (err) {
      toonMelding(err.response?.data?.fout || 'Poll aanmaken mislukt.');
    }
  };

  if (laden) return <Laadscherm />;
  if (!activiteit) return <div className="pagina"><p>Activiteit niet gevonden.</p></div>;

  // Datum formatteren
  const datum = new Date(activiteit.date);
  const datumTekst = datum.toLocaleDateString('nl-NL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const tijdTekst = datum.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

  const vrijePlekken = activiteit.capacity - (activiteit.deelnemers_aantal || 0);
  const isVol = vrijePlekken <= 0;

  // Controleer of de huidige gebruiker al aangemeld is
  const huidigeRegistratie = user
    ? activiteit.deelnemers?.find(d => d.id === user.id)
    : null;

  return (
    <div className="pagina">
      {melding && <div className="melding melding--succes melding--zwevend">{melding}</div>}

      {/* Header sectie */}
      <div className="detail__header">
        <h1>{activiteit.title}</h1>
        <div className="detail__meta">
          <span>📅 {datumTekst} om {tijdTekst}</span>
          <span>📍 {activiteit.location}</span>
          <span>👤 Organisator: {activiteit.organizer_name}</span>
          <span>👥 {activiteit.deelnemers_aantal || 0} / {activiteit.capacity} deelnemers</span>
          {activiteit.gemiddelde_rating && (
            <span>⭐ {activiteit.gemiddelde_rating} ({activiteit.feedback_aantal} reviews)</span>
          )}
        </div>
      </div>

      {/* Beschrijving */}
      <div className="detail__sectie">
        <h2>Beschrijving</h2>
        <p className="detail__beschrijving">{activiteit.description}</p>
      </div>

      {/* Capaciteit balk */}
      <div className="detail__sectie">
        <div className="capaciteit__info">
          <span>{vrijePlekken > 0 ? `${vrijePlekken} plekken vrij` : 'Activiteit is vol'}</span>
          <span>{activiteit.deelnemers_aantal || 0} / {activiteit.capacity}</span>
        </div>
        <div className="capaciteit__balk__container">
          <div
            className={`capaciteit__balk ${isVol ? 'capaciteit__balk--vol' : ''}`}
            style={{ width: `${Math.min(((activiteit.deelnemers_aantal || 0) / activiteit.capacity) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Aanmelden sectie */}
      {isIngelogd && (
        <div className="detail__sectie">
          <h2>Aanmelden</h2>
          {huidigeRegistratie && (
            <p className="detail__huidige__status">
              Je huidige status: <strong>{huidigeRegistratie.status}</strong>
            </p>
          )}
          <div className="aanmelden__groep">
            <select
              value={aanmeldStatus}
              onChange={(e) => setAanmeldStatus(e.target.value)}
              className="aanmelden__select"
            >
              <option value="aanwezig">✅ Aanwezig</option>
              <option value="misschien">🤔 Misschien</option>
              <option value="niet_aanwezig">❌ Niet aanwezig</option>
            </select>
            <button
              onClick={handleAanmelden}
              className="btn btn--primary"
              disabled={isVol && aanmeldStatus !== 'niet_aanwezig' && !huidigeRegistratie}
            >
              {huidigeRegistratie ? 'Status wijzigen' : 'Aanmelden'}
            </button>
          </div>
        </div>
      )}

      {/* Deelnemers lijst */}
      {activiteit.deelnemers && activiteit.deelnemers.length > 0 && (
        <div className="detail__sectie">
          <h2>Deelnemers ({activiteit.deelnemers.length})</h2>
          <div className="deelnemers__lijst">
            {activiteit.deelnemers.map((d, i) => (
              <div key={i} className="deelnemer__item">
                <span className="deelnemer__naam">{d.name}</span>
                <span className={`deelnemer__status deelnemer__status--${d.status}`}>
                  {d.status === 'aanwezig' && '✅'}
                  {d.status === 'misschien' && '🤔'}
                  {d.status === 'niet_aanwezig' && '❌'}
                  {' '}{d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Polls sectie */}
      {(activiteit.polls?.length > 0 || (user && (user.id === activiteit.organizer_id || heeftRol('ADMIN')))) && (
        <div className="detail__sectie">
          <h2>Polls</h2>

          {/* Poll aanmaken - alleen voor organisator/admin */}
          {user && (user.id === activiteit.organizer_id || heeftRol('ADMIN')) && (
            <div style={{ marginBottom: '1.5rem' }}>
              {!pollAanmaken ? (
                <button onClick={() => setPollAanmaken(true)} className="btn btn--outline btn--sm">
                  + Poll toevoegen
                </button>
              ) : (
                <form onSubmit={handleMaakPoll} className="activiteit__form" style={{ background: 'var(--achtergrond)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <div className="form__groep">
                    <label>Vraag</label>
                    <input
                      type="text"
                      value={pollVraag}
                      onChange={(e) => setPollVraag(e.target.value)}
                      placeholder="Bijv. Welk tijdstip past jou het beste?"
                      required
                    />
                  </div>
                  <div className="form__groep">
                    <label>Opties</label>
                    {pollOpties.map((optie, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          value={optie}
                          onChange={(e) => {
                            const nieuw = [...pollOpties];
                            nieuw[i] = e.target.value;
                            setPollOpties(nieuw);
                          }}
                          placeholder={`Optie ${i + 1}`}
                        />
                        {pollOpties.length > 2 && (
                          <button type="button" className="btn btn--gevaar btn--sm" onClick={() => setPollOpties(pollOpties.filter((_, j) => j !== i))}>
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setPollOpties([...pollOpties, ''])}>
                      + Optie toevoegen
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn--primary btn--sm">Poll aanmaken</button>
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => { setPollAanmaken(false); setPollVraag(''); setPollOpties(['', '']); }}>
                      Annuleren
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activiteit.polls?.map(poll => (
            <div key={poll.id} className="poll__kaart">
              <h3 className="poll__vraag">{poll.question}</h3>
              <div className="poll__opties">
                {poll.options.map(optie => {
                  const totaalStemmen = poll.options.reduce((sum, o) => sum + (o.stemmen || 0), 0);
                  const percentage = totaalStemmen > 0 ? Math.round((optie.stemmen / totaalStemmen) * 100) : 0;

                  return (
                    <div key={optie.id} className="poll__optie">
                      <div className="poll__optie__info">
                        <span>{optie.option_text}</span>
                        <span>{optie.stemmen || 0} stemmen ({percentage}%)</span>
                      </div>
                      <div className="poll__balk__container">
                        <div className="poll__balk" style={{ width: `${percentage}%` }} />
                      </div>
                      {isIngelogd && (
                        <button
                          onClick={() => handleStem(poll.id, optie.id)}
                          className="btn btn--outline btn--sm"
                        >
                          Stem
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Berichten sectie */}
      <div className="detail__sectie">
        <h2>Berichten ({berichten.length})</h2>

        {isIngelogd && (
          <form onSubmit={handleBericht} className="bericht__form">
            <textarea
              value={nieuwBericht}
              onChange={(e) => setNieuwBericht(e.target.value)}
              placeholder="Stel een vraag of laat een bericht achter..."
              rows={3}
            />
            <button type="submit" className="btn btn--primary">
              Verstuur
            </button>
          </form>
        )}

        <div className="berichten__lijst">
          {berichten.length === 0 ? (
            <p className="berichten__leeg">Nog geen berichten. Wees de eerste!</p>
          ) : (
            berichten.map(b => (
              <div key={b.id} className={`bericht__item ${b.parent_id ? 'bericht__item--reactie' : ''}`}>
                <div className="bericht__header">
                  <strong>{b.user_name}</strong>
                  {b.user_role === 'ORGANIZER' && <span className="badge badge--blauw">Organisator</span>}
                  {b.user_role === 'ADMIN' && <span className="badge badge--paars">Admin</span>}
                  <span className="bericht__datum">
                    {new Date(b.created_at).toLocaleString('nl-NL')}
                  </span>
                </div>
                <p className="bericht__tekst">{b.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feedback sectie */}
      <div className="detail__sectie">
        <h2>Feedback</h2>

        {isIngelogd && (
          <form onSubmit={handleFeedback} className="feedback__form">
            <div className="form__groep">
              <label>Rating</label>
              <SterrenRating rating={feedbackRating} onRating={setFeedbackRating} />
            </div>
            <div className="form__groep">
              <textarea
                value={feedbackTekst}
                onChange={(e) => setFeedbackTekst(e.target.value)}
                placeholder="Deel je ervaring... (optioneel)"
                rows={2}
              />
            </div>
            <button type="submit" className="btn btn--primary">
              Feedback verzenden
            </button>
          </form>
        )}

        {activiteit.feedback && activiteit.feedback.length > 0 && (
          <div className="feedback__lijst">
            {activiteit.feedback.map(f => (
              <div key={f.id} className="feedback__item">
                <div className="feedback__header">
                  <strong>{f.user_name}</strong>
                  <SterrenRating rating={f.rating} readonly grootte="klein" />
                </div>
                {f.comment && <p className="feedback__tekst">{f.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiviteitDetailPagina;
