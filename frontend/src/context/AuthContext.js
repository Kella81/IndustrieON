// ============================================
// Auth Context
// Beheert de inlog status van de gebruiker
// Beschikbaar in de hele applicatie
// ============================================

import { createContext, useState, useContext, useEffect } from 'react';
import { loginAPI, registreerAPI, profielAPI } from '../services/api';

const AuthContext = createContext();

// Hook om de auth context te gebruiken in componenten
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [laden, setLaden] = useState(true);

  // Bij het laden van de app: controleer of er een geldig token is
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      profielAPI()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLaden(false));
    } else {
      setLaden(false);
    }
  }, []);

  // Inloggen
  const login = async (email, password) => {
    const res = await loginAPI(email, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Registreren
  const registreer = async (name, email, password, role) => {
    const res = await registreerAPI(name, email, password, role);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Uitloggen
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Controleer of gebruiker een bepaalde rol heeft
  const heeftRol = (...rollen) => {
    return user && rollen.includes(user.role);
  };

  const waarde = {
    user,
    laden,
    login,
    registreer,
    logout,
    heeftRol,
    isIngelogd: !!user
  };

  return (
    <AuthContext.Provider value={waarde}>
      {children}
    </AuthContext.Provider>
  );
}
