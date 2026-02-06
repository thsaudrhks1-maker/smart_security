
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, User, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.username, formData.password);
      if (result.success) navigate('/dashboard');
      else alert(result.message || '로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
    } catch (e) {
      alert('서버 연결 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1rem' }}>
      <div style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Shield size={42} color="#3b82f6" />
            </div>
            <h1 style={{ marginTop: '1.25rem', color: '#0f172a', fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Smart Security</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>현장 안전 통합 관제 로그인</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
                <input
                    type="text" 
                    placeholder="아이디 (Username)"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: '#fcfcfc' }}
                />
            </div>
            <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
                <input
                    type="password" 
                    placeholder="비밀번호 (Password)"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: '#fcfcfc' }}
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                style={{ height: '55px', border: 'none', borderRadius: '14px', background: '#3b82f6', color: 'white', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
            >
                {loading ? <Loader2 size={24} className="animate-spin" /> : '로그인'}
            </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>계정이 없으신가요?</p>
            <button 
                onClick={() => navigate('/register')}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '800', cursor: 'pointer', marginTop: '0.5rem', fontSize: '1rem', textDecoration: 'underline' }}
            >
                회원가입 하기
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
