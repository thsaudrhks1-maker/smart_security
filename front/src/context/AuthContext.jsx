import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // authApi.login은 response.data를 직접 반환하도록 설계됨
      const data = await authApi.login(username, password);
      // full_name 추가 추출
      const { access_token, role, username: returnedUsername, full_name } = data;
      
      const userData = { username: returnedUsername, role, full_name };
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.response?.data?.detail || "로그인 실패" };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // 확실한 로그아웃 처리를 위해 페이지 리로드/이동
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
