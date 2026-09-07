import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav style={{ padding: 12, background: '#1a2b4c', color: 'white', fontFamily: 'sans-serif' }}>
      <span style={{ marginRight: 20, fontWeight: 'bold' }}>Bookstore POS</span>
      <Link to="/" style={{ color: 'white', marginRight: 14 }}>Till</Link>
      <Link to="/returns" style={{ color: 'white', marginRight: 14 }}>Returns</Link>
      <Link to="/inventory" style={{ color: 'white', marginRight: 14 }}>Inventory</Link>
      {(user.role === 'STORE_MANAGER' || user.role === 'ADMIN') && (
        <Link to="/reports" style={{ color: 'white', marginRight: 14 }}>Reports</Link>
      )}
      {user.role === 'ADMIN' && (
        <Link to="/users" style={{ color: 'white', marginRight: 14 }}>Users</Link>
      )}
      <span style={{ float: 'right' }}>
        {user.username} ({user.role})
        <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
      </span>
    </nav>
  );
}
