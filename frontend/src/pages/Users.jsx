import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api/client';
import { Page, Panel, Notice, EmptyRow } from '../components/Dashboard';
const emptyForm = { username: '', password: '', role: 'CASHIER', email: '' };
const roles = { CASHIER: 'Cashier', INVENTORY_STAFF: 'Inventory Staff', STORE_MANAGER: 'Store Manager', ADMIN: 'Admin' };
export default function Users() {
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(() => { apiFetch('/users/').then(setUsers).catch(error => setNotice({ text: `${error.message} User management requires an Admin account.` })).finally(() => setLoading(false)); }, []);
  async function createUser(event) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(null);
    try {
      await apiFetch('/users/', { method: 'POST', body: JSON.stringify(form) });
      setForm(emptyForm);
      setUsers(await apiFetch('/users/'));
      setNotice({ type: 'success', text: 'Staff account created successfully.' });
    } catch (error) { setNotice({ text: error.message }); }
    finally { pending.current = false; setBusy(false); }
  }
  async function toggleLock(user) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(null);
    try {
      await apiFetch(`/users/${user.id}/${user.is_locked ? 'unlock' : 'lock'}/`, { method: 'POST' });
      setUsers(await apiFetch('/users/'));
      setNotice({ type: 'success', text: `${user.username} ${user.is_locked ? 'unlocked' : 'locked'} successfully.` });
    } catch (error) { setNotice({ text: error.message }); }
    finally { pending.current = false; setBusy(false); }
  }
  return <Page title="Users" description="Manage your team’s accounts, roles, and access to the store."><Notice notice={notice} /><div className="users-grid"><Panel title="Staff accounts" badge={`${users.length} users`}><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td><div className="staff-name"><span className="staff-avatar" aria-hidden="true">{user.username[0].toUpperCase()}</span><strong>{user.username}</strong></div></td><td>{roles[user.role] || user.role}</td><td><span className={`status-badge ${user.is_locked || !user.is_active ? 'warning' : 'positive'}`}>{user.is_locked ? 'Locked' : user.is_active ? 'Active' : 'Inactive'}</span></td><td><button className="table-button" disabled={busy} onClick={() => toggleLock(user)} aria-label={`${user.is_locked ? 'Unlock' : 'Lock'} ${user.username}`}>{user.is_locked ? 'Unlock' : 'Lock'}</button></td></tr>)}{!users.length && <EmptyRow columns={4}>{loading ? 'Loading staff accounts…' : notice ? 'Staff accounts could not be loaded.' : 'No staff accounts yet.'}</EmptyRow>}</tbody></table></div></Panel><Panel title="Create account" className="create-account-panel"><form className="dashboard-form" onSubmit={createUser}><p className="muted">Add a team member and choose their role.</p><label htmlFor="new-username">Username<input id="new-username" required autoComplete="off" placeholder="e.g. cashier2" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} /></label><label htmlFor="new-password">Password<input id="new-password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label><label htmlFor="new-role">Role<select id="new-role" value={form.role} onChange={event => setForm({ ...form, role: event.target.value })}>{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Create Account'}</button><p className="cart-note">Only Admin accounts can manage staff access.</p></form></Panel></div></Page>;
}
