// ============================================
// Registreer Pagina
// Registratieformulier voor nieuwe gebruikers
// ============================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegistreerPagina() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [fout, setFout] = useState('');
  const [bezig, setBezig] = useState(false);
  const { registreer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFout('');
    setBezig(true);

    try {
      await registreer(name, email, password, role);
      navigate('/');
    } catch (err) {
      setFout(err.response?.data?.fout || 'Er ging iets mis bij het registreren.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="auth__pagina">
      <div className="auth__kaart">
        <div className="auth__header">
          <h1>Account aanmaken</h1>
          <p>Maak een account om deel te nemen aan activiteiten</p>
        </div>

        {fout && <div className="melding melding--fout">{fout}</div>}

        <form onSubmit={handleSubmit} className="auth__form">
          <div className="form__groep">
            <label htmlFor="name">Naam</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Je volledige naam"
              required
            />
          </div>

          <div className="form__groep">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
            />
          </div>

          <div className="form__groep">
            <label htmlFor="password">Wachtwoord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 6 tekens"
              required
              minLength={6}
            />
          </div>

          <div className="form__groep">
            <label htmlFor="role">Rol</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="USER">Medewerker (deelnemer)</option>
              <option value="ORGANIZER">Organisator</option>
            </select>
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={bezig}>
            {bezig ? 'Bezig met registreren...' : 'Account aanmaken'}
          </button>
        </form>

        <p className="auth__link">
          Al een account? <Link to="/login">Log hier in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegistreerPagina;
