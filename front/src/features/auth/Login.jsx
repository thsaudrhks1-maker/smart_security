import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [formData, setFormData] = useState({ username: 'admin', password: '0000' });

  if (auth == null) {
    return <div className="container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }
  const { login, loading } = auth;
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // redirect if already logged in? (Optional, skipping for now)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/dashboard');
        return;
      }
      setError(result.message || '로그인에 실패했습니다.');
    } catch (err) {
      console.error('Login error', err);
      const msg = err.response?.data?.detail ?? err.message ?? '서버에 연결할 수 없습니다. 백엔드(및 DB)가 실행 중인지 확인하세요.';
      setError(typeof msg === 'string' ? msg : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if(loading) return <div>Loading...</div>;

  return (
    <div className="container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
            <Shield size={64} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
            <h1 style={{ marginTop: '1rem' }}>Smart Security</h1>
            <p className="text-muted">Safe-On Lite v1.0</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group" style={{ position: 'relative', textAlign: 'left' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                    type="text" 
                    placeholder="아이디 (admin)"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    style={{ 
                        width: '100%', padding: '12px 12px 12px 40px', 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                        borderRadius: '8px', color: 'white', outline: 'none' 
                    }}
                />
            </div>
            <div className="input-group" style={{ position: 'relative', textAlign: 'left' }}>
                 <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                    type="password" 
                    placeholder="비밀번호 (0000)"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    style={{ 
                        width: '100%', padding: '12px 12px 12px 40px', 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                        borderRadius: '8px', color: 'white', outline: 'none' 
                    }}
                />
            </div>

            {error && <div style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>{error}</div>}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
            
            <button type="button" onClick={() => navigate('/register')} className="btn-text" style={{ fontSize:'0.9rem', color:'var(--text-muted)' }}>
                계정이 없으신가요? 회원가입
            </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
