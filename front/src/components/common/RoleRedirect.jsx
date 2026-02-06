import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * ?€?λ³΄??μ§„μ…??(Dashboard Layout)
 * - ?¬μ©?μ ??• (Role)???•μΈ?μ—¬ ?μ ???€?λ³΄?λ΅ λ¦¬λ‹¤?΄λ ‰?Έν•©?λ‹¤.
 * - κ΄€λ¦¬μ/?μ¥/?μ „κ΄€λ¦¬μ -> /admin (AdminDashboard Layout)
 * - ?‘μ—…??-> /worker (WorkerDashboard Layout)
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

    // ??• λ³?λ¦¬λ‹¤?΄λ ‰??
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (user.role === 'manager' || user.role === 'safety_manager') { // μ¤‘κ°„ κ΄€λ¦¬μ (?μ¥, ?μ „κ΄€λ¦¬μ)
      navigate('/manager', { replace: true });
    } else if (user.role === 'worker') {
      navigate('/worker', { replace: true });
    } else {
      // ??• ???†λ” κ²½μ° (?μ™Έ μ²λ¦¬)
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
      <div style={{ color: '#64748b', fontWeight: '500' }}>?€?λ³΄?λ΅ ?΄λ™ μ¤?..</div>
    </div>
  );
};

export default RoleRedirect;
