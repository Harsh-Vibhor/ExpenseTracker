import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // 'USER' | 'ADMIN' | null
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY);
    const storedUser = localStorage.getItem('user');

    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    const userRole = userData?.role || null;
    setRole(userRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, tokenValue);
      if (userRole) localStorage.setItem(ROLE_KEY, userRole);
      if (userData) localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem('user');
    }
  };

  const value = useMemo(
    () => ({ token, role, user, isAuthenticated: !!token, login, logout }),
    [token, role, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
