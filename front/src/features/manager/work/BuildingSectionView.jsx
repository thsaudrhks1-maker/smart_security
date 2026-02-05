import React from 'react';
import { Layers, AlertTriangle, HardHat } from 'lucide-react';

/**
 * [컴포넌트] BuildingSectionView
 * 건물 단면도 형태로 층별 상태를 시각화하고 선택할 수 있는 사이드바
 */
const BuildingSectionView = ({ 
  project, 
  selectedLevel, 
  onLevelSelect,
  allZones = [],
  allPlans = [],
  allRisks = []
}) => {
  // 층 리스트 생성 (B2, B1, 1F, 2F...)
  const levels = React.useMemo(() => {
    if (!project) return ['1F'];
    const res = [];
    // 지상층 (역순으로 쌓아야 위에서 아래로 보임)
    for (let i = project.ground_floors; i >= 1; i--) {
      res.push(`${i}F`);
    }
    // 지하층
    for (let i = 1; i <= project.basement_floors; i++) {
      res.push(`B${i}`);
    }
    return res;
  }, [project]);

  // 층별 통계 계산
  const levelStats = React.useMemo(() => {
    const stats = {};
    levels.forEach(lvl => {
      const zoneIdsInLevel = new Set(allZones.filter(z => z.level === lvl).map(z => z.id));
      const plansCount = allPlans.filter(p => zoneIdsInLevel.has(p.zone_id)).length;
      const risksCount = allRisks.filter(r => zoneIdsInLevel.has(r.zone_id)).length;
      stats[lvl] = { plansCount, risksCount };
    });
    return stats;
  }, [levels, allZones, allPlans, allRisks]);

  return (
    <div style={{ 
      width: '100px', 
      flexShrink: 0,
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px',
      background: '#f1f5f9',
      padding: '8px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflowY: 'auto',
      maxHeight: '100%'
    }}>
      <div style={{ 
        fontSize: '0.65rem', 
        fontWeight: '800', 
        color: '#64748b', 
        textAlign: 'center', 
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }}>
        <Layers size={12} /> 단면도
      </div>

      {levels.map((lvl) => {
        const isActive = selectedLevel === lvl;
        const { plansCount, risksCount } = levelStats[lvl] || { plansCount: 0, risksCount: 0 };
        const isGround = lvl.includes('F');

        return (
          <div
            key={lvl}
            onClick={() => onLevelSelect(lvl)}
            style={{
              flex: 1,
              minHeight: '45px',
              maxHeight: '60px',
              background: isActive ? '#ffffff' : (isGround ? '#ffffff' : '#e2e8f0'),
              border: isActive ? '2px solid #3b82f6' : '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? '0 4px 6px -1px rgba(59, 130, 246, 0.2)' : 'none',
              zIndex: isActive ? 10 : 1
            }}
          >
            <div style={{ 
              fontSize: '0.85rem', 
              fontWeight: '900', 
              color: isActive ? '#2563eb' : '#475569' 
            }}>
              {lvl}
            </div>

            {/* 상태 인디케이터 배지 */}
            <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
              {plansCount > 0 && (
                <div title={`작업 ${plansCount}건`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
              )}
              {risksCount > 0 && (
                <div title={`위험 ${risksCount}건`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
              )}
            </div>

            {/* 사이드 라벨 (작업/위험 수) */}
            {isActive && (plansCount > 0 || risksCount > 0) && (
              <div style={{
                position: 'absolute',
                left: '100%',
                marginLeft: '8px',
                background: '#1e293b',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.6rem',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {plansCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><HardHat size={10} /> {plansCount}</span>}
                {risksCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fca5a5' }}><AlertTriangle size={10} /> {risksCount}</span>}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <div style={{ 
          height: '4px', 
          background: '#94a3b8', 
          borderRadius: '2px', 
          width: '120%', 
          marginLeft: '-10%',
          marginTop: '8px' 
        }} />
        <div style={{ fontSize: '0.5rem', color: '#94a3b8', marginTop: '4px', fontWeight: 'bold' }}>GROUND</div>
      </div>
    </div>
  );
};

export default BuildingSectionView;
