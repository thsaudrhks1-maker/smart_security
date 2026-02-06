
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Lock, User, Building2, Phone } from 'lucide-react';
import { authApi } from '@/api/authApi';
import { companyApi } from '@/api/companyApi';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'worker',
        company_id: '',
        phone: ''
    });

    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await companyApi.getCompanies();
                setCompanies(res.data || []);
            } catch (e) { console.error(e); }
        };
        load();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 회원가입 API 호출 (백엔드 맞춰야 함)
            // await authApi.register(formData); 
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || "회원가입 실패");
        }
    };

    if (success) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
                    <Shield size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                    <h2>회원가입 신청 완료!</h2>
                    <p>관리자 승인 후 이용 가능합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '440px', color: 'white' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={56} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Smart Security</h1>
                    <p style={{ color: '#94a3b8' }}>신규 계정 등록</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                            <input type="text" placeholder="아이디" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} required />
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                        <input type="password" placeholder="비밀번호" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} required />
                    </div>
                    <input type="text" placeholder="성함" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} required />
                    
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}>
                        <option value="worker">작업자</option>
                        <option value="manager">현장 관리자</option>
                    </select>

                    <select value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}>
                        <option value="">소속 회사 선택</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

                    <button type="submit" style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
                        회원가입 신청
                    </button>
                    <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        이미 계정이 있으신가요? 로그인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
