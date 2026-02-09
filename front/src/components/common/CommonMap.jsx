
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
  myZoneNames = [], // 강조할 구역 이름들 (배열)
  plans = [],
  risks = [],
  zones = [], // 새로 추가: 구역별 상세 정보
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
  
  // 구역 이름으로 빠른 검색을 위한 맵 생성
  const zoneMap = {};
  zones.forEach(zone => {
    if (zone.level === highlightLevel) {
      zoneMap[zone.name] = zone;
    }
  });

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

        {/* 그리드 셀 (Zone) 렌더링 - 작업/위험요소 상세 표시 */}
        {(() => {
          const cells = [];
          const hazardMarkers = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const zoneName = `${highlightLevel}-${chr(65+r)}${c+1}`;
              const zoneData = zoneMap[zoneName] || null;
              
              const isMyZone = Array.isArray(myZoneNames) 
                ? myZoneNames.includes(zoneName) 
                : myZoneNames === zoneName;
              
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
              // [REFINED STYLING LOGIC]
              let fillColor = 'transparent';
              let fillOpacity = 0.08;
              let strokeColor = '#94a3b8';
              let strokeWeight = 2.5;
              let dashArray = null;

              if (isMyZone) {
                // 1. 내 구역 (매우 진한 보라색 베이스 - Violet 700/900)
                fillColor = '#6d28d9'; // Violet 700
                fillOpacity = 0.5;
                
                if (hasRisk) {
                  // 내 구역인데 위험까지 겹친 경우 -> 보라색 배경 + 굵은 빨간 테두리
                  strokeColor = '#dc2626'; // Red 600
                  strokeWeight = 10;
                  dashArray = "10, 5"; // 위험 경고 점선
                } else {
                  // 일반 내 작업 구역
                  strokeColor = '#4c1d95'; // Violet 900
                  strokeWeight = 8;
                }
              } else if (hasRisk && hasPlan) {
                // 2. 타인 구역 + 위험 + 작업 (노란색/빨간색)
                fillColor = '#fef08a';
                fillOpacity = 0.45;
                strokeColor = '#dc2626';
                strokeWeight = 5;
              } else if (hasRisk) {
                // 3. 위험 구역만 (빨간색)
                fillColor = '#fecaca';
                fillOpacity = 0.35;
                strokeColor = '#dc2626';
                strokeWeight = 5;
              } else if (hasPlan) {
                // 4. 일반 작업 구역 (파란색)
                fillColor = '#bfdbfe';
                fillOpacity = 0.3;
                strokeColor = '#2563eb';
                strokeWeight = 3;
              }


              const b = [
                [startLat - r * latStep, startLng + c * lngStep],
                [startLat - (r + 1) * latStep, startLng + (c + 1) * lngStep]
              ];

              const centerLat = (b[0][0] + b[1][0]) / 2;
              const centerLng = (b[0][1] + b[1][1]) / 2;

              // 위험 핀 (Hazard Pin) 이미지 아이콘으로 변경
              if (hasRisk) {
                  const hazardIcon = L.divIcon({
                      html: `<div style="
                          position: relative; 
                          width: 48px; height: 48px; 
                          display: flex; align-items: center; justify-content: center;
                          animation: bounce 2s infinite;
                      ">
                          <img src="http://localhost:8500/uploads/icon/image-Photoroom.png" 
                               style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));"
                               onerror="this.style.display='none'"
                          />
                      </div>`,
                      className: '',
                      iconSize: [48, 48],
                      iconAnchor: [24, 44]
                  });

                  hazardMarkers.push(
                      <Marker 
                          key={`hazard-${zoneName}`} 
                          position={[centerLat, centerLng]} 
                          icon={hazardIcon}
                          zIndexOffset={1000}
                          eventHandlers={{
                              click: () => {
                                if (onZoneClick) onZoneClick({ 
                                  name: zoneName, 
                                  level: highlightLevel,
                                  id: zoneData?.id,
                                  tasks: zoneTasks,
                                  dangers: zoneDangers
                                });
                              }
                          }}
                      />
                  );
              }
              
              cells.push(
                <Rectangle 
                  key={`cell-${zoneName}`} 
                  bounds={b} 
                  eventHandlers={{
                    click: () => {
                      if (onZoneClick) onZoneClick({ 
                        name: zoneName, 
                        level: highlightLevel,
                        id: zoneData?.id,
                        tasks: zoneTasks,
                        dangers: zoneDangers
                      });
                      if (onMapClick) onMapClick({ lat: centerLat, lng: centerLng });
                    },
                    mouseover: (e) => {
                      e.target.setStyle({ 
                        weight: 6, 
                        color: hasRisk ? '#991b1b' : hasPlan ? '#1e3a8a' : '#475569', 
                        fillOpacity: 0.6 
                      });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({ 
                        weight: strokeWeight, 
                        color: strokeColor, 
                        fillOpacity: fillOpacity 
                      });
                    }
                  }}
                  pathOptions={{ 
                    color: strokeColor, 
                    weight: strokeWeight, 
                    fillColor: fillColor, 
                    fillOpacity: fillOpacity,
                    dashArray: dashArray
                  }}
                >
                  <Tooltip 
                    permanent 
                    direction="center" 
                    opacity={hasRisk ? 1 : 0.9} 
                    className="zone-label-tooltip"
                  >
                    <div style={{ 
                        fontSize: hasRisk ? '14px' : '11px', 
                        fontWeight: hasRisk ? '900' : (hasPlan || isMyZone) ? '800' : '500', 
                        color: hasRisk ? '#7f1d1d' : (hasPlan || isMyZone) ? '#1e3a8a' : '#94a3b8',
                        background: hasRisk ? 'rgba(254, 202, 202, 0.9)' : 'rgba(255,255,255,0.6)',
                        padding: hasRisk ? '4px 8px' : '2px 4px',
                        borderRadius: '6px',
                        border: hasRisk ? '2px solid #ef4444' : '1px solid rgba(0,0,0,0.05)',
                        lineHeight: '1',
                        boxShadow: hasRisk ? '0 4px 6px -1px rgba(220, 38, 38, 0.3)' : 'none',
                        transition: 'all 0.3s'
                     }}>
                        {zoneName}
                    </div>
                  </Tooltip>
                  <Popup>
                    <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                      <div style={{ 
                        color: hasRisk ? '#ef4444' : hasPlan ? '#3b82f6' : '#64748b', 
                        fontWeight: '900', 
                        fontSize: '1.2rem',
                        marginBottom: '8px'
                      }}>
                        {zoneName}
                      </div>
                      
                      {/* 작업 정보 */}
                      {hasPlan && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '800', 
                            color: '#3b82f6',
                            marginBottom: '4px'
                          }}>
                            작업 계획
                          </div>
                          {zoneTasks.map((task, idx) => (
                            <div key={idx} style={{ 
                              fontSize: '0.8rem', 
                              color: '#1e293b',
                              marginBottom: '4px',
                              paddingLeft: '8px'
                            }}>
                              • {task.work_type || '작업'}
                              {totalWorkers > 0 && (
                                <span style={{ 
                                  marginLeft: '6px',
                                  padding: '2px 6px',
                                  background: '#dbeafe',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '800'
                                }}>
                                  {totalWorkers}명
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 위험 요소 */}
                      {hasRisk && (
                        <div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '800', 
                            color: '#ef4444',
                            marginBottom: '4px'
                          }}>
                            위험 요소
                          </div>
                          {zoneDangers.map((danger, idx) => (
                            <div key={idx} style={{ 
                              fontSize: '0.8rem', 
                              color: '#991b1b',
                              marginBottom: '4px',
                              paddingLeft: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ 
                                padding: '2px 6px',
                                background: danger.color || '#dc2626',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: '800'
                              }}>
                                {danger.danger_type || danger.risk_type}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!hasPlan && !hasRisk && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                          평시 구역
                        </div>
                      )}
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
