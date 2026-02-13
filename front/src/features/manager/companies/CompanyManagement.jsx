import React, { useEffect, useState } from 'react';
import { getMyCompanies } from '@/api/managerApi';
import { 
    Briefcase, Building2, Search, Filter, Plus, 
    ExternalLink, Users, ShieldAlert, CheckCircle2,
    TrendingUp, Mail, Phone, MoreVertical, LayoutGrid, List,
    ShieldCheck, AlertCircle, FileWarning
} from 'lucide-react';

/**
 * [MANAGER] 협력사 관리
 * - 프로젝트 참여 업체 리스트 및 기본 정보 관리
 * - 업체별 안전 지수 및 투입 인원 요약
 */
const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('GRID'); // GRID, LIST

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.project_id) {
            loadCompanies(user.project_id);
        }
    }, []);

    const loadCompanies = async (projectId) => {
        try {
            setLoading(true);
            const res = await getMyCompanies(projectId);
            const data = res?.success ? res.data : (res || []);
            setCompanies(data);
        } catch (error) {
            console.error('Failed to load companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.trade_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (type) => {
        switch(type) {
            case 'CLIENT': return { text: '발주처', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'CONSTRUCTOR':
            case 'GENERAL': return { text: '시공사', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
            case 'PARTNER':
            case 'SPECIALTY': return { text: '협력사', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            default: return { text: type || '기타', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
        }
    };

    return (
        <div style={{ 
            padding: '1.5rem', 
            height: 'calc(100vh - 64px)', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            color: '#e2e8f0',
            overflow: 'hidden'
        }}>
            {/* 상단 헤더 섹션 */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(20px)',
                padding: '1rem 1.5rem',
                borderRadius: '24px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                        padding: '12px', borderRadius: '16px',
                        boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
                    }}>
                        <Building2 size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>협력사 및 파트너 관리</h1>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: '600' }}>프로젝트 참여 업체 현황 및 안전 책임 정보 관리</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.4)', padding: '4px', borderRadius: '10px', marginRight: '10px' }}>
                        <button 
                            onClick={() => setViewMode('GRID')}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: viewMode === 'GRID' ? '#334155' : 'transparent', color: viewMode === 'GRID' ? '#60a5fa' : '#64748b', cursor: 'pointer' }}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('LIST')}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: viewMode === 'LIST' ? '#334155' : 'transparent', color: viewMode === 'LIST' ? '#60a5fa' : '#64748b', cursor: 'pointer' }}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button className="dark-button" style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white', padding: '10px 20px'
                    }}>
                        <Plus size={18} /> 협력사 신규 등록
                    </button>
                </div>
            </div>

            {/* 통계 요약 (Slim) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: '전체 업체', value: companies.length, unit: '개소', color: '#6366f1', icon: Briefcase },
                    { label: '종합 건설사', value: companies.filter(c => c.type === 'GENERAL').length, unit: '개소', color: '#10b981', icon: Building2 },
                    { label: '전문 건설사', value: companies.filter(c => c.type === 'SPECIALTY').length, unit: '개소', color: '#f59e0b', icon: Hammer },
                    { label: '평균 안전 점수', value: '94.2', unit: '점', color: '#3b82f6', icon: ShieldCheck }
                ].map((stat, i) => (
                    <div key={i} className="dark-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: `${stat.color}15`, padding: '12px', borderRadius: '14px' }}>
                            {stat.icon ? <stat.icon size={22} color={stat.color} /> : <div style={{width: 22, height: 22}} />}
                        </div>
                        <div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800' }}>{stat.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f1f5f9' }}>{stat.value}</span>
                                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>{stat.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 검색 및 필터 */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                <input 
                    type="text" 
                    placeholder="업체명, 주력 공종, 비즈니스 정보 검색..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dark-input"
                    style={{ paddingLeft: '55px', height: '56px', fontSize: '1rem', background: 'rgba(30, 41, 59, 0.4)' }}
                />
            </div>

            {/* 메인 콘텐츠 (Grid View) */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="dark-scrollbar">
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
                    gap: '1.5rem',
                    paddingBottom: '1.5rem'
                }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#64748b' }}>업체 데이터를 로드 중입니다...</div>
                    ) : filteredCompanies.map((company, idx) => {
                        const badge = getRoleBadge(company.type);
                        return (
                            <div key={company.id} className="dark-card" style={{ 
                                padding: '1.5rem', border: '1px solid rgba(148, 163, 184, 0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer', position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                            }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '12px', borderRadius: '16px' }}>
                                        <Building2 size={24} color="#f1f5f9" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {company.missing_docs_count !== undefined && (
                                            <div style={{ 
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900',
                                                background: company.missing_docs_count > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.05)', 
                                                color: company.missing_docs_count > 0 ? '#f87171' : '#64748b', 
                                                border: company.missing_docs_count > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(148, 163, 184, 0.1)'
                                            }}>
                                                <FileWarning size={12} /> 서류 {company.missing_docs_count === null ? '00' : company.missing_docs_count}건 누락
                                            </div>
                                        )}
                                        <div style={{ 
                                            padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '900',
                                            background: badge.bg, color: badge.color, border: `1px solid ${badge.color}20`
                                        }}>
                                            {badge.text}
                                        </div>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                                    {company.name}
                                </h3>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(30, 41, 59, 0.6)', padding: '4px 10px', borderRadius: '6px', color: '#94a3b8' }}>
                                        #{company.trade_type || '공중 미지정'}
                                    </span>
                                    {company.risk_worker_count === undefined ? (
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(30, 41, 59, 0.3)', padding: '4px 10px', borderRadius: '6px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ShieldAlert size={12} /> 고위험 00명
                                        </span>
                                    ) : company.risk_worker_count > 0 && (
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '6px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ShieldAlert size={12} /> 고위험 {Math.floor(company.risk_worker_count)}명
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.05)' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>현장투입</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#f1f5f9' }}>{company.assigned_workers || 0}명</div>
                                    </div>
                                    <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.05)' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>총 직원</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#60a5fa' }}>{company.total_staff || 0}명</div>
                                    </div>
                                    <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(10, 185, 129, 0.1)' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>안전점수</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: company.safety_score ? '#10b981' : '#475569' }}>
                                            {company.safety_score === undefined || company.safety_score === null ? '00' : company.safety_score}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(148, 163, 184, 0.05)', paddingTop: '1.25rem' }}>
                                    <button style={{ flex: 1, padding: '10px', background: 'rgba(148, 163, 184, 0.1)', border: 'none', borderRadius: '10px', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <Mail size={14} /> 문의
                                    </button>
                                    <button style={{ flex: 1, padding: '10px', background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '10px', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <ExternalLink size={14} /> 상세정보
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// 임시 아이콘 Helper
const Hammer = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.23V5a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v2.77c0 .83-.34 1.63-.93 2.23L9.55 11.25"/><path d="m15 15 5 5"/><path d="m22 9-4-4"/></svg>
);

export default CompanyManagement;
