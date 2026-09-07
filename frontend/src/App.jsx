import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Till from './pages/Till';
import Returns from './pages/Returns';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Till /></PrivateRoute>} />
          <Route path="/returns" element={<PrivateRoute><Returns /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
