import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, HardHat, Activity, Truck, 
  Grid, Database, LayoutDashboard, FileText, 
  Users, Briefcase, ShieldAlert, Settings, X, MapPin
} from 'lucide-react';
import apiClient from '../../../api/client';
import { mapApi } from '../../../api/mapApi';
import { safetyApi } from '../../../api/safetyApi';
import { workApi } from '../../../api/workApi';
import { useAuth } from '../../../context/AuthContext';
import { ZoneSquareStyled } from '../../manager/work/ZoneSquareLayer';

// --- Sub Components ---

const StatCard = ({ title, value, sub, icon: Icon, color, onClick }) => (
  <div 
    className="glass-panel" 
    style={{ padding: '1.25rem', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
    onClick={onClick}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-3px)')}
    onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span className="text-muted text-sm" style={{ color: '#64748b' }}>{title}</span>
      <Icon size={18} color={color} />
    </div>
    <div className="text-2xl" style={{ fontWeight: '700', marginBottom: '0.25rem', fontSize: '1.5rem', color: '#1e293b' }}>{value}</div>
    <div className="text-xs" style={{ color: color }}>{sub}</div>
  </div>
);

// Map Overlay for Risks
const RiskSidePanel = ({ risks, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div style={{ 
            position: 'absolute', top: 0, right: 0, height: '100%', 
            width: '280px', zIndex: 1000,
            background: 'white',
            borderLeft: '1px solid #e2e8f0',
            padding: '1.25rem', display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={18} color="#ef4444" /> 위험 목록
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {risks.length > 0 ? risks.map(r => (
                    <div key={r.id} style={{ padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>{r.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                             <span style={{ textTransform: 'uppercase', background: '#ffe4e6', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{r.type}</span>
                        </div>
                    </div>
                )) : <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>위험 요소 없음</div>}
            </div>
        </div>
    );
};

// --- Modals (Admin Style) ---

const WorkersModal = ({ onClose }) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        apiClient.get('/dashboard/workers/today').then(res => { setWorkers(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = workers.filter(w => filter === 'ALL' || w.today_status === filter);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '500px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>📋 금일 인력 현황</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
                </div>
                <div style={{ padding: '1rem', display: 'flex', gap: '10px' }}>
                    <button onClick={() => setFilter('ALL')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: filter==='ALL'?'#3b82f6':'white', color: filter==='ALL'?'white':'#64748b', fontWeight: '600' }}>전체</button>
                    <button onClick={() => setFilter('WORKING')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: filter==='WORKING'?'#10b981':'white', color: filter==='WORKING'?'white':'#64748b', fontWeight: '600' }}>출역중</button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
                    {loading ? <div>Loading...</div> : filtered.map(w => (
                        <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#334155' }}>{w.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.trade}</div>
                            </div>
                            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', background: w.today_status==='WORKING'?'#dcfce7':'#f1f5f9', color: w.today_status==='WORKING'?'#166534':'#64748b', fontWeight:'700' }}>{w.today_status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TodayPlansModal = ({ plans, onClose, onSelectJob }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '500px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>🛠 금일 작업 계획</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1.5rem' }}>
                {plans.map(p => (
                    <div key={p.id} onClick={()=>{onSelectJob(p); onClose();}} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', hover: { background: '#f8fafc' } }}>
                        <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700' }}>{p.work_type}</div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{p.description}</div>
                        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#64748b' }}>📍 {p.zone_name} | ⚠️ 위험도 {p.calculated_risk_score}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const AdminDataModal = ({ onClose }) => {
    const [data, setData] = useState([]);
    useEffect(() => { apiClient.get('/admin/db/workers').then(res => setData(res.data)).catch(() => {}); }, []);
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '800px', height: '600px', background: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ margin:0 }}>📊 데이터 센터</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>이름</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>직종</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px' }}>{d.id}</td>
                                    <td style={{ padding: '10px' }}>{d.name}</td>
                                    <td style={{ padding: '10px' }}>{d.trade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const SafetyControlCenter = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ total_workers: 0, today_plans: 0, active_equipment: 0, safety_accident_free_days: 0 });
  const [plans, setPlans] = useState([]);
  const [risks, setRisks] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkerLabels, setShowWorkerLabels] = useState(true);

  // UI States
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
        const [sumRes, planRes, riskRes, zoneRes] = await Promise.all([
            apiClient.get('/dashboard/summary'),
            workApi.getPlans({ date: new Date().toISOString().split('T')[0] }),
            mapApi.getRisks(),
            safetyApi.getZones()
        ]);
        
        setSummary(sumRes.data || { total_workers: 0, today_plans: 0, active_equipment: 0, safety_accident_free_days: 0 });
        setPlans(planRes || []);
        setRisks(riskRes || []);
        setZones(zoneRes || []);
    } catch (error) {
        console.error("Dashboard data load failed:", error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>데이터를 불러오는 중...</div>;

  return (
    <div className="safety-control-center">
      {showWorkerModal && <WorkersModal onClose={() => setShowWorkerModal(false)} />}
      {showPlansModal && <TodayPlansModal plans={plans} onClose={() => setShowPlansModal(false)} onSelectJob={() => {}} />}
      {showAdminModal && <AdminDataModal onClose={() => setShowAdminModal(false)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight:'800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={28} color="#3b82f6" /> 스마트 안전 관제 센터
            </h2>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>실시간 현장 모니터링 및 안전 현황</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowMap(!showMap)} 
              style={{ background: showMap ? '#e0f2fe' : 'white', border: `1px solid ${showMap ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '8px', padding: '8px', cursor: 'pointer', color: showMap ? '#0284c7' : '#64748b' }}
            >
              <MapPin size={20} />
            </button>
            <button onClick={() => setShowAdminModal(true)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#64748b' }}>
              <Database size={20} />
            </button>
          </div>
      </div>

      {/* Map Section */}
      {showMap && (
        <div style={{ height: '520px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', marginBottom: '1.5rem', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <MapContainer center={[37.5665, 126.9780]} zoom={17} style={{ height: '100%', width: '100%', background: '#f8fafc' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.20} />
            
            {/* 구역 그리드 및 작업자 정보 */}
            {zones.filter(z => z.lat && z.lng).map(zone => {
                const zonePlans = plans.filter(p => p.zone_id === zone.id);
                const hasWork = zonePlans.length > 0;
                const hasDanger = risks.some(r => r.zone_id === zone.id); // 위험 목록 연동 여부 확인 필요하나 여기서는 단순 ID 비교
                const isOverlap = hasWork && hasDanger;

                const pathOptions = isOverlap
                    ? { fillColor: '#3b82f6', fillOpacity: 0.7, color: '#ef4444', weight: 4 }
                    : hasWork
                        ? { fillColor: '#3b82f6', fillOpacity: 0.7, color: 'rgba(0,0,0,0.3)', weight: 1.5 }
                        : hasDanger
                            ? { fillColor: '#ef4444', fillOpacity: 0.7, color: 'rgba(0,0,0,0.3)', weight: 1.5 }
                            : { fillColor: '#ffffff', fillOpacity: 0.5, color: 'rgba(0,0,0,0.2)', weight: 1.5 };

                const labelContent = showWorkerLabels && (
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.98)', 
                        border: `1.5px solid ${hasWork ? '#3b82f6' : '#94a3b8'}`, 
                        borderRadius: '6px', padding: '4px 8px', 
                        fontSize: '0.75rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                        pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '90px'
                    }}>
                        <div style={{ borderBottom: hasWork ? '1px solid #eee' : 'none', pb: '2px', mb: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ background: hasWork ? '#3b82f6' : '#64748b', color: 'white', padding: '0 4px', borderRadius: '3px', fontSize: '0.65rem' }}>#{zone.id}</span>
                            <span>{zone.name}</span>
                        </div>
                        {hasWork && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}>
                                {zonePlans.flatMap(p => p.allocations || []).map((a, idx) => (
                                    <span key={idx} style={{ color: '#1e40af', background: '#eff6ff', padding: '1px 4px', borderRadius: '3px', fontSize: '0.65rem' }}>{a.worker_name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );

                return (
                    <ZoneSquareStyled
                        key={zone.id}
                        zone={zone}
                        pathOptions={pathOptions}
                        tooltipContent={labelContent}
                        tooltipOptions={{ permanent: true, direction: 'center', opacity: 1, offset: [0, 0] }}
                    />
                );
            })}
          </MapContainer>
          
          <button 
            onClick={() => setShowRiskPanel(!showRiskPanel)}
            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 999, background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <AlertTriangle size={20} color={risks.length > 0 ? '#ef4444' : '#64748b'} />
            {risks.length > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>}
          </button>

          <RiskSidePanel risks={risks} isOpen={showRiskPanel} onClose={() => setShowRiskPanel(false)} />
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard title="출역 인원" value={`${summary.total_workers}명`} sub="금일 현장 투입" icon={HardHat} color="#3b82f6" onClick={() => setShowWorkerModal(true)} />
        <StatCard title="진행 작업" value={`${summary.today_plans}건`} sub="금일 작업 계획" icon={Briefcase} color="#10b981" onClick={() => setShowPlansModal(true)} />
        <StatCard title="가동 장비" value={`${summary.active_equipment}대`} sub="실시간 운용 중" icon={Truck} color="#f59e0b" />
        <StatCard title="무재해 일수" value={`D+${summary.safety_accident_free_days}`} sub="안전 사고 Zero" icon={Activity} color="#8b5cf6" />
      </div>
    </div>
  );
};

export default SafetyControlCenter;
