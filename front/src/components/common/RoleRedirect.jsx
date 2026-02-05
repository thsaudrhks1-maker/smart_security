import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * 대시보드 진입점 (Dashboard Layout)
 * - 사용자의 역할(Role)을 확인하여 적절한 대시보드로 리다이렉트합니다.
 * - 관리자/소장/안전관리자 -> /admin (AdminDashboard Layout)
 * - 작업자 -> /worker (WorkerDashboard Layout)
 */
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    // 역할별 리다이렉트
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (user.role === 'manager' || user.role === 'safety_manager') { // 중간 관리자 (소장, 안전관리자)
      navigate('/manager', { replace: true });
    } else if (user.role === 'worker') {
      navigate('/worker', { replace: true });
    } else {
      // 역할이 없는 경우 (예외 처리)
      console.warn("User has no role assigned:", user);
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: '#f8fafc',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner" style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #e2e8f0', 
        borderTop: '4px solid #3b82f6', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#64748b', fontWeight: '500' }}>대시보드로 이동 중...</div>
    </div>
  );
};

export default RoleRedirect;
