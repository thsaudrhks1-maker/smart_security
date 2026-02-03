import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Lock, User, Briefcase, Building2, Phone, Tool, Calendar } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { getAllCompanies } from '../../api/companyApi'; // API 연동

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'worker', // default
        company_id: '',
        job_type: '',
        phone: '',
        birth_date: ''
    });

    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // 회사 목록 로드
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const data = await getAllCompanies();
                setCompanies(data);
            } catch (err) {
                console.error("Failed to load companies", err);
            }
        };
        loadCompanies();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // 유효성 검사
        if (formData.role === 'worker' && !formData.company_id) {
            setError('소속 회사를 선택해주세요.');
            return;
        }

        try {
            await authApi.register({
                ...formData,
                company_id: formData.company_id ? parseInt(formData.company_id) : null
            });
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

    // Role에 따라 회사 필터링
    const filteredCompanies = companies.filter(c => {
        if (formData.role === 'worker') return c.type === 'SPECIALTY'; // 전문건설 (협력사)
        if (formData.role === 'manager') return c.type === 'GENERAL'; // 종합건설 (원청)
        return true;
    });

    return (
        <div className="container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Shield size={48} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
                    <h1 style={{ marginTop: '0.5rem', fontSize:'1.8rem' }}>회원가입</h1>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    
                    {/* 1. 기본 정보 */}
                    <div className="input-group">
                        <User size={18} className="icon" />
                        <input 
                            type="text" name="username" placeholder="아이디"
                            value={formData.username} onChange={handleChange} required 
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={18} className="icon" />
                        <input 
                            type="password" name="password" placeholder="비밀번호"
                            value={formData.password} onChange={handleChange} required 
                        />
                    </div>
                    <div className="input-group">
                        <UserPlus size={18} className="icon" />
                        <input 
                            type="text" name="full_name" placeholder="이름 (실명)"
                            value={formData.full_name} onChange={handleChange} required 
                        />
                    </div>
                    <div className="input-group">
                        <Phone size={18} className="icon" />
                        <input 
                            type="text" name="phone" placeholder="연락처 (010-0000-0000)"
                            value={formData.phone} onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <Calendar size={18} className="icon" />
                        <input 
                            type="date" name="birth_date" placeholder="생년월일"
                            value={formData.birth_date} onChange={handleChange}
                        />
                    </div>

                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

                    {/* 2. 역할 및 소속 */}
                    <div className="input-group">
                        <Briefcase size={18} className="icon" />
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="worker">작업자 (Worker)</option>
                            <option value="manager">관리자 (Manager)</option>
                            <option value="safety_manager">안전관리자</option>
                        </select>
                    </div>

                    {/* 소속 회사 선택 */}
                    <div className="input-group">
                        <Building2 size={18} className="icon" />
                        <select name="company_id" value={formData.company_id} onChange={handleChange} required={formData.role !== 'admin'}>
                            <option value="">소속 회사 선택</option>
                            {filteredCompanies.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.type === 'GENERAL' ? '원청' : '협력'})</option>
                            ))}
                        </select>
                    </div>

                    {/* 직종 선택 (작업자일 경우만) */}
                    {formData.role === 'worker' && (
                         <div className="input-group">
                            <Tool size={18} className="icon" />
                            <select name="job_type" value={formData.job_type} onChange={handleChange}>
                                <option value="">직종 선택</option>
                                <option value="보통인부">보통인부</option>
                                <option value="전기공">전기공</option>
                                <option value="배관공">배관공</option>
                                <option value="용접공">용접공</option>
                                <option value="철근공">철근공</option>
                                <option value="비계공">비계공</option>
                                <option value="장비운전원">장비운전원</option>
                            </select>
                        </div>
                    )}

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign:'left', padding:'0 5px' }}>⚠️ {error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                        가입 완료
                    </button>
                    <button type="button" onClick={() => navigate('/')} className="btn-text" style={{ fontSize:'0.9rem', color:'var(--text-muted)' }}>
                        취소하고 로그인으로
                    </button>
                </form>
            </div>
            
            <style>{`
                .input-group { position: relative; }
                .input-group .icon { position: absolute; left: 12px; top: 12px; color: var(--text-muted); pointer-events: none; }
                .input-group input, .input-group select {
                    width: 100%; padding: 10px 10px 10px 40px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    borderRadius: 8px;
                    color: white;
                    outline: none;
                    font-size: 0.95rem;
                }
                .input-group select option { color: black; }
                .input-group input:focus, .input-group select:focus {
                    border-color: var(--accent-primary);
                    background: rgba(255,255,255,0.1);
                }
            `}</style>
        </div>
    );
};

export default Register;
