
import React, { useState } from 'react';
import { Shield, AlertTriangle, Users, Map as MapIcon, ChevronUp, ChevronDown } from 'lucide-react';

const SafetyControlCenter = () => {
    const [mapExpanded, setMapExpanded] = useState(true);

    // 임시 현장 데이터
    const zones = [
        { id: 1, name: 'A구역 (기초공사)', status: 'SAFE', workers: 12 },
        { id: 2, name: 'B구역 (골조공사)', status: 'WARN', workers: 8 },
        { id: 3, name: 'C구역 (하역장)', status: 'DANGER', workers: 5 },
    ];

    return (
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield color="#3b82f6" size={28} />
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', margin: 0 }}>실시간 스마트 안전 관제</h2>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>종합 현장 모니터링 시스템</p>
                    </div>
                </div>
                <button 
                    onClick={() => setMapExpanded(!mapExpanded)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', color: 'white', cursor: 'pointer' }}
                >
                    {mapExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {mapExpanded && (
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ background: '#0f172a', height: '300px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <MapIcon size={48} color="#334155" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#64748b' }}>3D 디지털 트윈 맵 로딩 중...</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {zones.map(zone => (
                            <div key={zone.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>{zone.name}</span>
                                    {zone.status === 'SAFE' && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>● 정상</span>}
                                    {zone.status === 'WARN' && <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>● 주의</span>}
                                    {zone.status === 'DANGER' && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>● 위험</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <Users size={14} /> <span>{zone.workers}명 투입 중</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SafetyControlCenter;
