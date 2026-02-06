
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 아이콘 이슈 해결
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

/** 지도 배경 클릭 시 좌표 콜백 (사이트/격자 중심점 이동용) */
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick && e.latlng) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
};

/**
 * [COMMON] 통합 지도 컴포넌트 (Grid 시각화 및 프로젝트 연동 강화)
 */
const CommonMap = ({ 
  center = [37.5665, 126.9780], 
  zoom = 19, 
  markers = [], 
  onZoneClick,
  onMapClick,
  highlightLevel = '1F',
  plans = [],
  risks = [],
  gridConfig = { rows: 10, cols: 10, spacing: 10 }, // 기본값
  style = { height: '100%', width: '100%' }
}) => {

  const rows = parseInt(gridConfig.rows) || 10;
  const cols = parseInt(gridConfig.cols) || 10;
  const spacing = parseFloat(gridConfig.spacing) || 10;

  const latStep = 1 / 111320 * spacing;
  const lngStep = 1 / (111320 * Math.cos(center[0] * Math.PI / 180)) * spacing;
  
  const startLat = center[0] + (latStep * rows) / 2;
  const startLng = center[1] - (lngStep * cols) / 2;
  const chr = (n) => String.fromCharCode(n);

  return (
    <div style={{ ...style, overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        maxZoom={22}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.5}
          maxZoom={22}
          maxNativeZoom={19}
        />

        {/* 그리드 셀 (Zone) 렌더링 */}
        {(() => {
          const cells = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const zoneName = `${highlightLevel}-${chr(65+r)}${c+1}`;
              
              // 해당 구역의 상태 확인
              const hasPlan = plans.some(p => p.zone_name === zoneName && p.level === highlightLevel);
              const hasRisk = risks.some(r => r.zone_name === zoneName && r.level === highlightLevel);

              // 스타일 결정
              let fillColor = 'transparent';
              let fillOpacity = 0.05;
              let strokeColor = '#cbd5e1';

              if (hasRisk) {
                fillColor = '#ef4444';
                fillOpacity = 0.3;
                strokeColor = '#b91c1c';
              } else if (hasPlan) {
                fillColor = '#3b82f6';
                fillOpacity = 0.2;
                strokeColor = '#2563eb';
              }

              const b = [
                [startLat - r * latStep, startLng + c * lngStep],
                [startLat - (r + 1) * latStep, startLng + (c + 1) * lngStep]
              ];

              cells.push(
                <Rectangle 
                  key={`cell-${zoneName}`} 
                  bounds={b} 
                  eventHandlers={{
                    click: () => onZoneClick && onZoneClick({ name: zoneName, level: highlightLevel }),
                    mouseover: (e) => {
                      e.target.setStyle({ weight: 4, color: '#3b82f6', fillOpacity: 0.5 });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({ weight: 2.5, color: hasRisk ? '#ef4444' : hasPlan ? '#3b82f6' : '#64748b', fillOpacity: fillOpacity });
                    }
                  }}
                  pathOptions={{ 
                    color: hasRisk ? '#ef4444' : hasPlan ? '#3b82f6' : '#64748b', 
                    weight: 2.5, 
                    fillColor: fillColor, 
                    fillOpacity: fillOpacity 
                  }}
                >
                  <Popup>
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ color: hasRisk ? '#ef4444' : '#3b82f6', fontWeight: '900', fontSize: '1.2rem' }}>{zoneName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        {hasRisk ? '⚠️ 위험 요소 감지' : hasPlan ? '🏗️ 작업 예정 구역' : '평시 구역'}
                      </div>
                      {hasPlan && <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#1e293b', fontWeight: '700' }}>[작업 중]</div>}
                    </div>
                  </Popup>
                </Rectangle>
              );
            }
          }
          return cells;
        })()}

        {/* Markers (Optional) */}
        {markers.map((m, idx) => (
          <Marker key={idx} position={[m.lat, m.lng]}>
             <Popup>{m.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CommonMap;
