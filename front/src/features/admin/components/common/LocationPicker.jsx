import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';

// Leaflet 기본 마커 아이콘 수정 (필수)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 지도 클릭 이벤트 핸들러 컴포넌트
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const LocationPicker = ({ onLocationSelect, initialLat, initialLng }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState([
    initialLat || 37.5665, // 기본값: 서울 시청
    initialLng || 126.978,
  ]);
  const [selectedCoords, setSelectedCoords] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  // 위치 선택 핸들러
  const handleLocationSelect = (lat, lng) => {
    setSelectedCoords([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  // 주소 검색 (Nominatim API 사용 - 무료)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    try {
      // OpenStreetMap Nominatim API (무료)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=kr&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setCenter(newCenter);
        setSelectedCoords(newCenter);
        if (onLocationSelect) {
          onLocationSelect(parseFloat(lat), parseFloat(lon));
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
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="주소를 검색하거나 지도를 클릭하세요 (예: 서울시 강남구 역삼동)"
          className="search-input"
        />
        <button type="submit" className="search-btn">
          🔍 검색
        </button>
      </form>

      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={handleLocationSelect} />
        {selectedCoords && <Marker position={selectedCoords} />}
      </MapContainer>

      {selectedCoords && (
        <div className="selected-address">
          <strong>📍 선택된 좌표:</strong>
          <br />
          위도: {selectedCoords[0].toFixed(6)}, 경도: {selectedCoords[1].toFixed(6)}
        </div>
      )}

      <div className="map-hint">
        💡 힌트: 지도를 클릭하거나 주소를 검색하여 위치를 선택하세요
      </div>
    </div>
  );
};

export default LocationPicker;
