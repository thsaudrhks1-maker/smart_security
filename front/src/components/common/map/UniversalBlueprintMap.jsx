import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, SVGOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * 전역 상수 및 스타일
 */
const ZONE_SQUARE_HALF = 0.00012;
const WORK_TYPE_COLORS = ['#2563eb', '#15803d', '#d97706', '#6d28d9', '#be185d', '#0d9488', '#ea580c', '#4f46e5'];

const globalMapStyles = `
  .blueprint-tooltip {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  .blueprint-tooltip::before {
    display: none !important;
  }
  .leaflet-container {
    background: #f8fafc !important;
  }
`;

/**
 * 좌표를 정사각형 폴리곤 포인트로 변환
 */
export function getZoneSquarePositions(lat, lng, halfDeg = ZONE_SQUARE_HALF) {
  const h = halfDeg;
  return [
    [lat - h, lng - h],
    [lat - h, lng + h],
    [lat + h, lng + h],
    [lat + h, lng - h],
  ];
}

/**
 * [공통 컴포넌트] UniversalBlueprintMap
 * 관리자, 매니저, 근로자가 공유하는 통합 평면도 지도 모듈
 */
const UniversalBlueprintMap = ({
  role = 'MANAGER', // MANAGER | WORKER | ADMIN
  zones = [],
  plans = [],       
  risks = [],       
  center,
  zoom = 17,
  height = '420px',
  onZoneClick,
  showLabels = true,
  blueprintUrl = null,
  blueprintConfig = null, // { lat, lng, width, height, rotation }
  children
}) => {
  
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (blueprintConfig?.lat) return [blueprintConfig.lat, blueprintConfig.lng];
    if (zones.length > 0 && zones[0].lat) return [Number(zones[0].lat), Number(zones[0].lng)];
    return [37.5665, 126.9780]; 
  }, [center, zones, blueprintConfig]);

  // 구역별 데이터 맵핑
  const zoneDataMap = useMemo(() => {
    const map = {};
    zones.forEach(z => {
      const zonePlans = plans.filter(p => p.zone_id === z.id);
      const zoneRisks = risks.filter(r => r.zone_id === z.id);
      map[z.id] = { zonePlans, zoneRisks };
    });
    return map;
  }, [zones, plans, risks]);

  // 도면 Bounds 계산
  const svgBounds = useMemo(() => {
    if (!blueprintConfig) return null;
    const { lat, lng, width, height } = blueprintConfig;
    return [
        [lat - height/2, lng - width/2],
        [lat + height/2, lng + width/2]
    ];
  }, [blueprintConfig]);

  return (
    <div style={{ height, width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      <style>{globalMapStyles}</style>
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.15} />
        
        {/* 도면 오버레이 */}
        {blueprintUrl && svgBounds && (
            <SVGOverlay attributes={{ viewBox: "0 0 100 100", preserveAspectRatio: "none" }} bounds={svgBounds}>
                <image 
                    href={blueprintUrl} 
                    x="0" y="0" width="100%" height="100%" 
                    style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${blueprintConfig.rotation || 0}deg)` }}
                    opacity={0.8}
                />
            </SVGOverlay>
        )}

        {zones.map(zone => {
          const { zonePlans, zoneRisks } = zoneDataMap[zone.id] || { zonePlans: [], zoneRisks: [] };
          const hasWork = zonePlans.length > 0;
          const hasDanger = zoneRisks.length > 0;
          const isOverlap = hasWork && hasDanger;

          // 역할별 스타일
          let pathOptions = { fillColor: '#ffffff', fillOpacity: 0.15, color: 'rgba(0,0,0,0.15)', weight: 1 };

          if (role === 'WORKER') {
            if (isOverlap) pathOptions = { fillColor: '#3b82f6', fillOpacity: 0.7, color: '#ef4444', weight: 3 };
            else if (hasWork) pathOptions = { fillColor: '#3b82f6', fillOpacity: 0.7, color: 'rgba(0,0,0,0.3)', weight: 1.5 };
            else if (hasDanger) pathOptions = { fillColor: 'transparent', fillOpacity: 0, color: '#dc2626', weight: 3 };
          } else {
            if (isOverlap) {
                const baseColor = hasWork ? WORK_TYPE_COLORS[plans.indexOf(zonePlans[0]) % WORK_TYPE_COLORS.length] : '#3b82f6';
                pathOptions = { fillColor: baseColor, fillOpacity: 0.7, color: '#ef4444', weight: 4 };
            } else if (hasWork) {
                const workColor = WORK_TYPE_COLORS[plans.indexOf(zonePlans[0]) % WORK_TYPE_COLORS.length] || '#3b82f6';
                pathOptions = { fillColor: workColor, fillOpacity: 0.65, color: 'rgba(0,0,0,0.3)', weight: 1.5 };
            } else if (hasDanger) {
                pathOptions = { fillColor: 'transparent', fillOpacity: 0, color: '#dc2626', weight: 3 };
            }
          }

          // 역할별 레이블
          let labelContent = null;
          if (showLabels) {
            const shouldShowWorkerLabel = role === 'WORKER' ? (hasWork || hasDanger) : true;
            
            if (shouldShowWorkerLabel) {
              labelContent = (
                <div style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px',
                  pointerEvents: 'none', zIndex: 1000,
                  textShadow: '0 0 2px white, 0 0 2px white, 0 0 2px white'
                }}>
                  <div style={{ 
                    color: isOverlap ? '#ef4444' : hasWork ? (role === 'WORKER' ? '#3b82f6' : pathOptions.fillColor) : (hasDanger ? '#ef4444' : '#64748b'),
                    fontSize: '0.7rem', fontWeight: '900', marginBottom: '-2px'
                  }}>
                    {zone.id}
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: '800', color: '#1e293b', opacity: 0.9 }}>
                    {zone.name}
                  </div>
                  
                  {role === 'MANAGER' && hasWork && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: 'center', marginTop: '1px' }}>
                      {[...new Set(zonePlans.flatMap(p => p.allocations || []).map(a => a.company_name?.slice(0,3)))].map((comp, idx) => (
                        <span key={idx} style={{ fontSize: '0.42rem', color: '#2563eb', fontWeight: '900', background: 'rgba(255,255,255,0.7)', padding: '0 2px', borderRadius: '2px' }}>{comp}</span>
                      ))}
                    </div>
                  )}
                  {role === 'WORKER' && hasWork && (
                    <span style={{ fontSize: '0.45rem', color: '#3b82f6', fontWeight: '900', background: 'rgba(255,255,255,0.7)', padding: '0 2px', borderRadius: '2px', marginTop: '1px' }}>내 작업</span>
                  )}
                </div>
              );
            }
          }

          return (
            <Polygon 
              key={zone.id} 
              positions={getZoneSquarePositions(Number(zone.lat), Number(zone.lng))} 
              pathOptions={pathOptions}
              eventHandlers={{
                click: () => onZoneClick && onZoneClick(zone)
              }}
            >
              <Popup>
                <strong>{zone.name}</strong><br/>
                {hasWork && <div>작업: {zonePlans.map(p => p.work_type).join(', ')}</div>}
                {hasDanger && <div style={{ color: 'red' }}>⚠️ 위험 구역</div>}
              </Popup>
              {labelContent && (
                <Tooltip permanent direction="center" className="blueprint-tooltip" opacity={1} offset={[0, 0]}>
                  {labelContent}
                </Tooltip>
              )}
            </Polygon>
          );
        })}

        {children}
      </MapContainer>
    </div>
  );
};

export default UniversalBlueprintMap;
