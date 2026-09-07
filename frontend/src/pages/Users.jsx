// OWNER: Person 1 - Auth & User Management (UC13 Manage User Accounts)
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', role: 'CASHIER', email: '' });

  function load() {
    apiFetch('/users/').then(setUsers).catch(err => setError(err.message));
  }

  useEffect(() => { load(); }, []);

  async function createUser(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/users/', { method: 'POST', body: JSON.stringify(form) });
      setForm({ username: '', password: '', role: 'CASHIER', email: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleLock(user) {
    const action = user.is_locked ? 'unlock' : 'lock';
    await apiFetch(`/users/${user.id}/${action}/`, { method: 'POST' });
    load();
  }

  if (error) return <p style={{ color: 'crimson', padding: 20 }}>{error} (Admin only)</p>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>Manage User Accounts (UC13)</h2>

      <form onSubmit={createUser} style={{ marginBottom: 20 }}>
        <input placeholder="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <input placeholder="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ marginLeft: 6 }} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ marginLeft: 6 }}>
          <option value="CASHIER">Cashier</option>
          <option value="INVENTORY_STAFF">Inventory Staff</option>
          <option value="STORE_MANAGER">Store Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" style={{ marginLeft: 6 }}>Create</button>
      </form>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Username</th><th>Role</th><th>Locked?</th><th>Action</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{u.is_locked ? 'Yes' : 'No'}</td>
              <td><button onClick={() => toggleLock(u)}>{u.is_locked ? 'Unlock' : 'Lock'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
