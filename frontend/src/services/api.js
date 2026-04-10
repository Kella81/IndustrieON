// ============================================
// API Service
// Centrale plek voor alle API aanroepen
// ============================================

import axios from 'axios';

// Basis URL van de backend
const API_URL = 'http://localhost:5000/api';

// Axios instantie met standaard configuratie
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Automatisch JWT token toevoegen aan elk verzoek
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const loginAPI = (email, password) =>
  api.post('/auth/login', { email, password });

export const registreerAPI = (name, email, password, role) =>
  api.post('/auth/register', { name, email, password, role });

export const profielAPI = () =>
  api.get('/auth/me');

// ---- Activiteiten ----
export const haalActiviteiten = () =>
  api.get('/activities');

export const haalActiviteit = (id) =>
  api.get(`/activities/${id}`);

export const maakActiviteit = (data) =>
  api.post('/activities', data);

export const werkActiviteitBij = (id, data) =>
  api.put(`/activities/${id}`, data);

export const verwijderActiviteit = (id) =>
  api.delete(`/activities/${id}`);

// ---- Registraties ----
export const meldAan = (activiteitId, status) =>
  api.post(`/activities/${activiteitId}/register`, { status });

// ---- Berichten ----
export const haalBerichten = (activiteitId) =>
  api.get(`/activities/${activiteitId}/comments`);

export const plaatsBericht = (activiteitId, message, parentId) =>
  api.post(`/activities/${activiteitId}/comments`, { message, parent_id: parentId });

// ---- Feedback ----
export const geefFeedback = (activiteitId, rating, comment) =>
  api.post(`/activities/${activiteitId}/feedback`, { rating, comment });

// ---- Polls ----
export const maakPoll = (activiteitId, question, options) =>
  api.post(`/activities/${activiteitId}/polls`, { question, options });

export const stemOpPoll = (pollId, optionId) =>
  api.post(`/polls/${pollId}/vote`, { option_id: optionId });

// ---- Admin ----
export const haalStatistieken = () =>
  api.get('/admin/stats');

export const haalGebruikers = () =>
  api.get('/admin/users');

export const wijzigRol = (userId, role) =>
  api.put(`/admin/users/${userId}/role`, { role });

export const verwijderGebruiker = (userId) =>
  api.delete(`/admin/users/${userId}`);

export default api;
