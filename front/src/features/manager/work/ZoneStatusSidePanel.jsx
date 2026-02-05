import React from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * 구역별 현황 리스트 사이드 패널 컴포넌트
 * @param {Array} zones - 전체 구역 목록
 * @param {Array} filteredPlans - 현재 날짜/현장 기준 필터링된 계획 목록
 * @param {Boolean} isOpen - 패널 열림 상태
 * @param {Function} onClose - 패널 닫기 핸들러
 * @param {Number|null} expandedZoneId - 현재 확장된 구역 ID
 * @param {Function} setExpandedZoneId - 확장 구역 ID 변경 핸들러
 * @param {Array} WORK_TYPE_COLORS - 작업 유형별 색상 배열
 */
const ZoneStatusSidePanel = ({ 
  zones, 
  filteredPlans, 
  isOpen, 
  onClose, 
  expandedZoneId, 
  setExpandedZoneId,
  WORK_TYPE_COLORS 
}) => {
  return (
    <div style={{ 
      position: 'absolute', top: 0, right: isOpen ? 0 : '-280px', 
      width: '280px', height: '100%', background: 'rgba(255, 255, 255, 0.95)', 
      borderLeft: '1px solid #e2e8f0', zIndex: 1000, transition: 'right 0.3s ease-in-out',
      display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b' }}>📍 구역별 현황 리스트</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={16} /></button>
      </div>
      <div className="thin-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {zones.map(zone => {
            const zonePlans = filteredPlans.filter(p => p.zone_id === zone.id);
            const hasWork = zonePlans.length > 0;
            const isExpanded = expandedZoneId === zone.id;
            const workColor = hasWork ? WORK_TYPE_COLORS[filteredPlans.indexOf(zonePlans[0]) % WORK_TYPE_COLORS.length] : '#e2e8f0';
            
            return (
              <div key={zone.id} style={{ 
                background: 'white', borderRadius: '6px', border: '1px solid #f1f5f9', 
                overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                transition: 'all 0.15s ease'
              }}>
                <div 
                  onClick={() => setExpandedZoneId(isExpanded ? null : zone.id)}
                  style={{ 
                    padding: '4px 10px', borderLeft: `3px solid ${workColor}`, cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isExpanded ? '#f8fafc' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.7rem', color: isExpanded ? '#3b82f6' : '#334155' }}>
                      {zone.id}. {zone.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {hasWork && <span style={{ fontSize: '0.55rem', color: '#3b82f6', fontWeight: '800', background: '#eff6ff', padding: '0 4px', borderRadius: '3px' }}>{zonePlans.length}건</span>}
                    {isExpanded ? <ChevronDown size={12} color="#3b82f6" /> : <ChevronRight size={12} color="#cbd5e1" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '6px 10px', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                    {hasWork ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {zonePlans.map(p => (
                          <div key={p.id} style={{ fontSize: '0.7rem' }}>
                            <div style={{ fontWeight: '700', color: '#64748b', marginBottom: '2px', fontSize: '0.65rem' }}>• {p.work_type}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', paddingLeft: '8px' }}>
                              {p.allocations?.map((a, idx) => (
                                <span key={idx} style={{ 
                                  background: '#f8fafc', border: '1px solid #e2e8f0', 
                                  padding: '1px 4px', borderRadius: '3px', fontSize: '0.65rem', color: '#1e40af' 
                                }}>
                                  <span style={{ fontWeight: '800', marginRight: '3px' }}>{a.company_name?.slice(0,4)}</span>
                                  {a.worker_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.65rem', color: '#cbd5e1', fontStyle: 'italic', textAlign: 'center' }}>배정 없음</div>
                    )}
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
