import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Placeholders for views we will create next
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Records from './views/Records';
import AdminSetup from './views/AdminSetup';
import UserManagement from './views/UserManagement';
import UsersList from './views/UsersList';
import UserAnalytics from './views/UserAnalytics';
import GlobalAnalytics from './views/GlobalAnalytics';

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Sync user state with backend on initial load to catch role changes
  useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const freshUser = res.data;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch (err) {
        console.error('Failed to sync user state. Token might be invalid.', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };
    syncUser();
  }, []);

  const ProtectedRoute = ({ children, roles }) => {
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/admin-setup" element={<AdminSetup />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard user={user} setUser={setUser} />
          </ProtectedRoute>
        } />
        
        <Route path="/records" element={
          <ProtectedRoute>
            <Records user={user} />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute roles={['ADMIN']}>
            <UserManagement user={user} setUser={setUser} />
          </ProtectedRoute>
        } />
        
        <Route path="/user-analytics" element={
          <ProtectedRoute roles={['ADMIN', 'ANALYST']}>
            <UsersList user={user} />
          </ProtectedRoute>
        } />
        
        <Route path="/user-analytics/:userId" element={
          <ProtectedRoute roles={['ADMIN', 'ANALYST']}>
            <UserAnalytics user={user} />
          </ProtectedRoute>
        } />

        <Route path="/global-analytics" element={
          <ProtectedRoute roles={['ADMIN', 'ANALYST']}>
            <GlobalAnalytics user={user} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
