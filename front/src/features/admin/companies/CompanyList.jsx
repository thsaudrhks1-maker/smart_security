
import React, { useState, useEffect } from 'react';
import { companyApi } from '@/api/companyApi';
import { Building2, Plus, Search, Building } from 'lucide-react';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newComp, setNewComp] = useState({ name: '', type: 'PARTNER' });

    const loadCompanies = async () => {
        try {
            const res = await companyApi.getCompanies();
            setCompanies(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadCompanies(); }, []);

    const handleCreate = async () => {
        if (!newComp.name) return alert('업체명을 입력하세요.');
        try {
            await companyApi.createCompany(newComp);
            setShowModal(false);
            setNewComp({ name: '', type: 'PARTNER' });
            loadCompanies();
            alert('업체가 성공적으로 등록되었습니다.');
        } catch (e) {
            alert('업체 등록에 실패했습니다.');
        }
    };

    if (loading) return <div style={{ color: '#64748b', padding: '3rem', textAlign: 'center', fontWeight: '800' }}>데이터 로딩 중...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>🏢 협력업체 및 파트너 관리</h1>
                    <p style={{ color: '#64748b' }}>시스템에 등록된 발주처, 시공사 및 파트너사 목록입니다.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ padding: '0.8rem 1.5rem', background: '#3b82f6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
                >
                    <Plus size={20} /> 새 업체 등록
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {companies.map(c => (
                    <div key={c.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '14px' }}>
                          <Building size={24} color="#64748b" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{c.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '8px' }}>
                              <span style={{ color: '#3b82f6', fontWeight: '700' }}>{c.type}</span>
                              <span style={{ color: '#cbd5e1' }}>|</span>
                              <span>{c.business_no || '사업자번호 미등록'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 업체 등록 모달 */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem', color: '#0f172a' }}>새 업체 등록</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#475569', fontSize: '0.9rem' }}>업체명</label>
                                <input
                                    type="text"
                                    placeholder="정확한 업체명 입력"
                                    value={newComp.name}
                                    onChange={e => setNewComp({ ...newComp, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#475569', fontSize: '0.9rem' }}>업체 구분</label>
                                <select
                                    value={newComp.type}
                                    onChange={e => setNewComp({ ...newComp, type: e.target.value })}
                                    style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                                >
                                    <option value="CLIENT">발주처 (Client)</option>
                                    <option value="CONSTRUCTOR">시공사 (Constructor)</option>
                                    <option value="PARTNER">협력사 (Partner)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', fontWeight: '800', cursor: 'pointer', color: '#64748b' }}>취소</button>
                                <button onClick={handleCreate} style={{ flex: 1, padding: '1rem', border: 'none', borderRadius: '12px', background: '#3b82f6', color: 'white', fontWeight: '800', cursor: 'pointer' }}>등록하기</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyList;
