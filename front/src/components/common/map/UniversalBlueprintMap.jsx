
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * 구역 좌표 보정 도우미
 * 그리드 크기에 맞춰 정사각형 크기를 조정합니다.
 * (기존 0.00012 -> 0.000025로 축소하여 약 5m 그리드에 대응)
 */
const getZoneSquarePositions = (lat, lng) => {
    const offset = 0.000025;
    return [
        [lat - offset, lng - offset],
        [lat - offset, lng + offset],
        [lat + offset, lng + offset],
        [lat + offset, lng - offset],
    ];
};

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
`;

/**
 * [COMMON] 범용 도면 지도 컴포넌트 (Universal Blueprint Map)
 */
const UniversalBlueprintMap = ({ 
  blueprintUrl, 
  blueprintConfig, 
  zones = [], 
  plans = [], 
  risks = [],
  role = 'MANAGER', // MANAGER | WORKER
  height = '600px',
  onZoneClick,
  children 
}) => {
  const mapCenter = useMemo(() => {
    if (blueprintConfig) return [blueprintConfig.lat, blueprintConfig.lng];
    return [37.5665, 126.9780];
  }, [blueprintConfig]);

  const zoom = 19;

  // 구역별 할당 작업 및 위험 요소 매핑
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
            <ImageOverlay url={blueprintUrl} bounds={svgBounds} opacity={0.8} zIndex={10} />
        )}

        {/* 구역 레이어 */}
        {zones.map(zone => {
          const { zonePlans, zoneRisks } = zoneDataMap[zone.id] || { zonePlans: [], zoneRisks: [] };
          const hasWork = zonePlans.length > 0;
          const hasDanger = zoneRisks.length > 0;

          // 구역 색상 결정 (위험 > 작업 > 기본)
          let pathOptions = { color: '#cbd5e1', weight: 1, fillOpacity: 0.1 };
          if (hasWork) pathOptions = { color: '#3b82f6', weight: 2, fillOpacity: 0.25, fillColor: '#3b82f6' };
          if (hasDanger) pathOptions = { color: '#ef4444', weight: 3, fillOpacity: 0.4, fillColor: '#ef4444' };

          // 툴팁 라벨 생성
          let labelContent = null;
          if (hasWork || hasDanger) {
            labelContent = (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                {hasDanger && (
                  <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444', marginBottom: '4px' }}></div>
                )}
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {role === 'WORKER' && hasWork && (
                    <span style={{ fontSize: '0.45rem', color: '#3b82f6', fontWeight: '900', background: 'rgba(255,255,255,0.85)', padding: '1px 4px', borderRadius: '3px', border: '1px solid #3b82f6' }}>내 작업</span>
                  )}

                  {/* 업체명 배지 (Manager 전용) */} 
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
                <div style={{ padding: '5px' }}>
                  <strong style={{ fontSize: '1rem' }}>{zone.name}</strong>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />
                  {hasWork && (
                    <div style={{ marginBottom: '5px' }}>
                      <span style={{ color: '#3b82f6', fontWeight: '800' }}>[작업]</span> {zonePlans.map(p => p.work_type).join(', ')}
                    </div>
                  )}
                  {hasDanger && (
                    <div style={{ color: '#ef4444', fontWeight: '800' }}>
                      ⚠️ 실시간 위험 구역
                    </div>
                  )}
                </div>
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
