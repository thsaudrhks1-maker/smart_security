
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authApi.login(username, password);
      
      // API 응답 구조: { access_token, user: { username, role, full_name, ... } } 또는 { access_token, role, ... }
      const token = data.access_token;
      const userInfo = data.user || {
          username: data.username || username,
          role: data.role,
          full_name: data.full_name
      };

      if (!token) throw new Error("토큰이 유효하지 않습니다.");

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      setUser(userInfo);
      return { success: true, role: userInfo.role };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.response?.data?.detail || "로그인 실패" };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
