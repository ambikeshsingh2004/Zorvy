import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Placeholders for views we will create next
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Records from './views/Records';
import AdminSetup from './views/AdminSetup';
import UserManagement from './views/UserManagement';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
      </Routes>
    </div>
  );
}

export default App;
