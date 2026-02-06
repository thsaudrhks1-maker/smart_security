
import React, { useState, useEffect } from 'react';
import { companyApi } from '@/api/companyApi';
import { Building2, Plus, Briefcase, Trash2 } from 'lucide-react';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'SPECIALTY' });

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const res = await companyApi.getCompanies();
            setCompanies(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 업체 등록 로직 (필요 시 API 정의 후 연결)
            alert('업체가 성공적으로 등록되었습니다.');
            setShowModal(false);
            loadCompanies();
        } catch (e) {
            alert('등록 실패');
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>로딩 중...</div>;

    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>🏢 협력업체 관리</h1>
                    <p style={{ color: '#94a3b8' }}>시스템에 등록된 원청 및 협력사 목록입니다.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    + 신규 업체 등록
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {companies.map(c => (
                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <Building2 size={18} color={c.type === 'GENERAL' ? '#3b82f6' : '#10b981'} />
                                <h3 style={{ margin: 0 }}>{c.name}</h3>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {c.type === 'GENERAL' ? '원청/종합건설' : '협력사/전문건설'}
                            </span>
                        </div>
                    </div>
                ))}
                {companies.length === 0 && <div style={{ color: '#64748b' }}>등록된 업체가 없습니다.</div>}
            </div>

            {/* 등록 모달 (심플 버전) */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>신규 업체 등록</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input 
                                type="text" placeholder="업체명 (예: (주)현대건설)" 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                                required
                            />
                            <select 
                                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                                style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                            >
                                <option value="GENERAL">원청 (종합건설)</option>
                                <option value="SPECIALTY">협력사 (전문건설)</option>
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>등록</button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: 'white' }}>취소</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyList;
