import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, SVGOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * 전역 상수 및 스타일
 * 그리드 크기에 맞춰 정사각형 크기를 조정합니다. (기존 0.00012 -> 0.000025로 축소하여 약 5m 그리드에 대응)
 */
const ZONE_SQUARE_HALF = 0.000025;
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
      <MapContainer center={mapCenter} zoom={zoom} maxZoom={22} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer 
          attribution='&copy; OpenStreetMap' 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          opacity={0.15} 
          maxZoom={22}
          maxNativeZoom={19}
        />
        
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
          
          // 위험 구역 상태 확인 (PENDING: 주황, APPROVED: 빨강)
          const dangerStatus = zoneRisks.length > 0 ? zoneRisks[0].status : null;
          const isPending = dangerStatus === 'PENDING';
          const isApproved = dangerStatus === 'APPROVED' || (!dangerStatus && hasDanger);

          // 역할별 스타일
          let pathOptions = { fillColor: '#ffffff', fillOpacity: 0.15, color: 'rgba(0,0,0,0.15)', weight: 1 };

          if (role === 'WORKER') {
            if (isOverlap) {
                pathOptions = { fillColor: '#3b82f6', fillOpacity: 0.7, color: '#ef4444', weight: 3 };
            } else if (hasWork) {
                pathOptions = { fillColor: '#3b82f6', fillOpacity: 0.7, color: 'rgba(0,0,0,0.3)', weight: 1.5 };
            } else if (isPending) {
                // PENDING: 주황색 테두리 (신고 대기 중)
                pathOptions = { fillColor: 'transparent', fillOpacity: 0, color: '#f97316', weight: 3.5 };
            } else if (isApproved) {
                // APPROVED: 빨간색 테두리 (승인됨)
                pathOptions = { fillColor: 'transparent', fillOpacity: 0, color: '#dc2626', weight: 3 };
            }
          } else {
            const workColor = zonePlans.length > 0 ? WORK_TYPE_COLORS[plans.indexOf(zonePlans[0]) % WORK_TYPE_COLORS.length] : '#3b82f6';
            if (isOverlap) {
                pathOptions = { fillColor: workColor, fillOpacity: 0.7, color: '#ef4444', weight: 4 };
            } else if (hasWork) {
                pathOptions = { fillColor: workColor, fillOpacity: 0.65, color: 'rgba(0,0,0,0.3)', weight: 1.5 };
            } else if (isPending) {
                // PENDING: 주황색 테두리
                pathOptions = { fillColor: 'transparent', fillOpacity: 0, color: '#f97316', weight: 3.5 };
            } else if (isApproved) {
                // APPROVED: 빨간색 테두리
                pathOptions = { fillColor: 'transparent', fillOpacity: 0, color: '#dc2626', weight: 3 };
            }
          }

          // 역할별 레이블 (통일된 깔끔한 UI)
          let labelContent = null;
          if (showLabels) {
            labelContent = (
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px',
                pointerEvents: 'none', zIndex: 1000,
                textShadow: '0 0 2px white, 0 0 2px white, 0 0 2px white'
              }}>
                {/* 구역 번호 */}
                <div style={{ 
                  color: isOverlap ? '#ef4444' : hasWork ? (role === 'WORKER' ? '#3b82f6' : pathOptions.fillColor) : (hasDanger ? '#ef4444' : '#64748b'),
                  fontSize: '0.7rem', fontWeight: '900', marginBottom: '-2px'
                }}>
                  {zone.id}
                </div>
                {/* 구역 이름 */}
                <div style={{ fontSize: '0.55rem', fontWeight: '800', color: '#1e293b', opacity: 0.9 }}>
                  {zone.name}
                </div>
                
                {/* 배지 영역 */}
                <div style={{ display: 'flex', gap: '2px', marginTop: '1px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {/* 위험구역 배지 (Worker/Manager 공통) */}
                  {hasDanger && (
                    <span style={{ fontSize: '0.45rem', color: '#dc2626', fontWeight: '900', background: 'rgba(255,255,255,0.85)', padding: '1px 4px', borderRadius: '3px', border: '1px solid #dc2626' }}>⚠️위험</span>
                  )}
                  
                  {/* 작업 배지 */}
                  {role === 'WORKER' && hasWork && (
                    <span style={{ fontSize: '0.45rem', color: '#3b82f6', fontWeight: '900', background: 'rgba(255,255,255,0.85)', padding: '1px 4px', borderRadius: '3px', border: '1px solid #3b82f6' }}>내 작업</span>
                  )}
                  
                  {/* 회사명 배지 (Manager만) */}
                  {role === 'MANAGER' && hasWork && (
                    <>
                      {[...new Set(zonePlans.flatMap(p => p.allocations || []).map(a => a.company_name?.slice(0,3)))].map((comp, idx) => (
                        <span key={idx} style={{ fontSize: '0.42rem', color: '#2563eb', fontWeight: '900', background: 'rgba(255,255,255,0.85)', padding: '1px 3px', borderRadius: '2px', border: '1px solid #3b82f6' }}>{comp}</span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
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
