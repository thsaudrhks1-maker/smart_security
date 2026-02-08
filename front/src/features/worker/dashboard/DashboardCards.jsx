import React from 'react';
import { MapPin, Shield, AlertTriangle, Info } from 'lucide-react';

const DashboardCards = ({ zonesCount = 0, risksCount = 0, myWorkZone = '미배정', myWorkType = null, onMyZoneClick }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* 내 작업 위치 카드 */}
            <div 
                onClick={onMyZoneClick}
                style={{ 
                    background: '#eff6ff', 
                    padding: '1.25rem', 
                    borderRadius: '24px', 
                    border: '1px solid #dbeafe',
                    cursor: onMyZoneClick ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={(e) => onMyZoneClick && (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => onMyZoneClick && (e.currentTarget.style.transform = 'translateY(0)')}
            >
                {/* 배경 장식 */}
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: '#3b82f6', opacity: 0.1, borderRadius: '50%' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <MapPin size={18} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e40af' }}>내 작업 위치</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e3a8a', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span>{myWorkZone}</span>
                        {onMyZoneClick && <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>위치 보기 &gt;</span>}
                    </div>
                    {myWorkType && (
                        <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '600', marginTop: '4px' }}>
                            {myWorkType}
                        </span>
                    )}
                </div>
            </div>


            {/* 오늘의 안전 수칙 카드 */}
            <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '24px', border: '1px solid #dcfce7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Shield size={18} color="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#166534' }}>오늘의 안전</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#14532d' }}>수칙 준수 중</div>
            </div>

            {/* 위험 현황 카드 */}
            <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '24px', border: '1px solid #ffe4e6', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={18} color="#e11d48" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#9f1239' }}>주변 위험 요소</span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#881337' }}>{risksCount} 건 발견</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCards;
