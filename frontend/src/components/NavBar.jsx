import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <header className="app-header">
      <NavLink className="brand" to="/"><span className="brand-icon" aria-hidden="true">▤</span> Bookstore <span className="brand-tag">POS</span></NavLink>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>Till</NavLink>
        <NavLink to="/returns">Returns</NavLink>
        <NavLink to="/inventory">Inventory</NavLink>
        {['STORE_MANAGER', 'ADMIN'].includes(user.role) && <NavLink to="/reports">Reports</NavLink>}
        {user.role === 'ADMIN' && <NavLink to="/users">Users</NavLink>}
      </nav>
      <div className="user-controls"><span className="user-badge"><span className="avatar" aria-hidden="true">{user.username?.[0]?.toUpperCase()}</span>{user.username} <span className="user-role">({user.role})</span></span><button className="logout-button" onClick={logout}>Logout</button></div>
    </header>
  );
}
