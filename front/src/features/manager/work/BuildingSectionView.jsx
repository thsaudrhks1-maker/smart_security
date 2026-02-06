import React from 'react';
import { Layers, AlertTriangle, HardHat } from 'lucide-react';

/**
 * [Ïª¥Ìè¨?åÌä∏] BuildingSectionView
 * Í±¥Î¨º ?®Î©¥???ïÌÉúÎ°?Ï∏µÎ≥Ñ ?ÅÌÉúÎ•??úÍ∞Å?îÌïòÍ≥??†ÌÉù?????àÎäî ?¨Ïù¥?úÎ∞î
 */
const BuildingSectionView = ({ 
  project, 
  selectedLevel, 
  onLevelSelect,
  allZones = [],
  allPlans = [],
  allRisks = [],
  compact = false  // Í∑ºÎ°ú???±Ïö© Ïª¥Ìå©??Î™®Îìú
}) => {
  // Ï∏?Î¶¨Ïä§???ùÏÑ± (B2, B1, 1F, 2F...)
  const levels = React.useMemo(() => {
    if (project && project.ground_floors !== undefined && project.basement_floors !== undefined) {
      const res = [];
      // ÏßÄ?ÅÏ∏µ (??àú?ºÎ°ú ?ìÏïÑ???ÑÏóê???ÑÎûòÎ°?Î≥¥ÏûÑ)
      for (let i = project.ground_floors; i >= 1; i--) {
        res.push(`${i}F`);
      }
      // ÏßÄ?òÏ∏µ
      for (let i = 1; i <= project.basement_floors; i++) {
        res.push(`B${i}`);
      }
      return res;
    }
    
    // project ?ïÎ≥¥Í∞Ä ?ÜÏúºÎ©?zones?êÏÑú Í≥†Ïú†??level Ï∂îÏ∂ú
    if (allZones && allZones.length > 0) {
      const uniqueLevels = [...new Set(allZones.map(z => z.level).filter(Boolean))];
      // ?ïÎ†¨: ?´ÏûêF (?¥Î¶ºÏ∞®Ïàú), B?´Ïûê (?§Î¶ÑÏ∞®Ïàú)
      return uniqueLevels.sort((a, b) => {
        const aIsGround = a.includes('F');
        const bIsGround = b.includes('F');
        if (aIsGround && bIsGround) {
          return parseInt(b) - parseInt(a); // 2F, 1F
        }
        if (!aIsGround && !bIsGround) {
          return parseInt(a.replace('B', '')) - parseInt(b.replace('B', '')); // B1, B2
        }
        return aIsGround ? -1 : 1; // ÏßÄ?ÅÏ∏µ???ÑÏóê
      });
    }
    
    return ['1F'];
  }, [project, allZones]);

  // Ï∏µÎ≥Ñ ?µÍ≥Ñ Í≥ÑÏÇ∞
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

  // Ïª¥Ìå©??Î™®Îìú ?§Ì???(Í∑ºÎ°ú???±Ïö©)
  const containerStyle = compact ? {
    width: '70px',
    padding: '6px',
    gap: '3px',
    borderRadius: '8px',
    maxHeight: '280px'
  } : {
    width: '100px',
    padding: '8px',
    gap: '4px',
    borderRadius: '12px',
    maxHeight: '100%'
  };

  const headerStyle = compact ? {
    fontSize: '0.55rem',
    marginBottom: '3px',
    gap: '3px'
  } : {
    fontSize: '0.65rem',
    marginBottom: '4px',
    gap: '4px'
  };

  const levelStyle = (isActive) => compact ? {
    minHeight: '40px',
    height: '40px',
    borderRadius: '4px',
    fontSize: '0.75rem'
  } : {
    flex: 1,
    minHeight: '45px',
    maxHeight: '60px',
    borderRadius: '6px',
    fontSize: '0.85rem'
  };

  const badgeSize = compact ? '5px' : '6px';
  const iconSize = compact ? 10 : 12;

  return (
    <div style={{ 
      ...containerStyle,
      flexShrink: 0,
      display: 'flex', 
      flexDirection: 'column',
      background: '#f1f5f9',
      border: '1px solid #e2e8f0',
      overflowY: 'auto'
    }}>
      <div style={{ 
        ...headerStyle,
        fontWeight: '800', 
        color: '#64748b', 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Layers size={iconSize} /> {compact ? 'Ï∏? : '?®Î©¥??}
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
              ...levelStyle(isActive),
              background: isActive ? '#ffffff' : (isGround ? '#ffffff' : '#e2e8f0'),
              border: isActive ? '2px solid #3b82f6' : '1px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? (compact ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.2)') : 'none',
              zIndex: isActive ? 10 : 1,
              flexShrink: 0
            }}
          >
            <div style={{ 
              fontSize: levelStyle(isActive).fontSize,
              fontWeight: '900', 
              color: isActive ? '#2563eb' : '#475569' 
            }}>
              {lvl}
            </div>

            {/* ?ÅÌÉú ?∏ÎîîÏºÄ?¥ÌÑ∞ Î∞∞Ï? */}
            <div style={{ display: 'flex', gap: compact ? '2px' : '3px', marginTop: compact ? '1px' : '2px' }}>
              {plansCount > 0 && (
                <div title={`?ëÏóÖ ${plansCount}Í±?} style={{ width: badgeSize, height: badgeSize, borderRadius: '50%', background: '#3b82f6' }} />
              )}
              {risksCount > 0 && (
                <div title={`?ÑÌóò ${risksCount}Í±?} style={{ width: badgeSize, height: badgeSize, borderRadius: '50%', background: '#ef4444' }} />
              )}
            </div>

            {/* ?¨Ïù¥???ºÎ≤® (?ëÏóÖ/?ÑÌóò ?? - Í¥ÄÎ¶¨Ïûê Î™®Îìú?êÎßå ?úÏãú */}
            {!compact && isActive && (plansCount > 0 || risksCount > 0) && (
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

      <div style={{ marginTop: compact ? '6px' : 'auto', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ 
          height: compact ? '3px' : '4px',
          background: '#94a3b8', 
          borderRadius: '2px', 
          width: compact ? '100%' : '120%',
          marginLeft: compact ? '0' : '-10%',
          marginTop: compact ? '0' : '8px'
        }} />
        <div style={{ fontSize: compact ? '0.45rem' : '0.5rem', color: '#94a3b8', marginTop: compact ? '3px' : '4px', fontWeight: 'bold' }}>
          {compact ? 'ÏßÄÎ©? : 'GROUND'}
        </div>
      </div>
    </div>
  );
};

export default BuildingSectionView;
