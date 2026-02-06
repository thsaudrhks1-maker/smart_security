import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * 보호???�우??(권한 체크)
 * - allowedRoles: ?�용????�� 리스??(배열)
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // 로딩 중이�??�무것도 ??보여�?

  // 1. 비로그인 ?�태 -> 로그???�면?�로
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. 권한 체크
  // allowedRoles가 ?�으�?null) ?�구???�근 가??(로그?�만 ?�다�?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 권한 ?�으�?본인?�게 맞는 ?�?�보?�로 강제 ?�동 (RoleRedirect)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
