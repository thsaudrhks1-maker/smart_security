import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marker, Popup, Circle, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/WorkerDashboard.css';
import { mapApi } from '@/api/mapApi';
import { safetyApi } from '@/api/safetyApi';
import { getProjectById } from '@/api/projectApi';
import { workerApi } from '@/api/workerApi';
import BuildingSectionView from '@/features/manager/work/BuildingSectionView';
import UniversalBlueprintMap from '@/components/common/map/UniversalBlueprintMap';

// --- ?„ì´ì½?ë¦¬ì†Œ???¤ì • ---
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

const SafetyMap = () => {
    const navigate = useNavigate();
    
    // --- UI State ---
    const [project, setProject] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('1F');
    const [loading, setLoading] = useState(true);
    
    const [showMap, setShowMap] = useState(true); 
    const [floorPlanUrl, setFloorPlanUrl] = useState(null);
    const [opacity, setOpacity] = useState(0.8);
    
    // --- Data State ---
    const [risks, setRisks] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [zones, setZones] = useState([]);

    // --- 1. Initial Data Load ---
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // 1. ê·¼ë¡œ???€?œë³´?œì—???„ë¡œ?íŠ¸ ID ê°€?¸ì˜¤ê¸?                const dash = await workerApi.getDashboard();
                const pid = dash?.project?.id;
                if (!pid) return;

                // 2. ?„ë¡œ?íŠ¸ ?ì„¸ ?•ë³´ (ì¸µìˆ˜ ??
                const proj = await getProjectById(pid);
                setProject(proj);

                // 3. êµ¬ì—­ ë°??„í—˜ ?•ë³´
                const [riskData, zoneData] = await Promise.all([
                    mapApi.getRisks(),
                    safetyApi.getZones(null, pid)
                ]);
                setRisks(riskData || []);
                setZones(zoneData || []);

                // ê¸°ë³¸ ì¸µìˆ˜ ?¤ì • (?„ì¬ ë°°ì •???‘ì—…???ˆë‹¤ë©?ê·?ì¸µìœ¼ë¡? ?†ìœ¼ë©?1F)
                // TODO: ê·¼ë¡œ??ë°°ì • ì¸?ì°¾ê¸° ë¡œì§ ì¶”ê? ê°€??            } catch (error) {
                console.error("?°ì´??ë¡œë”© ?¤íŒ¨:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // ì¸µìˆ˜ ë¦¬ìŠ¤???ì„±
    const levels = useMemo(() => {
        if (!project) return ['1F'];
        const res = [];
        for (let i = project.basement_floors; i >= 1; i--) res.push(`B${i}`);
        for (let i = 1; i <= project.ground_floors; i++) res.push(`${i}F`);
        return res;
    }, [project]);

    // ?„í„°ë§ëœ êµ¬ì—­ (?„ì¬ ì¸µë§Œ)
    const filteredZones = useMemo(() => {
        return zones.filter(z => z.level === selectedLevel);
    }, [zones, selectedLevel]);

    const center = project ? [project.location_lat, project.location_lng] : [37.5665, 126.9780];

    if (loading) return <div style={{padding:'20px', textAlign:'center'}}>?„ì¥ ?°ì´?°ë? ë¶ˆëŸ¬?¤ëŠ” ì¤?..</div>;

    return (
      <div className="floor-viewer" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
        
        {/* ?¤ë” */}
        <header style={{ flexShrink: 0, padding:'12px 20px', background:'#1e293b', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <button onClick={() => navigate(-1)} style={{background:'transparent', border:'1px solid #475569', color:'white', padding:'6px 12px', borderRadius:'6px', cursor:'pointer' }}>?€</button>
                <div>
                    <h2 style={{margin:0, fontSize:'1.1rem'}}>?›¡ï¸??ˆì „ ëª¨ë‹ˆ?°ë§</h2>
                    <div style={{fontSize:'11px', color:'#94a3b8'}}>{project?.name}</div>
                </div>
            </div>
            <div style={{display:'flex', gap:'8px'}}>
                <span style={{fontSize:'12px', background:'#334155', padding:'4px 8px', borderRadius:'4px'}}>{selectedLevel}</span>
            </div>
        </header>

        {/* ë©”ì¸ ì½˜í…ì¸??ì—­ (?¨ë©´??+ ì§€?? */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {project && (
                <BuildingSectionView 
                    project={project}
                    selectedLevel={selectedLevel}
                    onLevelSelect={setSelectedLevel}
                    allZones={zones}
                    allRisks={risks}
                />
            )}

            {/* ì§€???ì—­ */}
            <div style={{ flex: 1, position: 'relative' }}>
                <UniversalBlueprintMap
                    role="WORKER"
                    zones={filteredZones}
                    risks={risks.filter(r => filteredZones.some(z => z.id === r.zone_id))}
                    center={center}
                    zoom={20}
                    height="100%"
                    blueprintUrl={floorPlanUrl}
                >
                    {/* ?„í—˜ ?”ì†Œ (?¤ì‹œê°?ë§ˆì»¤ ??- ?„ìš”??ì¶”ê? ?°ë™) */}
                </UniversalBlueprintMap>

                {/* ?˜ë‹¨ ?•ë³´ ë°°ì? */}
                <div style={{ position:'absolute', bottom:20, left:20, right:20, zIndex:1000, display:'flex', flexDirection:'column', gap:'10px' }}>
                    <div style={{ background:'rgba(255,255,255,0.95)', padding:'12px 16px', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                            <div style={{fontSize:'0.7rem', color:'#64748b', marginBottom:'2px'}}>?„ì¬ ì¸?/div>
                            <div style={{fontSize:'1rem', fontWeight:'900', color:'#1e293b'}}>{selectedLevel}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{fontSize:'0.7rem', color:'#64748b', marginBottom:'2px'}}>?„í—˜ ?”ì†Œ</div>
                            <div style={{fontSize:'0.9rem', fontWeight:'800', color: risks.filter(r => filteredZones.some(z => z.id === r.zone_id)).length > 0 ? '#ef4444' : '#10b981'}}>
                                {risks.filter(r => filteredZones.some(z => z.id === r.zone_id)).length}ê±?ê°ì?
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};

export default SafetyMap;
