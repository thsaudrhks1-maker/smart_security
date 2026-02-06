import React, { useState } from 'react';
// Force Rebuild - Grid System Fix
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';

// Leaflet 기본 마커 아이콘 설정 (필수)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 리버스 지오코드 (좌표 → 주소, Nominatim)
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`,
      { headers: { 'Accept-Language': 'ko' } }
    );
    const data = await res.json();
    return data?.display_name || null;
  } catch {
    return null;
  }
}

// 지도 클릭 이벤트를 듣는 컴포넌트 (클릭 시 지오코드로 주소까지 콜백)
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      if (onLocationSelect) {
        onLocationSelect(lat, lng, null);
        reverseGeocode(lat, lng).then((address) => {
          if (address) onLocationSelect(lat, lng, address);
        });
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const LocationPicker = ({ onLocationSelect, initialLat, initialLng, gridConfig }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState([
    initialLat || 37.5665, // 기본값: 서울 시청
    initialLng || 126.978,
  ]);
  const [selectedCoords, setSelectedCoords] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  // 미터(m) 단위를 각도(degree)로 변환하여 격자를 생성
  const getDetailedGrid = () => {
    if (!selectedCoords || !gridConfig || !gridConfig.grid_rows || !gridConfig.grid_cols) return { boundary: null, lines: [] };
    
    const [centerLat, centerLng] = selectedCoords;
    const { grid_rows, grid_cols, grid_spacing } = gridConfig;
    
    const latM = 1 / 111320; 
    const lngM = 1 / (111320 * Math.cos(centerLat * Math.PI / 180));
    
    const totalHeight = (grid_rows * grid_spacing * latM);
    const totalWidth = (grid_cols * grid_spacing * lngM);
    
    const bottom = centerLat - totalHeight / 2;
    const top = centerLat + totalHeight / 2;
    const left = centerLng - totalWidth / 2;
    const right = centerLng + totalWidth / 2;

    const boundary = [
      [bottom, left],
      [bottom, right],
      [top, right],
      [top, left],
    ];

    const lines = [];
    // 세로선 (Vertical)
    for (let i = 0; i <= grid_cols; i++) {
      const lng = left + (i * grid_spacing * lngM);
      lines.push([[bottom, lng], [top, lng]]);
    }
    // 가로선 (Horizontal)
    for (let i = 0; i <= grid_rows; i++) {
      const lat = bottom + (i * grid_spacing * latM);
      lines.push([[lat, left], [lat, right]]);
    }

    return { boundary, lines };
  };

  const { boundary, lines } = getDetailedGrid();

  // 위치 선택 핸들러 (주소 함께 전달: 지도 클릭 또는 지오코드 결과)
  const handleLocationSelect = (lat, lng, address = null) => {
    setSelectedCoords([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng, address);
    }
  };

  // 주소 검색 (Nominatim API 사용 - 무료, 검색 결과 주소를 그대로 부모에 전달)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=kr&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setCenter(newCenter);
        setSelectedCoords(newCenter);
        if (onLocationSelect) {
          onLocationSelect(parseFloat(lat), parseFloat(lon), display_name || null);
        }
      } else {
        alert('주소를 찾을 수 없습니다. 더 구체적으로 입력해주세요.');
      }
    } catch (error) {
      console.error('주소 검색 실패:', error);
      alert('주소 검색 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="location-picker">
      <div className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e);
            }
          }}
          placeholder="주소를 검색하거나 지도를 클릭하세요 (예: 서울시 강남구 테헤란로)"
          className="search-input"
        />
        <button type="button" className="search-btn" onClick={handleSearch}>
          위치 검색
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.30}
        />
        <LocationMarker onLocationSelect={handleLocationSelect} />
        {selectedCoords && <Marker position={selectedCoords} />}
        
        {/* 그리드 렌더링 (상세 격자) */}
        {boundary && (
          <>
            <Polygon 
              positions={boundary}
              pathOptions={{ 
                color: '#2563eb', 
                weight: 5, 
                fillColor: '#3b82f6', 
                fillOpacity: 0.12,
              }}
            />
            {lines.map((pos, idx) => (
              <Polyline 
                key={idx}
                positions={pos}
                pathOptions={{ 
                  color: '#3b82f6', 
                  weight: 4, 
                  opacity: 0.7,
                  dashArray: '6, 10'
                }}
              />
            ))}
          </>
        )}
      </MapContainer>

      {selectedCoords && (
        <div className="selected-address">
          <strong>현장 선택된 좌표:</strong>
          <br />
          위도: {selectedCoords[0].toFixed(6)}, 경도: {selectedCoords[1].toFixed(6)}
          {gridConfig && (
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#eff6ff', padding: '8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              현장 예상 크기: <b>{(gridConfig.grid_cols * gridConfig.grid_spacing).toFixed(0)}m</b> x <b>{(gridConfig.grid_rows * gridConfig.grid_spacing).toFixed(0)}m</b>
              <br/>
              타일 개수: <b>{gridConfig.grid_rows * gridConfig.grid_cols}</b>개
            </div>
          )}
        </div>
      )}

      <div className="map-hint">
        팁 힌트: 지도를 클릭하거나 주소를 검색하여 위치를 선택하세요
      </div>
    </div>
  );
};

export default LocationPicker;
