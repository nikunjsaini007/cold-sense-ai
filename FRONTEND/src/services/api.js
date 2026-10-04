import { supabase } from './supabase.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options) {
  const { data: { session } = {} } = supabase ? await supabase.auth.getSession() : { data: {} };
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}), ...(options?.headers || {}) },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { message = (await response.json()).message || message; } catch { /* non-json response */ }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export const getJson = (path) => request(path);

export const getShipments = () => request('/shipments');
export const getRisk = (id) => request(`/risk/${encodeURIComponent(id)}`);
export const getAlerts = (id) => request(`/alerts/${encodeURIComponent(id)}`);
export const createShipment = (payload) => request('/shipments', { method: 'POST', body: JSON.stringify(payload) });
export const getAiRecommendation = (payload) => request('/ai/recommendation', {
  method: 'POST',
  body: JSON.stringify(payload),
});
