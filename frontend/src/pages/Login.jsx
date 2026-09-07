// OWNER: Person 1 - Auth & User Management (UC6: Log In / Authenticate)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>Bookstore POS — Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username</label><br />
          <input value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 10 }}>Log In</button>
      </form>
      <p style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
        Demo accounts (seeded by seed_demo): cashier1 / inventory1 / manager1 / admin1 — password: demo1234
      </p>
    </div>
  );
}
