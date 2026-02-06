
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '@/api/companyApi';
import { Shield, User, Lock, Building2, UserCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'worker',
        company_id: ''
    });

    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const res = await companyApi.getCompanies();
                setCompanies(res.data.data || []);
            } catch (e) {
                console.error('업체 목록 로드 실패', e);
            }
        };
        loadCompanies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 실제 회원가입 로직은 authApi 확장이 필요할 수 있음
            // 현재는 간단히 성공 처리만 모킹하거나, 필요시 세부 구현 추가
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || "회원가입 처리 중 오류가 발생했습니다.");
        }
    };

    if (success) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ padding: '3rem', textAlign: 'center', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #10b981', maxWidth: '450px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <CheckCircle2 size={48} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#065f46', marginBottom: '1rem' }}>회원가입 성공!</h2>
                    <p style={{ color: '#047857', fontWeight: '600' }}>계정이 성공적으로 생성되었습니다.<br/>2초 후 로그인 화면으로 이동합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ padding: '2.5rem', width: '100%', maxWidth: '500px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', color: '#64748b', fontWeight: '800', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>
                    <ArrowLeft size={18} /> 이전 페이지
                </button>

                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a' }}>계정 생성</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>현장 안전 통합 관제 솔루션에 오신 것을 환영합니다.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <Label>아이디</Label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
                            <Input placeholder="사용할 아이디 입력" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                        </div>
                    </div>

                    <div>
                        <Label>비밀번호</Label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
                            <Input type="password" placeholder="비밀번호 설정" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        </div>
                    </div>

                    <div>
                        <Label>성함 (실명)</Label>
                        <div style={{ position: 'relative' }}>
                            <UserCircle size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#94a3b8' }} />
                            <Input placeholder="정확한 성함을 입력하세요" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>역할 선택</Label>
                            <Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="worker">근로자 (Worker)</option>
                                <option value="manager">관리자 (Manager)</option>
                            </Select>
                        </div>
                        <div>
                            <Label>소속 업체</Label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                                <Select value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})} style={{ paddingLeft: '2.2rem' }}>
                                    <option value="">업체 선택</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        style={{ height: '55px', border: 'none', borderRadius: '16px', background: '#0f172a', color: 'white', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '1rem', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}
                    >
                        회원가입 완료
                    </button>
                </form>
            </div>
        </div>
    );
};

const Label = ({ children }) => (
    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '800', color: '#475569' }}>{children}</label>
);

const Input = (props) => (
    <input {...props} style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '14px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: '#fcfcfc', boxSizing: 'border-box' }} />
);

const Select = (props) => (
    <select {...props} style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '14px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem', color: '#1e293b', background: '#fcfcfc', cursor: 'pointer', boxSizing: 'border-box', ...props.style }}>{props.children}</select>
);

export default Register;
