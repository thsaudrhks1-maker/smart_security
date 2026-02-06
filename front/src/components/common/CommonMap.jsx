
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polygon, Polyline, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 아이콘 이슈 해결 (Vite 환경)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

/**
 * 지도 표시 시 특정 위치로 뷰 이동을 처리하는 내부 컴포넌트
 */
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

/**
 * 클릭 이벤트를 처리하는 내부 컴포넌트
 */
const MapEvents = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) onClick(e.latlng);
    },
  });
  return null;
};

/**
 * [COMMON] 통합 지도 컴포넌트 (Grid 시각화 지원)
 * @param {Array} center [lat, lng]
 * @param {Number} zoom 기본 13
 * @param {Array} markers [{lat, lng, title, popup}]
 * @param {Function} onMapClick (latlng) => {}
 * @param {Object} gridConfig { rows, cols, spacing } - 격자 설정
 * @param {Object} style 커스텀 스타일
 */
const CommonMap = ({ 
  center = [37.5665, 126.9780], 
  zoom = 13, 
  markers = [], 
  onMapClick,
  gridConfig = null,
  style = { height: '100%', width: '100%', borderRadius: '16px' }
}) => {

  // 격자 데이터 계산 (LocationPicker와 동일 로직)
  const getGridData = () => {
    if (!gridConfig || !gridConfig.grid_rows || !gridConfig.grid_cols || !gridConfig.grid_spacing) {
      return { boundary: null, lines: [] };
    }
    
    // 데이터 타입 보정
    const rows = parseInt(gridConfig.grid_rows);
    const cols = parseInt(gridConfig.grid_cols);
    const spacing = parseFloat(gridConfig.grid_spacing);
    const [cLat, cLng] = center;

    const latM = 1 / 111320; 
    const lngM = 1 / (111320 * Math.cos(cLat * Math.PI / 180));
    
    const totalHeight = (rows * spacing * latM);
    const totalWidth = (cols * spacing * lngM);
    
    const bottom = cLat - totalHeight / 2;
    const top = cLat + totalHeight / 2;
    const left = cLng - totalWidth / 2;
    const right = cLng + totalWidth / 2;

    const boundary = [
      [bottom, left],
      [bottom, right],
      [top, right],
      [top, left],
    ];

    const lines = [];
    for (let i = 0; i <= cols; i++) {
      const lng = left + (i * spacing * lngM);
      lines.push([[bottom, lng], [top, lng]]);
    }
    for (let i = 0; i <= rows; i++) {
      const lat = bottom + (i * spacing * latM);
      lines.push([[lat, left], [lat, right]]);
    }

    return { boundary, lines };
  };

  const { boundary, lines } = getGridData();

  return (
    <div style={{ ...style, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.8}
        />

        <MapEvents onClick={onMapClick} />

        {/* Grid Visualization - Each Cell as Rectangle */}
        {gridConfig && boundary && (() => {
          const { grid_rows, grid_cols, grid_spacing } = gridConfig;
          const rows = parseInt(grid_rows);
          const cols = parseInt(grid_cols);
          const spacing = parseFloat(grid_spacing);
          
          const latStep = 1 / 111320 * spacing;
          const lngStep = 1 / (111320 * Math.cos(center[0] * Math.PI / 180)) * spacing;
          
          const startLat = center[0] + (latStep * rows) / 2;
          const startLng = center[1] - (lngStep * cols) / 2;
          const chr = (n) => String.fromCharCode(n);

          const cells = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const b = [
                [startLat - r * latStep, startLng + c * lngStep],
                [startLat - (r + 1) * latStep, startLng + (c + 1) * lngStep]
              ];
              cells.push(
                <Rectangle 
                  key={`cell-${r}-${c}`} 
                  bounds={b} 
                  pathOptions={{ color: '#3b82f6', weight: 1, fillOpacity: 0.03, dashArray: '5, 10' }}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#3b82f6', fontWeight: '900', fontSize: '1.2rem' }}>{chr(65+r)}{c+1}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>현장 구역 (Zone)</div>
                    </div>
                  </Popup>
                </Rectangle>
              );
            }
          }
          return cells;
        })()}

        {/* Markers */}
        {markers.map((m, idx) => (
          <Marker key={idx} position={[m.lat, m.lng]}>
            {(m.title || m.popup) && (
              <Popup>
                <div style={{ fontWeight: '700' }}>{m.title}</div>
                {m.popup && <div>{m.popup}</div>}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CommonMap;
