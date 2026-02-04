import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ZONE_SQUARE_HALF = 0.00012;

function getZoneSquarePositions(lat, lng, halfDeg = ZONE_SQUARE_HALF) {
  const h = halfDeg;
  return [
    [lat - h, lng - h],
    [lat - h, lng + h],
    [lat + h, lng + h],
    [lat + h, lng - h],
  ];
}

/**
 * 근로자 홈용 나의 작업 현장 지도.
 * allZones 중 lat/lng 있는 구역을 그리드로 표시하고,
 * myPlans에 포함된 구역 = 내 작업(파랑), myRisks에 포함된 구역 = 위험(빨강), 겹치면 테두리 빨강.
 */
const WorkerWorkSiteMap = ({ plans = [], risks = [], allZones = [], height = 240, showLegend = true }) => {
  const zonesWithCoords = useMemo(
    () => allZones.filter((z) => z.lat != null && z.lng != null),
    [allZones]
  );

  const planZoneIds = useMemo(() => new Set((plans || []).map((p) => p.zone_id)), [plans]);
  const riskZoneIds = useMemo(() => new Set((risks || []).map((r) => r.zone_id)), [risks]);

  const mapCenter = useMemo(() => {
    if (zonesWithCoords.length === 0) return [37.5665, 126.978];
    const first = zonesWithCoords[0];
    return [Number(first.lat), Number(first.lng)];
  }, [zonesWithCoords]);

  if (zonesWithCoords.length === 0) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px', color: '#64748b', fontSize: '0.9rem' }}>
        표시할 구역이 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div style={{ height: `${height}px`, borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          center={mapCenter}
          zoom={16}
          maxZoom={19}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={0.20}
          />
          {zonesWithCoords.map((zone) => {
            const hasWork = planZoneIds.has(zone.id);
            const hasDanger = riskZoneIds.has(zone.id);
            const isOverlap = hasWork && hasDanger;
            const pathOptions = isOverlap
              ? { fillColor: '#3b82f6', fillOpacity: 0.75, color: '#dc2626', weight: 4 }
              : hasWork
                ? { fillColor: '#3b82f6', fillOpacity: 0.75, color: 'rgba(0,0,0,0.4)', weight: 2 }
                : hasDanger
                  ? { fillColor: '#dc2626', fillOpacity: 0.7, color: 'rgba(0,0,0,0.4)', weight: 2 }
                  : { fillColor: '#ffffff', fillOpacity: 0.5, color: 'rgba(0,0,0,0.35)', weight: 1.5 };

            const positions = getZoneSquarePositions(Number(zone.lat), Number(zone.lng));
            const popupText = [
              `[${zone.level || ''}] ${zone.name}`,
              isOverlap && '⚠️ 내 작업 + 위험',
              hasWork && !isOverlap && '내 작업 구역',
              hasDanger && !isOverlap && '위험 구역',
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <Polygon key={zone.id} positions={positions} pathOptions={pathOptions}>
                <Popup>{popupText}</Popup>
              </Polygon>
            );
          })}
        </MapContainer>
      </div>
      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px', marginTop: '8px', fontSize: '0.8rem', color: '#475569' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#3b82f6' }} />
            내 작업 구역
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#dc2626' }} />
            위험 구역
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#3b82f6', border: '2px solid #dc2626', boxSizing: 'border-box' }} />
            내 작업 + 위험
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#fff', border: '1px solid #94a3b8' }} />
            그 외 구역
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkerWorkSiteMap;
