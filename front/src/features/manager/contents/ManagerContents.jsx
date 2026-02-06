import React, { useState } from 'react';
import { FileText, Shield, HardHat, Info, Search, ExternalLink, Download, LayoutGrid, List } from 'lucide-react';

const ManagerContents = () => {
    const [activeTab, setActiveTab] = useState('manual');
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = [
        { id: 'manual', label: '공종별 매뉴얼', icon: FileText },
        { id: 'gear', label: '안전 보호구', icon: HardHat },
        { id: 'standard', label: '안전 기준', icon: Shield },
        { id: 'guide', label: '교육 가이드', icon: Info },
    ];

    // 더미 데이터 (추후 API 연동)
    const contentData = {
        manual: [
            { id: 1, title: '고소 작업 안전 수칙', category: '공통', date: '2026.01.20', author: '안전팀' },
            { id: 2, title: '밀폐 공간 작업 절차서', category: '토목', date: '2026.01.15', author: '기술팀' },
            { id: 3, title: '중장비 반입 검사 기준', category: '기계', date: '2026.01.10', author: '안전팀' },
            { id: 4, title: '전기 설비 안전 점검표', category: '전기', date: '2026.01.05', author: '관리팀' },
        ],
        gear: [
            { id: 1, title: '안전모 (AB종)', category: '머리 보호', date: '2026.01.20', author: '구매팀' },
            { id: 2, title: '방진 마스크', category: '호흡기 보호', date: '2026.01.15', author: '보건팀' },
            { id: 3, title: '안전그네 및 죔줄', category: '추락 보호', date: '2026.01.10', author: '안전팀' },
        ],
        standard: [
            { id: 1, title: '산업안전보건법 시행령', category: '법규', date: '2026.01.01', author: '운영팀' },
            { id: 2, title: '현장 안전 관리 규정', category: '자체규정', date: '2026.01.01', author: '본사' },
        ],
        guide: [
            { id: 1, title: '신규 채용자 교육 자료', category: '정기 교육', date: '2026.01.01', author: '교육팀' },
            { id: 2, title: 'TBM 진행 가이드', category: '현장 교육', date: '2026.01.01', author: '관리팀' },
        ]
    };

    const currentData = contentData[activeTab].filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText color="#2563eb" size={32} /> 콘텐츠 관리
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '6px' }}>근로자에게 제공되는 안전 지식 및 매뉴얼 콘텐츠를 관리합니다.</p>
                </div>
            </div>

            {/* 탭 메뉴 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', background: '#f1f5f9', padding: '6px', borderRadius: '14px', width: 'fit-content' }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
                                border: 'none', background: isActive ? 'white' : 'transparent', color: isActive ? '#0f172a' : '#64748b',
                                fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                fontSize: '0.95rem'
                            }}
                        >
                            <Icon size={18} color={isActive ? '#2563eb' : 'currentColor'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* 필터 바 */}
            <div style={{ 
                background: 'white', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem',
                border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ position: 'relative', width: '400px' }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="제목 또는 카테고리 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                            outline: 'none', fontSize: '0.95rem', transition: 'all 0.2s', backgroundColor: '#f8fafc', color: '#1e293b'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => setViewMode('grid')}
                        style={{ 
                            padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                            background: viewMode === 'grid' ? '#f1f5f9' : 'white', cursor: 'pointer' 
                        }}
                    >
                        <LayoutGrid size={20} color={viewMode === 'grid' ? '#0f172a' : '#94a3b8'} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        style={{ 
                            padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                            background: viewMode === 'list' ? '#f1f5f9' : 'white', cursor: 'pointer' 
                        }}
                    >
                        <List size={20} color={viewMode === 'list' ? '#0f172a' : '#94a3b8'} />
                    </button>
                </div>
            </div>

            {/* 콘텐츠 목록 */}
            <div style={{ 
                display: viewMode === 'grid' ? 'grid' : 'flex', 
                flexDirection: 'column',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1.25rem' 
            }}>
                {currentData.length > 0 ? (
                    currentData.map(item => (
                        <div key={item.id} style={{ 
                            background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', 
                            padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', gap: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px' }}>
                                    {item.category}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.date}</span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: '1.4' }}>{item.title}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>작성: {item.author}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button title="보기" style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}><ExternalLink size={16} /></button>
                                    <button title="다운로드" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Download size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
                        해당 카테고리에 등록된 콘텐츠가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerContents;
