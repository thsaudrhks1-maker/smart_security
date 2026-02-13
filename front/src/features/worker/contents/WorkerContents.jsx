
import React, { useState, useEffect } from 'react';
import { 
    Search, BookOpen, ShieldAlert, FileText, Zap, 
    ChevronRight, Sparkles, Filter, PlayCircle, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * [WORKER] 콘텐츠 아카이브 - AI 기반 지능형 기술 지침 및 안전 가이드
 */
const WorkerContents = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('AI_RECOM'); // AI_RECOM, MANUAL, NEWS, LAW
    const [isSearching, setIsSearching] = useState(false);

    // 더미 콘텐츠 데이터
    const contents = [
        {
            id: 1,
            category: 'MANUAL',
            title: '거푸집 조립 시 주요 체크포인트',
            desc: '조립 전 부재의 변형 및 부식 상태 확인 필수 지침',
            tag: '목수 공정',
            isPremium: true
        },
        {
            id: 2,
            category: 'NEWS',
            title: '2026 건설현장 스마트 안전장비 보급 지원',
            desc: '정부 지원 사업 안내 및 신청 방법 (최대 80% 지원)',
            tag: '안전 정책',
            isPremium: false
        },
        {
            id: 3,
            category: 'LAW',
            title: '중대재해처벌법 핵심 요약 가이드',
            desc: '현장 작업자가 반드시 알아야 할 법률 상식',
            tag: '법률 지침',
            isPremium: true
        },
        {
            id: 4,
            category: 'AI_RECOM',
            title: '내 공정 맞춤형: 낙하물 방지망 설치 기준',
            desc: 'AI 분석 결과 현재 작업 구역에서 가장 주의해야 할 항목',
            tag: '맞춤 분석',
            isPremium: true
        },
        {
            id: 5,
            category: 'MANUAL',
            title: '중장비 협착 예방을 위한 신호수 체계',
            desc: '현장에서 즉시 사용 가능한 표준 신호 매뉴얼',
            tag: '장비 안전',
            isPremium: false
        }
    ];

    const filteredContents = contents.filter(c => {
        if (activeTab === 'AI_RECOM') return c.category === 'AI_RECOM' || c.isPremium;
        return c.category === activeTab;
    });

    const handleAISearch = () => {
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 1500);
    };

    return (
        <div style={{ padding: '1.25rem', paddingBottom: '100px', color: '#f1f5f9', background: '#0b1120', minHeight: '100vh' }}>
            {/* 헤더 섹션 */}
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={20} color="#3b82f6" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#3b82f6', letterSpacing: '0.1em' }}>AI INTELLIGENCE</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '950', margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
                    지능형 콘텐츠 센터
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
                    {user?.full_name} 님의 공정에 최적화된 안전 지침입니다.
                </p>
            </header>

            {/* AI 검색바 */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '20px', 
                    padding: '4px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ padding: '0 12px' }}>
                        <Search size={20} color="#64748b" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="나의 작업에 맞는 안전 지침 찾기..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ 
                            flex: 1, background: 'transparent', border: 'none', 
                            padding: '12px 0', color: '#fff', outline: 'none', 
                            fontSize: '0.9rem', fontWeight: '600'
                        }}
                    />
                    <button 
                        onClick={handleAISearch}
                        style={{ 
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '16px',
                            fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        {isSearching ? <div className="spinner" /> : <Sparkles size={14} />}
                        AI 분석
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                    { id: 'AI_RECOM', label: 'AI 추천', icon: Sparkles },
                    { id: 'MANUAL', label: '작업 매뉴얼', icon: BookOpen },
                    { id: 'NEWS', label: '안전 뉴스', icon: Zap },
                    { id: 'LAW', label: '법규/지침', icon: ShieldAlert }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '10px 16px', borderRadius: '14px', border: '1px solid',
                            borderColor: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                            background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === tab.id ? '#3b82f6' : '#94a3b8',
                            fontSize: '0.8rem', fontWeight: '800', whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s', cursor: 'pointer'
                        }}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 콘텐츠 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredContents.map(content => (
                    <div 
                        key={content.id}
                        className="content-card"
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            borderRadius: '24px', 
                            padding: '1.25rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {content.isPremium && (
                            <div style={{ 
                                position: 'absolute', top: 0, right: 0, 
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                padding: '4px 12px', borderRadius: '0 0 0 16px',
                                fontSize: '0.65rem', fontWeight: '900', color: '#fff'
                            }}>
                                PREMIUM
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', color: '#3b82f6', fontWeight: '900' }}>
                                {content.tag}
                            </div>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1.4' }}>{content.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontWeight: '600', lineHeight: '1.5' }}>{content.desc}</p>
                        
                        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '900' }}>
                                전문 보기 <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .content-card:active { transform: scale(0.98); background: rgba(255,255,255,0.05); }
                .spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default WorkerContents;
