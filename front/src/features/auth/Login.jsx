
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        // 성공 시 바로 /dashboard로 이동 (App.jsx가 역할별로 뿌려줌)
        navigate('/dashboard');
        return;
      }
      setError(result.message || '로그인에 실패했습니다.');
    } catch (err) {
      setError('서버 연결 오류');
    } finally {
      setIsSubmitting(false);
    }
  };

  if(loading) return <div>로딩 중...</div>;

  return (
    <div className="container" style={{ display:'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
            <Shield size={64} color="#3b82f6" style={{ margin: '0 auto' }} />
            <h1 style={{ marginTop: '1rem', color:'white' }}>Smart Security</h1>
            <p style={{ color: '#94a3b8' }}>도메인 기반 통합 로그인</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                <input 
                    type="text" placeholder="아이디"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                />
            </div>
            <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                <input 
                    type="password" placeholder="비밀번호"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                />
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

            <button type="submit" disabled={isSubmitting} style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
