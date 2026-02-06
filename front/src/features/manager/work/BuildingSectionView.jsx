
import React, { useMemo } from 'react';

/**
 * [MANAGER] 현장 건물 단면(층별) 뷰 컴포넌트
 * 프로젝트의 지상/지하 층 정보를 기반으로 층 선택 탭을 생성하고
 * 선택된 층의 구역 현황을 시각화할 수 있도록 돕습니다.
 */
const BuildingSectionView = ({ project, allZones, selectedLevel, onLevelChange }) => {
  
  // 층수 리스트 생성 (지상층 내림차순 -> 지하층 오름차순)
  const levels = useMemo(() => {
    if (project) {
      const res = [];
      // 지상층 (예: 3F, 2F, 1F)
      const ground = parseInt(project.floors_above || 1);
      for (let i = ground; i >= 1; i--) {
        res.push(`${i}F`);
      }
      // 지하층 (예: B1, B2)
      const basement = parseInt(project.floors_below || 0);
      for (let i = 1; i <= basement; i++) {
        res.push(`B${i}`);
      }
      return res;
    }

    // 프로젝트 정보가 없는 경우 구역 데이터에서 직접 추출
    if (allZones && allZones.length > 0) {
      const uniqueLevels = [...new Set(allZones.map(z => z.level).filter(Boolean))];
      return uniqueLevels.sort((a, b) => {
        const aIsGround = a.includes('F');
        const bIsGround = b.includes('F');
        if (aIsGround && bIsGround) return parseInt(b) - parseInt(a);
        if (!aIsGround && !bIsGround) return parseInt(a.replace('B', '')) - parseInt(b.replace('B', ''));
        return aIsGround ? -1 : 1; // 지상층 우선
      });
    }

    return ['1F'];
  }, [project, allZones]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', marginBottom: '5px' }}>
        🏢 층별 단면 필터
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', 
        maxHeight: '400px', 
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        <button
          onClick={() => onLevelChange('ALL')}
          style={{
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: selectedLevel === 'ALL' ? '#3b82f6' : '#e2e8f0',
            background: selectedLevel === 'ALL' ? '#eff6ff' : 'white',
            color: selectedLevel === 'ALL' ? '#3b82f6' : '#64748b',
            fontWeight: '800',
            fontSize: '0.85rem',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}
        >
          전체 (ALL)
        </button>
        {levels.map(lv => (
          <button
            key={lv}
            onClick={() => onLevelChange(lv)}
            style={{
              padding: '12px 10px',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: selectedLevel === lv ? '#3b82f6' : '#e2e8f0',
              background: selectedLevel === lv ? '#3b82f6' : 'white',
              color: selectedLevel === lv ? 'white' : '#475569',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
          >
            <span>{lv}</span>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '2px 6px', 
              background: selectedLevel === lv ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              borderRadius: '6px'
            }}>
              {allZones.filter(z => z.level === lv).length} 구역
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BuildingSectionView;
