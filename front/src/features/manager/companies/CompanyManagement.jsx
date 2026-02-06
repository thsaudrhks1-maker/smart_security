import React, { useEffect, useState } from 'react';
import { getMyCompanies } from '@/api/managerApi';
import { Briefcase, Building2, Search, Filter, Plus, ExternalLink } from 'lucide-react';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await getMyCompanies();
            setCompanies(data || []);
        } catch (error) {
            console.error('Failed to load companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.business_number?.includes(searchTerm) ||
        c.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleLabel = (role) => {
        switch(role) {
            case 'CLIENT': return { text: '발주처', color: '#6366f1', bg: '#eef2ff' };
            case 'CONSTRUCTOR': return { text: '시공사', color: '#10b981', bg: '#ecfdf5' };
            case 'PARTNER': return { text: '협력사', color: '#f59e0b', bg: '#fffbeb' };
            default: return { text: role || '협력사', color: '#64748b', bg: '#f1f5f9' };
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Building2 color="#6366f1" size={32} /> 협력사 및 소속 관리
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '6px' }}>현재 프로젝트에 참여 중인 모든 업체 정보를 관리합니다.</p>
                </div>
                
                <button style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', 
                    background: '#6366f1', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)', transition: 'all 0.2s'
                }}>
                    <Plus size={20} /> 새 업체 추가
                </button>
            </div>

            <div style={{ 
                background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem',
                border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                    <input 
                        type="text" 
                        placeholder="업체명, 사업자 번호, 역할 등으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', padding: '14px 14px 14px 50px', borderRadius: '14px', border: '1px solid #e2e8f0', 
                            outline: 'none', fontSize: '1rem', transition: 'all 0.2s', backgroundColor: '#f8fafc', color: '#1e293b'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
                        업체 정보를 불러오는 중...
                    </div>
                ) : filteredCompanies.length > 0 ? (
                    filteredCompanies.map(company => {
                        const role = getRoleLabel(company.role);
                        return (
                            <div key={company.id} style={{ 
                                background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', 
                                padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                            className="company-card"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '14px', background: role.bg, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                    }}>
                                        <Briefcase size={24} color={role.color} />
                                    </div>
                                    <span style={{ 
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                                        background: role.bg, color: role.color, border: `1px solid ${role.color}40`
                                    }}>
                                        {role.text}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>{company.name}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontWeight: '600', color: '#1e293b' }}>대표자:</span> {company.representative || '-'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontWeight: '600', color: '#1e293b' }}>사업자번호:</span> {company.business_number || '-'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontWeight: '600', color: '#1e293b' }}>연락처:</span> {company.phone || '-'}
                                    </div>
                                </div>

                                <div style={{ 
                                    marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        투입 인력 <span style={{ fontWeight: '700', color: '#0f172a' }}>{company.worker_count || company.member_count || 0}</span> 명
                                    </div>
                                    <button style={{ 
                                        background: 'none', border: 'none', color: '#6366f1', display: 'flex', 
                                        alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' 
                                    }}>
                                        상세보기 <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
                        검색 결과와 일치하는 업체가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyManagement;
