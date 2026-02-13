
import React, { useMemo } from 'react';

/**
 * [MANAGER] 현장 건물 단면(층별) 뷰 컴포넌트 - 다크 테마
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
              className={`dark-level-button ${isActive ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={`dark-level-indicator ${isActive ? 'active' : ''}`} />
                {lv}
              </div>
              <span className={`dark-level-count ${isActive ? 'active' : ''}`}>
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
