import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Lock, User, Briefcase } from 'lucide-react';
import { authApi } from '../../api/authApi';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'worker' // 기본값
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await authApi.register(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || "회원가입 실패");
        }
    };

    if (success) {
        return (
             <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--success)' }}>회원가입 성공!</h2>
                    <p>로그인 페이지로 이동합니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Shield size={64} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
                    <h1 style={{ marginTop: '1rem' }}>Smart Security</h1>
                    <p className="text-muted">회원가입</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group" style={{ position: 'relative', textAlign: 'left' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="아이디"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div className="input-group" style={{ position: 'relative', textAlign: 'left' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <input 
                            type="password" 
                            placeholder="비밀번호"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                             style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div className="input-group" style={{ position: 'relative', textAlign: 'left' }}>
                        <UserPlus size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="이름 (실명)"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            required
                             style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                        />
                    </div>
                     <div className="input-group" style={{ position: 'relative', textAlign: 'left' }}>
                        <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                             style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                        >
                            <option value="worker" style={{color:'black'}}>작업자 (Worker)</option>
                            <option value="manager" style={{color:'black'}}>관리자 (Manager)</option>
                            <option value="admin" style={{color:'black'}}>최고관리자 (Admin)</option>
                        </select>
                    </div>

                    {error && <div style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        가입하기
                    </button>
                    <button type="button" onClick={() => navigate('/')} className="btn-text" style={{ fontSize:'0.9rem', color:'var(--text-muted)' }}>
                        취소하고 로그인으로
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
