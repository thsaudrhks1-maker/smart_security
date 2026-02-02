import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * 보호된 라우트 (권한 체크)
 * - allowedRoles: 허용된 역할 리스트 (배열)
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // 로딩 중이면 아무것도 안 보여줌

  // 1. 비로그인 상태 -> 로그인 화면으로
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. 권한 체크
  // allowedRoles가 없으면(null) 누구나 접근 가능 (로그인만 했다면)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 권한 없으면 본인에게 맞는 대시보드로 강제 이동 (RoleRedirect)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
