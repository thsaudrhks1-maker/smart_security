
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
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
 * [COMMON] 통합 지도 컴포넌트
 * @param {Array} center [lat, lng]
 * @param {Number} zoom 기본 13
 * @param {Array} markers [{lat, lng, title, popup}]
 * @param {Function} onMapClick (latlng) => {}
 * @param {Object} style 커스텀 스타일
 */
const CommonMap = ({ 
  center = [37.5665, 126.9780], // 서울 중심 기본값
  zoom = 13, 
  markers = [], 
  onMapClick,
  style = { height: '100%', width: '100%', borderRadius: '16px' }
}) => {
  return (
    <div style={{ ...style, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* 기본 지도 타일 (Vworld 혹은 OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 클릭 이벤트 처리 */}
        <MapEvents onClick={onMapClick} />

        {/* 마커 표시 */}
        {markers.map((m, idx) => (
          <Marker key={idx} position={[m.lat, m.lng]}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CommonMap;
