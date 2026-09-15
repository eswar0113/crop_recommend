import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crop_auth_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify stored token on first load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const data = await getMe();
          if (data && data.success) {
            setUser(data.user);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('crop_auth_token');
            setToken(null);
            setUser(null);
          }
        } catch {
          localStorage.removeItem('crop_auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    if (data.success) {
      localStorage.setItem('crop_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    if (data.success) {
      localStorage.setItem('crop_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('crop_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
