// ============================================
// App Component
// Hoofd component met routing configuratie
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ActiviteitenPagina from './pages/ActiviteitenPagina';
import ActiviteitDetailPagina from './pages/ActiviteitDetailPagina';
import NieuweActiviteitPagina from './pages/NieuweActiviteitPagina';
import LoginPagina from './pages/LoginPagina';
import RegistreerPagina from './pages/RegistreerPagina';
import AdminPagina from './pages/AdminPagina';
import Laadscherm from './components/Laadscherm';
import './App.css';

// Route bescherming: alleen toegankelijk als ingelogd
function BeschermdeRoute({ children, rollen }) {
  const { isIngelogd, laden, heeftRol } = useAuth();

  if (laden) return <Laadscherm />;
  if (!isIngelogd) return <Navigate to="/login" />;
  if (rollen && !heeftRol(...rollen)) return <Navigate to="/" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="app__inhoud">
            <Routes>
              {/* Publieke routes */}
              <Route path="/" element={<ActiviteitenPagina />} />
              <Route path="/activiteit/:id" element={<ActiviteitDetailPagina />} />
              <Route path="/login" element={<LoginPagina />} />
              <Route path="/registreer" element={<RegistreerPagina />} />

              {/* Beschermde routes */}
              <Route
                path="/activiteit/nieuw"
                element={
                  <BeschermdeRoute rollen={['ORGANIZER', 'ADMIN']}>
                    <NieuweActiviteitPagina />
                  </BeschermdeRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <BeschermdeRoute rollen={['ADMIN']}>
                    <AdminPagina />
                  </BeschermdeRoute>
                }
              />

              {/* 404 pagina */}
              <Route path="*" element={
                <div className="pagina" style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <h1>404</h1>
                  <p>Pagina niet gevonden</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
