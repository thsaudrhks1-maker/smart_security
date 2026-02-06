
import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';

const ZoneStatusSidePanel = ({ zones = [], plans = [], risks = [], onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedZoneId, setExpandedZoneId] = useState(null);

    const filteredZones = zones.filter(z => z.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{ width: '320px', height: '100%', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>현장 구역 현황</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input 
                        type="text" 
                        placeholder="구역 이름 검색..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                    {filteredZones.map(zone => {
                        const zonePlans = plans.filter(p => p.zone_id === zone.id);
                        const zoneRisks = risks.filter(r => r.zone_id === zone.id);
                        const isExpanded = expandedZoneId === zone.id;

                        return (
                            <div key={zone.id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                                <div 
                                    onClick={() => setExpandedZoneId(isExpanded ? null : zone.id)}
                                    style={{ padding: '12px', background: isExpanded ? '#f8fafc' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{zone.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{zone.level} | {zone.type}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {zoneRisks.length > 0 && <AlertTriangle size={16} color="#ef4444" />}
                                        {zonePlans.length > 0 && <CheckCircle2 size={16} color="#3b82f6" />}
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div style={{ padding: '12px', background: '#fcfcfc', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>진행 작업</div>
                                            {zonePlans.length === 0 ? '없음' : zonePlans.map(p => p.work_type).join(', ')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '0.75rem', marginBottom: '4px' }}>위험 요소</div>
                                            {zoneRisks.length === 0 ? '정상' : zoneRisks.map(r => r.description).join(', ')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ZoneStatusSidePanel;
