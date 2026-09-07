// Shared API client. Every page imports this - do not duplicate fetch logic.
const BASE_URL = 'http://localhost:8000/api';

function getTokens() {
  const raw = localStorage.getItem('pos_tokens');
  return raw ? JSON.parse(raw) : null;
}

export function setTokens(tokens) {
  localStorage.setItem('pos_tokens', JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem('pos_tokens');
}

export async function apiFetch(path, options = {}) {
  const tokens = getTokens();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (tokens?.access) headers['Authorization'] = `Bearer ${tokens.access}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || JSON.stringify(body) || `Request failed: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.blob();
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid username or password');
  const tokens = await res.json();
  setTokens(tokens);
  return tokens;
}
