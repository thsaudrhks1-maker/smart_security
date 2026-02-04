import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoneSquareStyled } from '../../../manager/work/ZoneSquareLayer';

const DEFAULT_CENTER = [37.566, 126.978];
const DEFAULT_ZOOM = 16;

/**
 * 현장 구역 지도. allZones 있으면 현장 전체 ZONE 표시, 없으면 나의 작업/위험 구역만.
 * - 내 작업만: 파란색
 * - 위험만: 빨간색
 * - 내 작업 + 위험 겹침: 파란 채움 + 굵은 빨간 테두리 (덮지 않고 구분)
 */
export default function WorkerWorkSiteMap({ plans = [], risks = [], allZones = [], height = 240, showLegend = true }) {
  const myZoneIds = useMemo(() => new Set((plans || []).map((p) => p.zone_id)), [plans]);
  const riskZoneIds = useMemo(() => new Set((risks || []).map((r) => r.id)), [risks]);

  const zonesToShow = useMemo(() => {
    if (allZones && allZones.length > 0) {
      return allZones
        .filter((z) => z.lat != null && z.lng != null)
        .map((z) => ({
          id: z.id,
          name: z.name || '',
          lat: z.lat,
          lng: z.lng,
          work_type: (plans || []).find((p) => p.zone_id === z.id)?.work_type,
          isMyWork: myZoneIds.has(z.id),
          hasDanger: riskZoneIds.has(z.id),
        }));
    }
    const byId = new Map();
    (plans || []).forEach((p) => {
      if (p.zone_id == null || (p.zone_lat == null && p.zone_lng == null)) return;
      const key = p.zone_id;
      if (byId.has(key)) return;
      byId.set(key, {
        id: p.zone_id,
        name: p.zone_name || '',
        lat: p.zone_lat,
        lng: p.zone_lng,
        work_type: p.work_type,
        isMyWork: true,
        hasDanger: riskZoneIds.has(p.zone_id),
      });
    });
    risks.forEach((r) => {
      if (r.lat == null || r.lng == null) return;
      if (byId.has(r.id)) {
        byId.get(r.id).hasDanger = true;
        return;
      }
      byId.set(r.id, { id: r.id, name: r.name, lat: r.lat, lng: r.lng, isMyWork: false, hasDanger: true });
    });
    return Array.from(byId.values()).map((z) => ({ ...z, isMyWork: z.isMyWork !== false }));
  }, [plans, risks, allZones, myZoneIds, riskZoneIds]);

  const center = useMemo(() => {
    if (zonesToShow.length === 0) return DEFAULT_CENTER;
    const first = zonesToShow[0];
    return [Number(first.lat) || DEFAULT_CENTER[0], Number(first.lng) || DEFAULT_CENTER[1]];
  }, [zonesToShow]);

  if (zonesToShow.length === 0) {
    return (
      <div style={{ height, background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        금일 배정된 작업 구역이 없습니다.
      </div>
    );
  }

  const getPathOptions = (zone) => {
    const { isMyWork, hasDanger } = zone;
    if (isMyWork && hasDanger) {
      return { fillColor: '#3b82f6', fillOpacity: 0.7, color: '#dc2626', weight: 4 };
    }
    if (hasDanger) return { fillColor: '#dc2626', fillOpacity: 0.75, color: 'rgba(0,0,0,0.5)', weight: 2 };
    if (isMyWork) return { fillColor: '#3b82f6', fillOpacity: 0.7, color: 'rgba(0,0,0,0.4)', weight: 2 };
    return { fillColor: '#ffffff', fillOpacity: 0.55, color: 'rgba(0,0,0,0.35)', weight: 1 };
  };

  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer center={center} zoom={DEFAULT_ZOOM} style={{ height, width: '100%' }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {zonesToShow.map((zone) => {
          const pathOptions = getPathOptions(zone);
          const isBoth = zone.isMyWork && zone.hasDanger;
          const popupContent = (
            <div style={{ minWidth: '160px' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>{zone.name}</strong>
              {zone.work_type && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{zone.work_type}</div>}
              {isBoth && <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', fontWeight: '600' }}>⚠️ 내 작업 구역 + 위험 구역</div>}
              {zone.hasDanger && !isBoth && <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px' }}>⚠️ 위험 구역</div>}
              {zone.isMyWork && !isBoth && <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px' }}>내 작업 구역</div>}
            </div>
          );
          return <ZoneSquareStyled key={`zone-${zone.id}`} zone={zone} pathOptions={pathOptions} popupContent={popupContent} />;
        })}
      </MapContainer>
      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', padding: '8px 12px', background: '#f8fafc', fontSize: '0.8rem', color: '#475569' }}>
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
          {allZones?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#fff', border: '1px solid #94a3b8' }} />
              그 외 구역
            </span>
          )}
        </div>
      )}
    </div>
  );
}
