import React, { useState } from 'react';
import { 
    FileText, Shield, HardHat, Info, Search, 
    ExternalLink, Download, LayoutGrid, List, 
    Newspaper, AlertOctagon, BookOpen, Scaling,
    ArrowUpRight, Clock, User
} from 'lucide-react';

/**
 * [MANAGER] 콘텐츠 관리 페이지 - 프리미엄 다크 테마
 * 안전 뉴스, 법규, 사고사례, 매뉴얼 등을 관리하고 근로자에게 제공
 */
const ManagerContents = () => {
    const [activeTab, setActiveTab] = useState('news');
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = [
        { id: 'news', label: '안전 뉴스', icon: Newspaper },
        { id: 'laws', label: '법규/지침', icon: Shield },
        { id: 'accidents', label: '사고사례', icon: AlertOctagon },
        { id: 'manual', label: '작업 매뉴얼', icon: BookOpen },
    ];

    // 프리미엄 더미 데이터
    const contentData = {
        news: [
            { 
                id: 1, 
                title: '중대재해처벌법 확대 적용에 따른 현장 대응 지침', 
                category: '정책', 
                date: '2026.02.10', 
                author: '산업안전보건공단',
                thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
                desc: '5인 이상 사업장 확대 적용에 따른 건설 현장별 필수 체크리스트 및 대응 방안 안내'
            },
            { 
                id: 2, 
                title: '건설현장 스마트 안전장비 보급 지원 사업 안내', 
                category: '공고', 
                date: '2026.02.05', 
                author: '고용노동부',
                thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400',
                desc: '지능형 CCTV, 웨어러블 카메라 등 스마트 장비 도입 비용 최대 80% 지원'
            },
            { 
                id: 3, 
                title: '최근 혹한기 한랭질환 예방 가이드라인 배포', 
                category: '보건', 
                date: '2026.01.28', 
                author: '안전보건공단',
                thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
                desc: '야외 작업자 체온 관리 및 따뜻한 물 제공, 휴식 시간 준수 수칙'
            },
            { 
                id: 4, 
                title: '2026년 건설업 안전보건 교육 이수제도 변경 안내', 
                category: '교육', 
                date: '2026.01.20', 
                author: '교육운영팀',
                thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?auto=format&fit=crop&q=80&w=400',
                desc: '모바일 앱을 활용한 실시간 교육 이수증 발급 및 관리 체계 도입'
            }
        ],
        laws: [
            { 
                id: 1, 
                title: '산업안전보건기준에 관한 규칙 개정안', 
                category: '법령', 
                date: '2026.01.01', 
                author: '고용노동부',
                thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400',
                desc: '고소 작업대 방호 장치 기준 및 굴착기 안전 관리 강화 조항 포함'
            },
            { 
                id: 2, 
                title: '안전관리자 선임 기준 및 업무 범위 가이드', 
                category: '지침', 
                date: '2025.12.15', 
                author: '대한산업안전협회',
                thumbnail: 'https://images.unsplash.com/photo-1574950578143-858c6fc58922?auto=format&fit=crop&q=80&w=400',
                desc: '공사 금액별 안전관리자 배치 인원 및 겸직 금지 규정 상세 해설'
            },
            { 
                id: 3, 
                title: 'KOSHA-H 최고경영자 안전보건 경영 체계', 
                category: '인증', 
                date: '2025.11.20', 
                author: '시스템본부',
                thumbnail: 'https://images.unsplash.com/photo-1454165833267-0c1023d4e741?auto=format&fit=crop&q=80&w=400',
                desc: '글로벌 안전 기준에 부합하는 건설 현장 경영 시스템 구축 가이드'
            }
        ],
        accidents: [
            { 
                id: 1, 
                title: '이동식 비계 추락 사고 사례 및 예방 대책', 
                category: '추락', 
                date: '2026.02.01', 
                author: '사고분석팀',
                thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f4a8f9b?auto=format&fit=crop&q=80&w=400',
                desc: '아웃트리거 미설치로 인한 전도 사고 원인 분석 및 재발 방지책'
            },
            { 
                id: 2, 
                title: '환기시설 미비로 인한 밀폐공간 질식 사고사례', 
                category: '산소결핍', 
                date: '2026.01.12', 
                author: '기술지원팀',
                thumbnail: 'https://images.unsplash.com/photo-1543165796-5426273eaec3?auto=format&fit=crop&q=80&w=400',
                desc: '지하 맨홀 내부 산소 농도 측정 미실시 및 개인 보호구 미착용 결과'
            },
            { 
                id: 3, 
                title: '중장비 근접 작업 시 협착 사고 주의보', 
                category: '협착', 
                date: '2025.12.05', 
                author: '현장관리팀',
                thumbnail: 'https://images.unsplash.com/photo-1579412623848-038237508bb1?auto=format&fit=crop&q=80&w=400',
                desc: '굴착기 회전 반경 내 보행자 진입 금지 및 신호수 배치 의무화 사례'
            }
        ],
        manual: [
            { 
                id: 1, 
                title: '거푸집 동바리 조립 및 해체 안전 작업 매뉴얼', 
                category: '가설공사', 
                date: '2026.01.20', 
                author: '공무팀',
                thumbnail: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=400',
                desc: '시스템 동바리 구조 계산서 준수 및 수평 연결재 설치 표준'
            },
            { 
                id: 2, 
                title: '중량물 취급 및 양중 작업 표준 지침서', 
                category: '장비운용', 
                date: '2025.12.30', 
                author: '장비팀',
                thumbnail: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&q=80&w=400',
                desc: '줄걸이 로프 점검 기준 및 하중 중심 잡기, 신호 체계 통일'
            },
            { 
                id: 3, 
                title: '화재 및 폭발 예방 용접·용단 작업 수칙', 
                category: '화기작업', 
                date: '2025.11.15', 
                author: '설비팀',
                thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400',
                desc: '불꽃 비산 방지 덮개 설치 및 화재감시원 배치, 소화기 비치 기준'
            }
        ]
    };

    const currentData = (contentData[activeTab] || []).filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ 
            padding: '2rem', 
            minHeight: 'calc(100vh - 64px)',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            color: '#e2e8f0',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* 헤더 섹션 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ 
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                                padding: '12px', 
                                borderRadius: '16px',
                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                            }}>
                                <FileText size={32} color="white" />
                            </div>
                            <h1 style={{ 
                                fontSize: '2.2rem', 
                                fontWeight: '900', 
                                margin: 0, 
                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>콘텐츠 아카이브</h1>
                        </div>
                        <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1.1rem', fontWeight: '600' }}>
                            최신 산업 안전 정보 및 현장 매뉴얼 시스템
                        </p>
                    </div>
                </div>

                {/* 탭 및 필터 바 영역 */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div className="dark-card" style={{ 
                        display: 'flex', 
                        gap: '5px', 
                        padding: '6px', 
                        borderRadius: '16px', 
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(148, 163, 184, 0.1)'
                    }}>
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`dark-level-button ${isActive ? 'active' : ''}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 24px', 
                                        borderRadius: '12px', border: 'none',
                                        fontSize: '1rem', fontWeight: '800'
                                    }}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', flex: 1, justifyContent: 'flex-end', minWidth: '350px' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="검색어를 입력하세요..."
                                className="dark-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '48px' }}
                            />
                        </div>
                        <div className="dark-card" style={{ display: 'flex', padding: '5px', gap: '5px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px' }}>
                            <button 
                                onClick={() => setViewMode('grid')}
                                style={{ 
                                    padding: '8px', borderRadius: '8px', border: 'none', 
                                    background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                    color: viewMode === 'grid' ? '#60a5fa' : '#64748b', cursor: 'pointer' 
                                }}
                            >
                                <LayoutGrid size={22} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                style={{ 
                                    padding: '8px', borderRadius: '8px', border: 'none', 
                                    background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                    color: viewMode === 'list' ? '#60a5fa' : '#64748b', cursor: 'pointer' 
                                }}
                            >
                                <List size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 콘텐츠 영역 */}
                {viewMode === 'grid' ? (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                        gap: '2rem' 
                    }}>
                        {currentData.map(item => (
                            <div 
                                key={item.id} 
                                className="dark-card"
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                                    cursor: 'pointer',
                                    background: 'rgba(30, 41, 59, 0.4)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                                }}
                            >
                                {/* 카드 썸네일 */}
                                <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ 
                                        position: 'absolute', top: '15px', left: '15px', zIndex: 2,
                                        background: 'rgba(15, 23, 42, 0.8)', padding: '5px 12px', 
                                        borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900', color: '#60a5fa',
                                        backdropFilter: 'blur(4px)', border: '1px solid rgba(148, 163, 184, 0.2)'
                                    }}>
                                        {item.category}
                                    </div>
                                    <img 
                                        src={item.thumbnail} 
                                        alt={item.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ 
                                        position: 'absolute', inset: 0, 
                                        background: 'linear-gradient(to bottom, transparent 60%, rgba(15, 23, 42, 0.8) 100%)' 
                                    }} />
                                </div>

                                {/* 카드 콘텐츠 */}
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ 
                                        fontSize: '1.2rem', fontWeight: '900', color: '#f1f5f9', 
                                        marginBottom: '10px', height: '3.4rem', overflow: 'hidden', 
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                        lineHeight: 1.4
                                    }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ 
                                        color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem',
                                        height: '2.5rem', overflow: 'hidden', lineHeight: 1.4
                                    }}>
                                        {item.desc}
                                    </p>
                                    
                                    <div style={{ 
                                        marginTop: 'auto', paddingTop: '1.2rem', 
                                        borderTop: '1px solid rgba(148, 163, 184, 0.1)', 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} /> {item.date}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <User size={14} /> {item.author}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="dark-button" style={{ padding: '6px', minWidth: 'auto', borderRadius: '8px' }}>
                                                <Download size={16} />
                                            </button>
                                            <button className="dark-button active" style={{ padding: '6px', minWidth: 'auto', borderRadius: '8px' }}>
                                                <ArrowUpRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 리스트 뷰 */
                    <div className="dark-card" style={{ padding: '10px', background: 'rgba(30, 41, 59, 0.4)' }}>
                        {currentData.map((item, idx) => (
                            <div 
                                key={item.id} 
                                style={{ 
                                    padding: '1.2rem 1.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '20px',
                                    borderBottom: idx === currentData.length - 1 ? 'none' : '1px solid rgba(148, 163, 184, 0.1)',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ 
                                    width: '100px', height: '60px', borderRadius: '10px', 
                                    overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(148, 163, 184, 0.1)' 
                                }}>
                                    <img src={item.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span className="dark-badge-blue">{item.category}</span>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.date}</span>
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#e2e8f0' }}>{item.title}</div>
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', width: '120px' }}>
                                    {item.author}
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button className="dark-button" style={{ padding: '8px' }}><Download size={18} /></button>
                                    <button className="dark-button active" style={{ padding: '8px' }}><ExternalLink size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {currentData.length === 0 && (
                    <div className="dark-empty-state" style={{ padding: '8rem', fontSize: '1.2rem' }}>
                        <Search size={48} style={{ marginBottom: '15px' }} />
                        <div>검색 결과와 일치하는 콘텐츠가 없습니다.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerContents;
