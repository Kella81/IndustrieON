// ============================================
// Nieuwe Activiteit Pagina
// Formulier om een activiteit aan te maken
// Alleen voor ORGANIZER en ADMIN
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { maakActiviteit } from '../services/api';

function NieuweActiviteitPagina() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    capacity: 20
  });
  const [fout, setFout] = useState('');
  const [bezig, setBezig] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFout('');
    setBezig(true);

    try {
      const res = await maakActiviteit({
        ...form,
        capacity: Number(form.capacity)
      });
      navigate(`/activiteit/${res.data.activiteit.id}`);
    } catch (err) {
      setFout(err.response?.data?.fout || 'Activiteit aanmaken mislukt.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="pagina">
      <div className="form__container">
        <h1>Nieuwe Activiteit</h1>
        <p>Maak een nieuwe activiteit aan voor je collega's</p>

        {fout && <div className="melding melding--fout">{fout}</div>}

        <form onSubmit={handleSubmit} className="activiteit__form">
          <div className="form__groep">
            <label htmlFor="title">Titel</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Bijv. Fotografie Workshop"
              required
            />
          </div>

          <div className="form__groep">
            <label htmlFor="description">Beschrijving</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Beschrijf de activiteit..."
              rows={4}
              required
            />
          </div>

          <div className="form__rij">
            <div className="form__groep">
              <label htmlFor="location">Locatie</label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="Bijv. Vergaderzaal A"
                required
              />
            </div>

            <div className="form__groep">
              <label htmlFor="capacity">Max. deelnemers</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                max="500"
                value={form.capacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form__groep">
            <label htmlFor="date">Datum en tijd</label>
            <input
              id="date"
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={bezig}>
            {bezig ? 'Aanmaken...' : 'Activiteit aanmaken'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NieuweActiviteitPagina;
