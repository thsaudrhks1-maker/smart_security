import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 위험 구역 사진 갤러리 (공통 컴포넌트) - 다크 테마 반영
 */
const DangerZoneGallery = ({ 
    zones = [], 
    currentLevel, 
    onZoneClick, 
    isCollapsible = false, 
    defaultExpanded = true 
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // 현재 층의 위험 구역 데이터 필터링
    const currentLevelDangers = zones
        .filter(z => z.level === currentLevel)
        .reduce((acc, z) => {
            return acc.concat((z.dangers || []).map(d => ({ 
                ...d, 
                zone_name: z.name, 
                zone_data: z 
            })));
        }, []);

    const dangerCount = currentLevelDangers.length;

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            height: isCollapsible && !isExpanded ? 'auto' : '100%', 
            maxHeight: isCollapsible && !isExpanded ? '60px' : 'none', 
            transition: 'max-height 0.3s ease-in-out',
            background: 'transparent' // 부모가 dark-card인 경우가 많음
        }}>
            {/* 헤더 */}
            <div 
                onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
                style={{ 
                    padding: '12px 16px', 
                    background: 'rgba(59, 130, 246, 0.05)', 
                    borderBottom: isExpanded ? '1px solid rgba(148, 163, 184, 0.1)' : 'none',
                    fontWeight: '800',
                    color: '#f87171',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: isCollapsible ? 'pointer' : 'default',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                        background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>📸 위험 구역 사진첩</span>
                    {isCollapsible && (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {isExpanded ? '접기 ▲' : '펼치기 ▼'}
                        </span>
                    )}
                </div>
                <span style={{ 
                    fontSize: '0.8rem', 
                    background: 'rgba(239, 68, 68, 0.2)', 
                    padding: '2px 8px', 
                    borderRadius: '8px', 
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    {dangerCount} 건
                </span>
            </div>

            {/* 리스트 영역 */}
            {isExpanded && (
                <div className="dark-scrollbar" style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px'
                }}>
                    {dangerCount === 0 ? (
                        <div className="dark-empty-state">
                            현재 층에 위험 구역이 없습니다.
                        </div>
                    ) : (
                        currentLevelDangers.map((danger, idx) => (
                            <div 
                                key={`${danger.id}-${idx}`}
                                onClick={() => onZoneClick && onZoneClick(danger.zone_data)}
                                className="dark-card"
                                style={{ 
                                    borderRadius: '16px', 
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.4)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                                }}
                            >
                                {/* 상단 정보 */}
                                <div style={{ 
                                    padding: '10px 14px', 
                                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    background: 'rgba(30, 41, 59, 0.2)'
                                }}>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#e2e8f0' }}>{danger.zone_name}</div>
                                    <div style={{ 
                                        fontSize: '0.7rem', 
                                        padding: '2px 8px', 
                                        background: 'rgba(239, 68, 68, 0.15)', 
                                        color: '#f87171', 
                                        borderRadius: '6px',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        fontWeight: '800'
                                    }}>
                                        {danger.risk_type || '위험'}
                                    </div>
                                </div>
                                
                                {/* 이미지 영역 */}
                                {danger.images && danger.images.length > 0 ? (
                                    <div style={{ position: 'relative', background: '#0f172a' }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '10px', 
                                            right: '10px', 
                                            zIndex: 1, 
                                            background: 'rgba(15, 23, 42, 0.8)', 
                                            color: '#e2e8f0', 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: '900',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            backdropFilter: 'blur(4px)'
                                        }}>
                                            +{danger.images.length}장
                                        </div>
                                        <img 
                                            src={`/uploads/daily_danger_images/${danger.images[0]}`}
                                            alt="위험 현장 데이터"
                                            style={{ 
                                                width: '100%', 
                                                height: 'auto', 
                                                display: 'block'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div style=\"height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1e293b; color:#64748b; font-size:0.8rem;\"><span>🚫</span><span>이미지 없음</span></div>';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: '100px', background: 'rgba(15, 23, 42, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                        📷 사진 데이터 없음
                                    </div>
                                )}
                                
                                {/* 설명 하단 */}
                                {danger.description && (
                                    <div style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(30, 41, 59, 0.1)' }}>
                                        {danger.description}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DangerZoneGallery;
