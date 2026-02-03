import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Lock, User, Briefcase, Building2, Phone, Wrench, Calendar } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { getAllCompanies } from '../../api/companyApi';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '작업자', 
        role: 'worker', 
        company_id: '',
        job_type: '',
        phone: '010-0000-0000',
        birth_date: '1995-01-01'
    });

    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // 1. 등록된 모든 회사 목록 가져오기
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const data = await getAllCompanies();
                setCompanies(data);
            } catch (err) {
                console.error("회사를 불러오지 못했습니다.", err);
            }
        };
        loadCompanies();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // 필수 값 검증
        if (!formData.company_id && formData.role !== 'admin') {
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
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.detail || "회원가입에 실패했습니다.");
        }
    };

    if (success) {
        return (
             <div className="container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <Shield size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>회원가입 완료!</h2>
                    <p style={{ color: '#94a3b8' }}>승인 대기 상태로 가입되었습니다.<br/>잠시 후 로그인 페이지로 이동합니다.</p>
                </div>
            </div>
        );
    }

    // 선택된 역할에 따라 표시할 회사 필터링
    const filteredCompanies = companies.filter(c => {
        if (formData.role === 'worker') return c.type === 'SPECIALTY'; // 작업자는 협력사 소속
        if (formData.role === 'manager') return c.type === 'GENERAL'; // 관리자는 원청 소속
        return true;
    });

    return (
        <div className="container register-screen-container" style={{ 
            justifyContent: 'center', alignItems: 'center', minHeight: '100vh', 
            padding: '2rem 1rem', overflowY: 'auto' 
        }}>
            <div className="glass-panel animate-fade-in" style={{ 
                padding: '2.5rem', width: '100%', maxWidth: '440px', textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Shield size={56} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', letterSpacing: '-0.025em' }}>Smart Security</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>차세대 스마트 안전 플랫폼 회원가입</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* 계정 정보 */}
                    <div className="input-group-stack">
                        <div className="custom-input-wrapper">
                            <User size={18} className="input-icon" />
                            <input 
                                type="text" name="username" placeholder="아이디 (사번 또는 ID)"
                                value={formData.username} onChange={handleChange} required 
                            />
                        </div>
                        <div className="custom-input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type="password" name="password" placeholder="비밀번호"
                                value={formData.password} onChange={handleChange} required 
                            />
                        </div>
                    </div>

                    <div className="custom-input-wrapper">
                        <UserPlus size={18} className="input-icon" />
                        <input 
                            type="text" name="full_name" placeholder="이름 (실명)"
                            value={formData.full_name} onChange={handleChange} required 
                        />
                    </div>

                    <div className="input-group-stack">
                         <div className="custom-input-wrapper">
                            <Phone size={18} className="input-icon" />
                            <input 
                                type="text" name="phone" placeholder="전화번호 (010-0000-0000)"
                                value={formData.phone} onChange={handleChange}
                            />
                        </div>
                        <div className="custom-input-wrapper">
                            <Calendar size={18} className="input-icon" />
                            <input 
                                type="date" name="birth_date" placeholder="생년월일"
                                value={formData.birth_date} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

                    {/* 소속 정보 */}
                    <div className="custom-input-wrapper">
                        <Briefcase size={18} className="input-icon" />
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="worker">작업자 (Worker)</option>
                            <option value="manager">현장 관리자 (Manager)</option>
                            <option value="safety_manager">안전 관리자</option>
                        </select>
                    </div>

                    <div className="custom-input-wrapper">
                        <Building2 size={18} className="input-icon" />
                        <select name="company_id" value={formData.company_id} onChange={handleChange} required={formData.role !== 'admin'}>
                            <option value="">소속 회사 선택</option>
                            {filteredCompanies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {formData.role === 'worker' && (
                        <div className="custom-input-wrapper">
                            <Wrench size={18} className="input-icon" />
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

                    {error && (
                        <div style={{ 
                            color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', 
                            padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem',
                            textAlign: 'left', border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" className="register-btn" style={{ 
                        marginTop: '1rem', padding: '1rem', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s'
                    }}>
                        가입 신청하기
                    </button>
                    
                    <button type="button" onClick={() => navigate('/')} style={{ 
                        background: 'none', border: 'none', color: '#94a3b8', 
                        fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' 
                    }}>
                        이미 계정이 있으신가요? 로그인으로
                    </button>
                </form>
            </div>

            <style>{`
                .custom-input-wrapper {
                    position: relative;
                    width: 100%;
                }
                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    pointer-events: none;
                }
                .custom-input-wrapper input, .custom-input-wrapper select {
                    width: 100%;
                    padding: 12px 14px 12px 42px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .custom-input-wrapper select option {
                    background: #1e293b;
                    color: white;
                }
                .custom-input-wrapper input:focus, .custom-input-wrapper select:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .input-group-stack {
                    display: flex;
                    gap: 0.75rem;
                }
                .register-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
                }
                .register-btn:active {
                    transform: translateY(0);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Register;
