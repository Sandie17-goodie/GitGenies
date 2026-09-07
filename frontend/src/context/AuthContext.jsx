// OWNER: Person 1 - Auth & User Management (UC6)
import { createContext, useContext, useState } from 'react';
import { login as loginApi, clearTokens } from '../api/client';

const AuthContext = createContext(null);

function decodeRole(accessToken) {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('pos_tokens');
    if (!raw) return null;
    const tokens = JSON.parse(raw);
    return { username: localStorage.getItem('pos_username'), role: localStorage.getItem('pos_role') };
  });

  async function login(username, password) {
    const tokens = await loginApi(username, password);
    // Django's default TokenObtainPairView doesn't embed role by default,
    // so we fetch it from /api/me/ right after login.
    const meRes = await fetch('http://localhost:8000/api/me/', {
      headers: { Authorization: `Bearer ${tokens.access}` },
    });
    const me = await meRes.json();
    localStorage.setItem('pos_username', me.username);
    localStorage.setItem('pos_role', me.role);
    setUser({ username: me.username, role: me.role });
    return me;
  }

  function logout() {
    clearTokens();
    localStorage.removeItem('pos_username');
    localStorage.removeItem('pos_role');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
