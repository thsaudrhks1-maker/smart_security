import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 위험 구역 사진 갤러리 (공통 컴포넌트)
 * - 매니저 대시보드: 우측 사이드바 (고정)
 * - 워커 대시보드: 지도 하단 (토글 가능)
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
            border: '1px solid #e2e8f0', 
            borderRadius: '16px', 
            background: '#f8fafc', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            height: isCollapsible && !isExpanded ? 'auto' : '100%', // 접혔을 때는 auto
            maxHeight: isCollapsible && !isExpanded ? '60px' : 'none', // 접혔을 때 높이 제한
            transition: 'max-height 0.3s ease-in-out'
        }}>
            {/* 헤더 */}
            <div 
                onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
                style={{ 
                    padding: '12px 16px', 
                    background: 'white', 
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                    fontWeight: '800',
                    color: '#ef4444',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: isCollapsible ? 'pointer' : 'default',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📸 위험 구역 사진첩</span>
                    {isCollapsible && (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {isExpanded ? '접기 ▲' : '펼치기 ▼'}
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '0.8rem', background: '#fee2e2', padding: '2px 8px', borderRadius: '8px', color: '#991b1b' }}>
                    {dangerCount} 건
                </span>
            </div>

            {/* 리스트 영역 */}
            {isExpanded && (
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', // 부모 높이에 따라 스크롤 (매니저 대시보드)
                    padding: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px'
                }}>
                    {dangerCount === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            현재 층에 위험 구역이 없습니다.
                        </div>
                    ) : (
                        currentLevelDangers.map((danger, idx) => (
                            <div 
                                key={`${danger.id}-${idx}`}
                                onClick={() => onZoneClick && onZoneClick(danger.zone_data)}
                                style={{ 
                                    background: 'white', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    overflow: 'hidden', 
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                }}
                            >
                                {/* 상단 정보 */}
                                <div style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1e293b' }}>{danger.zone_name}</div>
                                    <div style={{ 
                                        fontSize: '0.7rem', 
                                        padding: '2px 6px', 
                                        background: danger.status === 'PENDING' ? '#fff7ed' : '#fef2f2', 
                                        color: danger.status === 'PENDING' ? '#c2410c' : '#dc2626', 
                                        borderRadius: '4px',
                                        border: `1px solid ${danger.status === 'PENDING' ? '#fdba74' : '#fca5a5'}`,
                                        fontWeight: '700'
                                    }}>
                                        {danger.risk_type || '위험'}
                                    </div>
                                </div>
                                
                                {/* 이미지 영역 */}
                                {danger.images && danger.images.length > 0 ? (
                                    <div style={{ position: 'relative', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                            +{danger.images.length}장
                                        </div>
                                        <img 
                                            src={`http://${window.location.hostname}:8500/uploads/danger_zones/${danger.zone_id}/${danger.danger_info_id || 'custom'}/${danger.images[0]}`}
                                            alt="위험 현장 데이터"
                                            style={{ 
                                                width: '100%', 
                                                height: 'auto', 
                                                display: 'block'
                                                // minHeight 제거: 왜곡 방지 및 원본 비율 유지
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div style="height:150px; display:flex; flexDirection:column; align-items:center; justifyContent:center; background:#f1f5f9; color:#94a3b8; font-size:0.8rem;"><span>🚫</span><span>이미지 없음</span></div>';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: '80px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                                        📷 사진 없음
                                    </div>
                                )}
                                
                                {/* 설명 하단 */}
                                {danger.description && (
                                    <div style={{ padding: '10px', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9' }}>
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
