
import React, { useMemo } from 'react';

/**
 * [MANAGER] 현장 건물 단면(층별) 뷰 컴포넌트
 */
const BuildingSectionView = ({ project, allZones, activeLevel, onLevelChange }) => {
  
  const levels = useMemo(() => {
    if (project) {
      const res = [];
      const ground = parseInt(project.floors_above || 1);
      for (let i = ground; i >= 1; i--) res.push(`${i}F`);
      const basement = parseInt(project.floors_below || 0);
      for (let i = 1; i <= basement; i++) res.push(`B${i}`);
      return res;
    }
    return ['1F'];
  }, [project]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Level Selection
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {levels.map(lv => {
          const isActive = activeLevel === lv;
          const zoneCount = allZones.filter(z => z.level === lv).length;
          
          return (
            <button
              key={lv}
              onClick={() => onLevelChange(lv)}
              style={{
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isActive ? '#3b82f6' : '#f1f5f9',
                background: isActive ? '#eff6ff' : 'white',
                color: isActive ? '#3b82f6' : '#475569',
                fontWeight: '800',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#3b82f6' : '#e2e8f0' }} />
                {lv}
              </div>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '4px 8px', 
                background: isActive ? '#3b82f6' : '#f8fafc',
                color: isActive ? 'white' : '#94a3b8',
                borderRadius: '8px',
                fontWeight: '700'
              }}>
                {zoneCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BuildingSectionView;
