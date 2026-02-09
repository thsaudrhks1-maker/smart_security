
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Rectangle, Tooltip } from 'react-leaflet';
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

const MapZoomHandler = ({ onZoomChange }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
};

// ... inside CommonMap component ...

const CommonMap = ({ 
  center = [37.5665, 126.9780], 
  zoom = 19, 
  markers = [], 
  onZoneClick,
  onMapClick,
  highlightLevel = '1F',
  myZoneNames = [],
  plans = [],
  risks = [],
  zones = [],
  gridConfig = { rows: 10, cols: 10, spacing: 10 }, 
  style = { height: '100%', width: '100%' }
}) => {
  const [currentZoom, setCurrentZoom] = React.useState(zoom);

  const rows = parseInt(gridConfig.rows) || 10;
  const cols = parseInt(gridConfig.cols) || 10;
  const spacing = parseFloat(gridConfig.spacing) || 10;

  const latStep = 1 / 111320 * spacing;
  const lngStep = 1 / (111320 * Math.cos(center[0] * Math.PI / 180)) * spacing;
  
  const startLat = center[0] + (latStep * rows) / 2;
  const startLng = center[1] - (lngStep * cols) / 2;
  const chr = (n) => String.fromCharCode(n);
  
  // 구역 이름으로 빠른 검색을 위한 맵 생성
  const zoneMap = {};
  zones.forEach(zone => {
    if (zone.level === highlightLevel) {
      zoneMap[zone.name] = zone;
    }
  });

  // 그리드 셀 & 마커 생성 (useMemo로 성능 최적화)
  const gridElements = React.useMemo(() => {
    const cells = [];
    const hazardMarkers = [];
    
    // 유효성 검사
    const rowCount = parseInt(gridConfig.rows) || 10;
    const colCount = parseInt(gridConfig.cols) || 10;
    
    // 줌 레벨에 따른 폰트/아이콘 크기 계산 비율 (Zoom 19 기준 1배)
    const scaleRatio = Math.max(0.5, Math.pow(1.5, currentZoom - 19));
    const fontSize = Math.max(10, 12 * scaleRatio);
    const iconSize = Math.max(24, 48 * scaleRatio);

    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        const zoneName = `${highlightLevel}-${chr(65+r)}${c+1}`;
        
        const zoneData = zoneMap[zoneName] || null;
        const isMyZone = Array.isArray(myZoneNames) ? myZoneNames.includes(zoneName) : myZoneNames === zoneName;
        const zoneTasks = zoneData?.tasks || [];
        const zoneDangers = zoneData?.dangers || [];
        const hasPlan = zoneTasks.length > 0;
        const hasRisk = zoneDangers.length > 0;
        
        // 총 작업자 수 계산
        let totalWorkers = 0;
        zoneTasks.forEach(task => {
          const workers = task.workers || [];
          totalWorkers += Array.isArray(workers) ? workers.length : 0;
        });

        // 스타일링 로직
        let fillColor = 'transparent';
        let fillOpacity = 0.08;
        let strokeColor = '#94a3b8';
        let strokeWeight = 1; 
        let dashArray = null;

        if (isMyZone) {
          fillColor = '#6d28d9'; fillOpacity = 0.5;
          if (hasRisk) { strokeColor = '#dc2626'; strokeWeight = 4; dashArray = "10, 5"; }
          else { strokeColor = '#4c1d95'; strokeWeight = 3; }
        } else if (hasRisk && hasPlan) {
          fillColor = '#fef08a'; fillOpacity = 0.45; strokeColor = '#dc2626'; strokeWeight = 3;
        } else if (hasRisk) {
          fillColor = '#fecaca'; fillOpacity = 0.35; strokeColor = '#dc2626'; strokeWeight = 3;
        } else if (hasPlan) {
          fillColor = '#bfdbfe'; fillOpacity = 0.3; strokeColor = '#2563eb'; strokeWeight = 2;
        }
        
        const b = [[startLat - r * latStep, startLng + c * lngStep], [startLat - (r + 1) * latStep, startLng + (c + 1) * lngStep]];
        const centerLat = (b[0][0] + b[1][0]) / 2;
        const centerLng = (b[0][1] + b[1][1]) / 2;

        // 위험 아이콘
        if (hasRisk) {
            const hostname = window.location.hostname;
            const hazardIcon = L.divIcon({
                html: `<div style="
                    position: relative; 
                    width: ${iconSize}px; height: ${iconSize}px; 
                    display: flex; align-items: center; justify-content: center;
                    animation: bounce 2s infinite;
                ">
                    <img src="http://${hostname}:8500/uploads/icon/image-Photoroom.png" 
                         style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));"
                         onerror="this.style.display='none'"
                    />
                </div>`,
                className: '',
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize/2, iconSize*0.9]
            });
            hazardMarkers.push(
                <Marker key={`hazard-${zoneName}`} position={[centerLat, centerLng]} icon={hazardIcon} zIndexOffset={1000} 
                    eventHandlers={{ click: () => onZoneClick && onZoneClick({ name: zoneName, level: highlightLevel, id: zoneData?.id, tasks: zoneTasks, dangers: zoneDangers }) }} 
                />
            );
        }

        cells.push(
          <Rectangle key={`cell-${zoneName}`} bounds={b}
            eventHandlers={{
              click: () => {
                 if (onZoneClick) onZoneClick({ name: zoneName, level: highlightLevel, id: zoneData?.id, tasks: zoneTasks, dangers: zoneDangers });
                 if (onMapClick) onMapClick({ lat: centerLat, lng: centerLng });
              },
              mouseover: (e) => e.target.setStyle({ weight: Math.max(3, strokeWeight * 1.5), fillOpacity: 0.6 }),
              mouseout: (e) => e.target.setStyle({ weight: strokeWeight, color: strokeColor, fillOpacity: fillOpacity })
            }}
            pathOptions={{ color: strokeColor, weight: strokeWeight, fillColor, fillOpacity, dashArray }}
          >
            <Tooltip permanent direction="center" opacity={hasRisk ? 1 : 0.9} className="zone-label-tooltip">
              <div style={{ 
                  fontSize: `${fontSize}px`,
                  fontWeight: hasRisk ? '900' : (hasPlan || isMyZone) ? '800' : '400',
                  color: hasRisk ? '#991b1b' : (hasPlan || isMyZone) ? '#1e40af' : '#cbd5e1',
                  textShadow: hasRisk ? '0px 0px 2px rgba(255,255,255,0.8)' : 'none',
                  background: hasRisk ? 'rgba(255, 255, 255, 0.85)' : (hasPlan ? 'rgba(255, 255, 255, 0.8)' : 'transparent'),
                  padding: '2px 6px',
                  borderRadius: '6px',
                  border: hasRisk ? '2px solid #ef4444' : (hasPlan ? '1px solid #3b82f6' : 'none'),
                  boxShadow: hasRisk ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
               }}>
                  {zoneName}
              </div>
            </Tooltip>
            {/* Popup은 필요시 추가 */}
          </Rectangle>
        );
      }
    }
    return { cells, hazardMarkers };
  }, [rows, cols, currentZoom, highlightLevel, zones, plans, risks, myZoneNames, gridConfig, startLat, startLng, latStep, lngStep]);

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
        <MapZoomHandler onZoomChange={setCurrentZoom} />

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.5}
          maxZoom={22}
          maxNativeZoom={19}
        />

        {gridElements.cells}
        {gridElements.hazardMarkers}

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
