// ============================================
// JWT Authenticatie Middleware
// Controleert of de gebruiker ingelogd is
// ============================================

const jwt = require('jsonwebtoken');

/**
 * Verifieert het JWT token uit de Authorization header
 * Voegt de gebruiker data toe aan req.user
 */
function authenticeer(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ fout: 'Geen toegang. Log eerst in.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ fout: 'Ongeldig of verlopen token.' });
  }
}

/**
 * Controleert of de gebruiker een bepaalde rol heeft
 * @param  {...string} rollen - Toegestane rollen (bijv. 'ADMIN', 'ORGANIZER')
 */
function autoriseer(...rollen) {
  return (req, res, next) => {
    if (!rollen.includes(req.user.role)) {
      return res.status(403).json({ fout: 'Je hebt geen rechten voor deze actie.' });
    }
    next();
  };
}

module.exports = { authenticeer, autoriseer };
