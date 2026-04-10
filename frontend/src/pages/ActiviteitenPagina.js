// ============================================
// Activiteiten Overzicht Pagina
// Toont alle activiteiten in een kaart overzicht
// ============================================

import { useState, useEffect } from 'react';
import { haalActiviteiten } from '../services/api';
import ActiviteitKaart from '../components/ActiviteitKaart';
import Laadscherm from '../components/Laadscherm';

function ActiviteitenPagina() {
  const [activiteiten, setActiviteiten] = useState([]);
  const [laden, setLaden] = useState(true);
  const [zoekterm, setZoekterm] = useState('');

  // Activiteiten laden bij het openen van de pagina
  useEffect(() => {
    haalActiviteiten()
      .then(res => setActiviteiten(res.data))
      .catch(err => console.error('Fout bij laden activiteiten:', err))
      .finally(() => setLaden(false));
  }, []);

  // Filter activiteiten op basis van zoekterm
  const gefilterd = activiteiten.filter(a =>
    a.title.toLowerCase().includes(zoekterm.toLowerCase()) ||
    a.description.toLowerCase().includes(zoekterm.toLowerCase()) ||
    a.location.toLowerCase().includes(zoekterm.toLowerCase())
  );

  if (laden) return <Laadscherm />;

  return (
    <div className="pagina">
      <div className="pagina__header">
        <h1>Activiteiten</h1>
        <p>Bekijk alle geplande activiteiten en meld je aan!</p>
      </div>

      <div className="zoekbalk">
        <input
          type="text"
          placeholder="Zoek op titel, beschrijving of locatie..."
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          className="zoekbalk__input"
        />
      </div>

      {gefilterd.length === 0 ? (
        <div className="lege__staat">
          <p>Geen activiteiten gevonden.</p>
        </div>
      ) : (
        <div className="activiteiten__grid">
          {gefilterd.map(activiteit => (
            <ActiviteitKaart key={activiteit.id} activiteit={activiteit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActiviteitenPagina;
