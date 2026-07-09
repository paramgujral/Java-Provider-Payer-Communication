import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hc_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const data = res.data;
    localStorage.setItem('hc_token', data.token);
    const userObj = {
      userId: data.userId,
      username: data.username,
      fullName: data.fullName,
      organizationName: data.organizationName,
      role: data.role,
    };
    localStorage.setItem('hc_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
