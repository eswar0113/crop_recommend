import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '1rem',
        background: 'var(--bg-main)', color: 'var(--text-muted)'
      }}>
        <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', borderColor: 'rgba(22,101,52,0.3)', borderTopColor: '#166534' }}></div>
        <span style={{ fontSize: '0.9rem' }}>Verifying session...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
};

export default ProtectedRoute;
