// ============================================
// Login Pagina
// Inlogformulier voor bestaande gebruikers
// ============================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPagina() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fout, setFout] = useState('');
  const [bezig, setBezig] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFout('');
    setBezig(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const apiFout = err.response?.data?.fout || err.response?.data?.message;
      const foutcode = err.response?.status ? ` (${err.response.status})` : '';
      const netwerkFout = err.message === 'Network Error' ? ' Network Error' : '';
      setFout(apiFout ? `${apiFout}${foutcode}` : `Er ging iets mis bij het inloggen.${foutcode}${netwerkFout}`);
      console.error('Login mislukt:', err);
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="auth__pagina">
      <div className="auth__kaart">
        <div className="auth__header">
          <h1>Welkom terug</h1>
          <p>Log in om activiteiten te bekijken en deel te nemen</p>
        </div>

        {fout && <div className="melding melding--fout">{fout}</div>}

        <form onSubmit={handleSubmit} className="auth__form">
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
              placeholder="Je wachtwoord"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={bezig}>
            {bezig ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p className="auth__link">
          Nog geen account? <Link to="/registreer">Maak er een aan</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPagina;
