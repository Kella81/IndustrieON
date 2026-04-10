// ============================================
// ActiviteitKaart Component
// Toont een activiteit als kaart in het overzicht
// ============================================

import { Link } from 'react-router-dom';

function ActiviteitKaart({ activiteit }) {
  // Datum formatteren naar leesbaar Nederlands formaat
  const datum = new Date(activiteit.date);
  const datumTekst = datum.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const tijdTekst = datum.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Bereken hoeveel plekken er nog vrij zijn
  const vrijePlekken = activiteit.capacity - (activiteit.deelnemers_aantal || 0);
  const isVol = vrijePlekken <= 0;
  const bijnaVol = vrijePlekken <= 3 && !isVol;

  return (
    <Link to={`/activiteit/${activiteit.id}`} className="activiteit__kaart">
      <div className="activiteit__kaart__header">
        <h3 className="activiteit__kaart__titel">{activiteit.title}</h3>
        {isVol && <span className="badge badge--rood">Vol</span>}
        {bijnaVol && <span className="badge badge--oranje">Bijna vol</span>}
      </div>

      <p className="activiteit__kaart__beschrijving">
        {activiteit.description.length > 120
          ? activiteit.description.substring(0, 120) + '...'
          : activiteit.description}
      </p>

      <div className="activiteit__kaart__details">
        <div className="activiteit__kaart__detail">
          <span className="activiteit__kaart__icoon">📅</span>
          <span>{datumTekst} om {tijdTekst}</span>
        </div>
        <div className="activiteit__kaart__detail">
          <span className="activiteit__kaart__icoon">📍</span>
          <span>{activiteit.location}</span>
        </div>
        <div className="activiteit__kaart__detail">
          <span className="activiteit__kaart__icoon">👤</span>
          <span>{activiteit.organizer_name}</span>
        </div>
        <div className="activiteit__kaart__detail">
          <span className="activiteit__kaart__icoon">👥</span>
          <span>{activiteit.deelnemers_aantal || 0} / {activiteit.capacity} deelnemers</span>
        </div>
      </div>

      <div className="activiteit__kaart__capaciteit">
        <div
          className={`activiteit__kaart__balk ${isVol ? 'activiteit__kaart__balk--vol' : ''}`}
          style={{ width: `${Math.min(((activiteit.deelnemers_aantal || 0) / activiteit.capacity) * 100, 100)}%` }}
        />
      </div>
    </Link>
  );
}

export default ActiviteitKaart;
