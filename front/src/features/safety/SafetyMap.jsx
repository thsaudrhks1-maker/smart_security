import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, SVGOverlay, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../dashboard/Dashboard.css'; // 기본 스타일 유지를 위해

// --- 아이콘 리소스 설정 ---
const createIcon = (colorUrl) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/${colorUrl}`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    safe: createIcon('marker-icon-green.png'),
    danger: createIcon('marker-icon-red.png'),
    equipment: createIcon('marker-icon-red.png'),
    opening: createIcon('marker-icon-blue.png'),
    falling: createIcon('marker-icon-orange.png')
};

// --- 지도 클릭 이벤트 핸들러 (위험요소 추가용) ---
const MapClickHandler = ({ onMapClick, isEditMode }) => {
    useMapEvents({
        click: (e) => {
            if (isEditMode) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
};

const API_BASE = "http://168.107.52.201:8010/api/map";
const WS_URL = "ws://168.107.52.201:8010/api/map/ws/workers";

const SafetyMap = () => {
    const navigate = useNavigate();
    
    // --- UI State (from SafeMapViewer) ---
    const [center] = useState([37.5665, 126.9780]);
    const [zoom] = useState(19);
    const [showMap, setShowMap] = useState(true); 
    const [floorPlanUrl, setFloorPlanUrl] = useState(null);
    const [opacity, setOpacity] = useState(0.8);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newRiskPos, setNewRiskPos] = useState(null); 
    
    // 도면 상태
    const [plan, setPlan] = useState({
        lat: 37.5665,
        lng: 126.9780,
        width: 0.001,
        height: 0.001,
        rotation: 0
    });

    // --- Data State (from Smart Security Backend) ---
    const [risks, setRisks] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [alertLog, setAlertLog] = useState([]);

    // --- 1. Initial Data Load ---
    useEffect(() => {
        // Risks
        fetch(`${API_BASE}/risks`)
            .then(res => res.json())
            .then(data => setRisks(data))
            .catch(err => console.error(err));

        // Blueprint
        fetch(`${API_BASE}/blueprint`)
            .then(res => res.json())
            .then(data => setFloorPlanUrl(data.url))
            .catch(err => console.error(err));
    }, []);

    // --- 2. WebSocket ---
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "WORKER_UPDATE") {
                const updatedWorkers = message.data;
                setWorkers(updatedWorkers);
                
                // Alert Log Simple Logic
                const dangerWorkers = updatedWorkers.filter(w => w.status === 'DANGER');
                if (dangerWorkers.length > 0) {
                    const msg = `[${new Date().toLocaleTimeString()}] ⚠️ 위험: ${dangerWorkers.map(w => w.name).join(', ')}`;
                    setAlertLog(prev => [msg, ...prev].slice(0, 50));
                }
            }
        };
        return () => ws.close();
    }, []);

    // --- Handlers ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(`${API_BASE}/blueprint`, { method: "POST", body: formData });
            const data = await res.json();
            setFloorPlanUrl(data.url);
        } catch(e) { alert("업로드 실패"); }
    };

    const handleMapClick = (latlng) => setNewRiskPos(latlng);

    const addRisk = async (type, name) => {
        if (!newRiskPos) return;
        try {
            const res = await fetch(`${API_BASE}/risks`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    id: 0, name, type, lat: newRiskPos.lat, lng: newRiskPos.lng, radius: 10
                })
            });
            const newRisk = await res.json();
            setRisks([...risks, newRisk]);
            setNewRiskPos(null);
        } catch(e) { alert("추가 실패"); }
    };

    const deleteRisk = async (id) => {
        if(!window.confirm("삭제하시겠습니까?")) return;
        try {
            await fetch(`${API_BASE}/risks/${id}`, { method: "DELETE" });
            setRisks(risks.filter(r => r.id !== id));
        } catch(e) { alert("삭제 실패"); }
    };

    // SVG Bounds
    const svgBounds = [
        [plan.lat - plan.height/2, plan.lng - plan.width/2],
        [plan.lat + plan.height/2, plan.lng + plan.width/2]
    ];

    return (
      <div className="floor-viewer" style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
        
        {/* 헤더 (SafeMapViewer 스타일 복제) */}
        <header className="header" style={{ flexShrink: 0, padding:'15px 20px', background:'#2c3e50', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap: 'wrap' }}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <button onClick={() => navigate(-1)} style={{background:'transparent', border:'1px solid #7f8c8d', color:'white', cursor:'pointer', padding:'5px 10px', borderRadius:'4px'}}>◀ 뒤로</button>
              <div>
                  <h1 style={{margin:0, fontSize:'1.4rem', color:'white'}}>🏗️ 스마트 안전 관제</h1>
                  <div style={{fontSize:'12px', color:'#bdc3c7'}}>GPS 기반 작업자 실시간 추적 시스템</div>
              </div>
          </div>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
              <label style={{cursor:'pointer', background:'#34495e', padding:'6px 10px', borderRadius:'4px', fontSize:'13px', border:'1px solid #7f8c8d'}}>
                  📂 도면 업로드
                  <input type="file" onChange={handleFileUpload} style={{display:'none'}} />
              </label>
              <label style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', cursor:'pointer', background:'#34495e', padding:'6px', borderRadius:'4px',  border:'1px solid #7f8c8d'}}>
                  <input type="checkbox" checked={showMap} onChange={e => setShowMap(e.target.checked)} />
                  🗺️ 지도
              </label>
              <div style={{display:'flex', alignItems:'center', gap:'2px', fontSize:'13px'}}>
                  <span>👁️</span>
                  <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} style={{width:'40px'}} />
              </div>
              <button 
                  onClick={() => setIsEditMode(!isEditMode)} 
                  style={{
                      backgroundColor: isEditMode ? '#e74c3c' : '#3498db', 
                      color: 'white', padding: '8px 16px', borderRadius: '4px', border:'none', cursor:'pointer', fontWeight:'bold',
                      boxShadow: isEditMode ? 'inset 0 0 5px rgba(0,0,0,0.5)' : 'none'
                  }}
              >
                  {isEditMode ? "❌ 편집 종료" : "✏️ 편집 모드"}
              </button>
          </div>
        </header>

        {/* 편집 모드 컨트롤 패널 */}
        {isEditMode && (
            <div style={{
                background: '#ecf0f1', padding: '15px', borderBottom: '2px solid #bdc3c7',
                display: 'flex', gap: '30px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'
            }}>
                <div style={{textAlign:'center'}}>
                    <div style={{fontWeight:'bold', marginBottom:'5px', color:'#333'}}>🔄 회전 ({Math.round(plan.rotation)}°)</div>
                    <input 
                        type="range" min="0" max="360" step="1" 
                        value={plan.rotation} 
                        onChange={(e) => setPlan({...plan, rotation: Number(e.target.value)})}
                        style={{width:'150px', cursor:'pointer'}} 
                    />
                </div>
                <div style={{textAlign:'center'}}>
                    <div style={{fontWeight:'bold', marginBottom:'5px', color:'#333'}}>↔️ 너비</div>
                    <input 
                        type="range" min="0.0001" max="0.005" step="0.00001" 
                        value={plan.width} 
                        onChange={(e) => setPlan({...plan, width: Number(e.target.value)})}
                        style={{width:'150px', cursor:'pointer'}} 
                    />
                </div>
                <div style={{textAlign:'center'}}>
                    <div style={{fontWeight:'bold', marginBottom:'5px', color:'#333'}}>↕️ 높이</div>
                    <input 
                        type="range" min="0.0001" max="0.005" step="0.00001" 
                        value={plan.height} 
                        onChange={(e) => setPlan({...plan, height: Number(e.target.value)})}
                        style={{width:'150px', cursor:'pointer'}} 
                    />
                </div>
                <div style={{fontSize:'12px', color:'#7f8c8d', borderLeft:'1px solid #999', paddingLeft:'15px'}}>
                    💡 <b>Tip:</b> 지도를 클릭하여 <br/>위험 요소를 추가하세요.
                </div>
            </div>
        )}
  
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 지도 영역 */}
          <div style={{ flex: 0.75, position: 'relative', borderRight: '2px solid #ddd', background:'#f0f0f0' }}>
              <MapContainer center={center} zoom={zoom} style={{height: '100%', width: '100%'}}>
                  {showMap && <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
                  
                  <MapClickHandler onMapClick={handleMapClick} isEditMode={isEditMode} />

                  {/* 도면 오버레이 */}
                  {floorPlanUrl && (
                      <SVGOverlay attributes={{ viewBox: "0 0 100 100", preserveAspectRatio: "none" }} bounds={svgBounds}>
                          <image 
                              href={floorPlanUrl} 
                              x="0" y="0" width="100%" height="100%" 
                              style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${plan.rotation}deg)` }}
                              opacity={opacity}
                          />
                      </SVGOverlay>
                  )}

                  {/* 편집 핸들 */}
                  {isEditMode && (
                      <Marker 
                          draggable={true}
                          position={[plan.lat, plan.lng]}
                          icon={L.divIcon({ className: 'move-handle', html: '<div style="background:#2c3e50; color:white; padding:5px; border-radius:5px; white-space:nowrap; font-size:12px; font-weight:bold; border:2px solid white;">📍 도면 이동 핸들</div>', iconSize:[100,30], iconAnchor:[50,35] })}
                          eventHandlers={{
                              drag: (e) => {
                                  const { lat, lng } = e.target.getLatLng();
                                  setPlan(p => ({ ...p, lat, lng }));
                              }
                          }}
                      />
                  )}

                  {/* 위험 요소 */}
                  {risks.map(r => (
                      <React.Fragment key={r.id}>
                          <Circle
                              center={[r.lat, r.lng]}
                              radius={r.radius}
                              pathOptions={{
                                  color: r.type === 'equipment' ? 'red' : r.type === 'opening' ? 'blue' : 'orange',
                                  fillColor: r.type === 'equipment' ? 'red' : r.type === 'opening' ? 'blue' : 'orange'
                              }}
                          />
                          <Marker position={[r.lat, r.lng]} icon={icons[r.type] || icons.danger}>
                              <Popup>
                                  <div style={{textAlign:'center', minWidth:'120px', color:'black'}}>
                                      <div style={{fontWeight:'bold', marginBottom:'5px'}}>{r.name}</div>
                                      {isEditMode && (
                                          <button 
                                              onClick={() => deleteRisk(r.id)}
                                              style={{width:'100%', background:'#ff4444', color:'white', border:'none', borderRadius:'3px', padding:'5px', cursor:'pointer'}}
                                          >
                                              🗑️ 삭제하기
                                          </button>
                                      )}
                                  </div>
                              </Popup>
                          </Marker>
                      </React.Fragment>
                  ))}

                  {/* 작업자 */}
                  {workers.map(w => (
                      <Marker
                          key={w.id}
                          position={[w.lat, w.lng]}
                          icon={w.status === 'DANGER' ? icons.danger : icons.safe}
                      >
                          <Popup>
                              <div style={{color:'black'}}>
                                  <strong>{w.name}</strong> ({w.role})<br/>
                                  <span style={{color: w.status==='DANGER'?'red':'green'}}>Status: {w.status}</span>
                              </div>
                          </Popup>
                      </Marker>
                  ))}
              </MapContainer>

              {/* 팝업 모달 */}
              {newRiskPos && (
                  <div style={{
                      position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
                      background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.3)', zIndex:2000,
                      minWidth:'250px', color:'black'
                  }}>
                      <h3 style={{marginTop:0}}>⚠️ 위험 요소 추가</h3>
                      <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                          <button onClick={() => addRisk('equipment', '신규 중장비')} style={{padding:'8px', background:'#e74c3c', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>🔴 중장비</button>
                          <button onClick={() => addRisk('opening', '신규 개구부')} style={{padding:'8px', background:'#3498db', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>🔵 개구부</button>
                          <button onClick={() => addRisk('falling', '신규 낙하물')} style={{padding:'8px', background:'#e67e22', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>🟠 낙하물</button>
                          <button onClick={() => setNewRiskPos(null)} style={{padding:'8px', background:'#95a5a6', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', marginTop:'5px'}}>취소</button>
                      </div>
                  </div>
              )}

              {/* 위험 알림 오버레이 */}
              {workers.some(w => w.status === 'DANGER') && (
                  <div style={{
                      position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(255,0,0,0.8)', color: 'white', padding: '10px 20px',
                      borderRadius: '30px', fontWeight: 'bold', zIndex: 1000,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      animation: 'pulse 1s infinite'
                  }}>
                      🚨 위험 상황 발생! 작업자 회피 기동 중!
                  </div>
              )}
          </div>
          
          {/* 우측 패널 (정보창) */}
          <div style={{ flex: 0.25, background: '#2c3e50', color: '#ecf0f1', display: 'flex', flexDirection: 'column', borderLeft:'1px solid #444' }}>
               <div style={{padding:'20px', overflowY:'auto', flex: 1}}>
                   <h3 style={{borderBottom:'1px solid #555', paddingBottom:'10px', marginTop:0}}>👷 작업자 현황</h3>
                   <ul style={{listStyle:'none', padding:0}}>
                       {workers.map(w => (
                           <li key={w.id} style={{marginBottom:'10px', padding:'10px', background:'#34495e', borderRadius:'5px', borderLeft:`4px solid ${w.status==='DANGER'?'red':'green'}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                               <div>
                                   <div style={{fontWeight:'bold'}}>{w.name}</div>
                                   <div style={{fontSize:'12px', color:'#bdc3c7'}}>{w.role}</div>
                               </div>
                               <div style={{fontSize:'12px', fontWeight:'bold', color: w.status==='DANGER'?'#ff7675':'#55efc4'}}>
                                   {w.status}
                               </div>
                           </li>
                       ))}
                   </ul>
               </div>
               
               {/* 로그 창 */}
                <div style={{ height: '250px', padding: '15px', background: '#222', color: '#00ff00', overflowY: 'auto', fontFamily: 'monospace', fontSize:'12px', borderTop:'2px solid #555' }}>
                    <h4 style={{marginTop:0, borderBottom:'1px solid #555', paddingBottom:'5px', color:'white'}}>🖥️ 시스템 로그</h4>
                    {alertLog.length === 0 ? (
                        <div style={{color:'#666'}}>(시스템 대기 중...)</div>
                    ) : (
                        alertLog.map((log, i) => (
                            <div key={i} style={{marginBottom:'4px'}}>{log}</div>
                        ))
                    )}
                </div>
          </div>
        </div>
      </div>
    );
};

export default SafetyMap;
