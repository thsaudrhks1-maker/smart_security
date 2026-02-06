import React, { useState } from 'react';
// Force Rebuild - Grid System Fix
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';

// Leaflet ê¸°ë³¸ ë§ˆì»¤ ?„ì´ì½??˜ì • (?„ìˆ˜)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ????¤ì½”??(ì¢Œí‘œ ??ì£¼ì†Œ, Nominatim)
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

// ì§€???´ë¦­ ?´ë²¤???¸ë“¤??ì»´í¬?ŒíŠ¸ (?´ë¦­ ??????¤ì½”????ì£¼ì†Œê¹Œì? ì½œë°±)
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
    initialLat || 37.5665, // ê¸°ë³¸ê°? ?œìš¸ ?œì²­
    initialLng || 126.978,
  ]);
  const [selectedCoords, setSelectedCoords] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  // ë¯¸í„°(m) ?¨ìœ„ë¥??„ê²½??degree)ë¡?ë³€?˜í•˜ê³??´ë? ê²©ì???ì„±
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
    // ?¸ë¡œ??(Vertical)
    for (let i = 0; i <= grid_cols; i++) {
      const lng = left + (i * grid_spacing * lngM);
      lines.push([[bottom, lng], [top, lng]]);
    }
    // ê°€ë¡œì„  (Horizontal)
    for (let i = 0; i <= grid_rows; i++) {
      const lat = bottom + (i * grid_spacing * latM);
      lines.push([[lat, left], [lat, right]]);
    }

    return { boundary, lines };
  };

  const { boundary, lines } = getDetailedGrid();

  // ?„ì¹˜ ? íƒ ?¸ë“¤??(ì£¼ì†Œ ?ˆìœ¼ë©??¨ê»˜ ?„ë‹¬: ì§€???´ë¦­ ??????¤ì½”??ê²°ê³¼)
  const handleLocationSelect = (lat, lng, address = null) => {
    setSelectedCoords([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng, address);
    }
  };

  // ì£¼ì†Œ ê²€??(Nominatim API ?¬ìš© - ë¬´ë£Œ, ê²€??ê²°ê³¼ ì£¼ì†Œë¥?ê·¸ë?ë¡?ë¶€ëª¨ì— ?„ë‹¬)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('ì£¼ì†Œë¥??…ë ¥?´ì£¼?¸ìš”.');
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
        alert('ì£¼ì†Œë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤. ??êµ¬ì²´?ìœ¼ë¡??…ë ¥?´ì£¼?¸ìš”.');
      }
    } catch (error) {
      console.error('ì£¼ì†Œ ê²€???¤íŒ¨:', error);
      alert('ì£¼ì†Œ ê²€??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
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
          placeholder="ì£¼ì†Œë¥?ê²€?‰í•˜ê±°ë‚˜ ì§€?„ë? ?´ë¦­?˜ì„¸??(?? ?œìš¸??ê°•ë‚¨êµ???‚¼??"
          className="search-input"
        />
        <button type="button" className="search-btn" onClick={handleSearch}>
          ?” ê²€??        </button>
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
        
        {/* ê·¸ë¦¬???„ë¦¬ë·?(?ì„¸ ê²©ì) */}
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
          <strong>?“ ? íƒ??ì¢Œí‘œ:</strong>
          <br />
          ?„ë„: {selectedCoords[0].toFixed(6)}, ê²½ë„: {selectedCoords[1].toFixed(6)}
          {gridConfig && (
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#1e40af', background: '#eff6ff', padding: '8px', borderRadius: '6px' }}>
              ?“ ?ˆìƒ ?¬ê¸°: ??<b>{(gridConfig.grid_cols * gridConfig.grid_spacing).toFixed(0)}m</b> x <b>{(gridConfig.grid_rows * gridConfig.grid_spacing).toFixed(0)}m</b>
              <br/>
              ?°ì´???¬ì¸?? <b>{gridConfig.grid_rows * gridConfig.grid_cols}ê°?/b>
            </div>
          )}
        </div>
      )}

      <div className="map-hint">
        ?’¡ ?ŒíŠ¸: ì§€?„ë? ?´ë¦­?˜ê±°??ì£¼ì†Œë¥?ê²€?‰í•˜???„ì¹˜ë¥?? íƒ?˜ì„¸??      </div>
    </div>
  );
};

export default LocationPicker;
