// ============================================
// Navbar Component
// Navigatiebalk bovenaan de pagina
// ============================================

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isIngelogd, heeftRol } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo__icon">⚡</span>
          IndustrieON
        </Link>

        <div className="navbar__links">
          <Link to="/" className="navbar__link">Activiteiten</Link>

          {isIngelogd && heeftRol('ORGANIZER', 'ADMIN') && (
            <Link to="/activiteit/nieuw" className="navbar__link">
              + Nieuwe Activiteit
            </Link>
          )}

          {isIngelogd && heeftRol('ADMIN') && (
            <Link to="/admin" className="navbar__link">Admin</Link>
          )}

          {isIngelogd ? (
            <div className="navbar__user">
              <span className="navbar__user__name">
                {user.name}
                <span className={`navbar__badge navbar__badge--${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </span>
              <button onClick={handleLogout} className="btn btn--outline btn--sm">
                Uitloggen
              </button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn--outline btn--sm">Inloggen</Link>
              <Link to="/registreer" className="btn btn--primary btn--sm">Registreren</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
