import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, HardHat, Activity, Truck, 
  Search, Bell, MoreHorizontal, Grid, Database,
  LayoutDashboard, FileText, Users, Briefcase, ShieldAlert, Settings, LogOut, X, MapPin
} from 'lucide-react';
import L from 'leaflet';
import apiClient from '../../api/client';
import { workApi } from '../../api/workApi';
import { mapApi } from '../../api/mapApi';
import { useAuth } from '../../context/AuthContext';

// --- Sub Components ---

const StatCard = ({ title, value, sub, icon: Icon, color, onClick }) => (
  <div 
    className="glass-panel" 
    style={{ padding: '1.25rem', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
    onClick={onClick}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-3px)')}
    onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span className="text-muted text-sm">{title}</span>
      <Icon size={18} color={color} />
    </div>
    <div className="text-2xl" style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{value}</div>
    <div className="text-xs" style={{ color: color }}>{sub}</div>
  </div>
);

// Map Overlay for Risks
const RiskListOverlay = ({ risks }) => (
    <div style={{ 
        position: 'absolute', top: '15px', right: '15px', zIndex: 1000,
        width: '180px', maxHeight: '250px', overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)',
        padding: '12px', pointerEvents: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#ef4444" /> 위험 요소 ({risks.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {risks.length > 0 ? risks.map(r => (
                <div key={r.id} style={{ paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '700' }}>{r.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Category: {r.type}</div>
                </div>
            )) : <div style={{ fontSize: '0.75rem', color: '#64748b' }}>감지된 위험 없음</div>}
        </div>
    </div>
);

// --- Modals ---

const WorkersModal = ({ onClose }) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        apiClient.get('/dashboard/workers/today').then(res => {
            setWorkers(res.data);
            setLoading(false);
        });
    }, []);

    const filteredWorkers = workers.filter(w => (filter === 'WORKING' ? w.today_status === 'WORKING' : true));

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(6px)' }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '450px', maxHeight: '80vh', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📋 금일 인력 현황</h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>
                <div style={{ display: 'flex', gap: '8px', padding: '10px 1.25rem' }}>
                    <button onClick={() => setFilter('ALL')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: filter==='ALL'?'var(--accent-primary)':'rgba(255,255,255,0.05)', color: 'white', fontWeight: '600' }}>전체</button>
                    <button onClick={() => setFilter('WORKING')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: filter==='WORKING'?'#10b981':'rgba(255,255,255,0.05)', color: 'white', fontWeight: '600' }}>출역중</button>
                </div>
                <div style={{ padding: '0 1.25rem 1.25rem', overflowY: 'auto' }}>
                    {loading ? <div style={{ textAlign:'center', padding:'2rem' }}>Loading...</div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredWorkers.map(w => {
                                const isWorking = w.today_status === 'WORKING';
                                return (
                                    <div key={w.id} style={{
                                        padding: '1rem', borderRadius: '12px', 
                                        background: isWorking ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${isWorking ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.05)'}`,
                                        boxShadow: isWorking ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: isWorking ? '#f8fafc' : '#94a3b8' }}>{w.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: isWorking ? '#10b981' : '#64748b', marginTop: '2px', fontWeight: isWorking ? '700' : '400' }}>{w.trade} {w.today_work ? `| ${w.today_work}` : ''}</div>
                                        </div>
                                        <div style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', background: isWorking ? '#10b981' : 'rgba(255,255,255,0.1)', color: isWorking ? 'white' : '#64748b' }}>{isWorking ? 'WORKING' : 'REST'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TodayPlansModal = ({ plans, onClose, onSelectJob }) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(6px)' }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '450px', maxHeight: '85vh', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={20} color="#3b82f6" /> 금일 작업 계획
                    </h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>
                <div style={{ padding: '1.25rem', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {plans.map(job => (
                            <div key={job.id} onClick={() => { onSelectJob(job); onClose(); }} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: '800' }}>{job.work_type}</div>
                                <div style={{ fontWeight: '700', color: '#f8fafc' }}>{job.description}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                                    <span>📍 {job.zone_name}</span>
                                    <span style={{ color: '#ef4444', fontWeight: '800' }}>{job.calculated_risk_score}% Risk</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobDetailModal = ({ job, onClose }) => {
    if (!job) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', background: '#0f172a' }}>
                 <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#1e293b', zIndex: 10 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>작업 상세</h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{job.description}</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>📍 위치</span><span>{job.zone_name}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>🛠 공종</span><span>{job.work_type}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>⚠️ 위험도</span><span style={{ color: '#ef4444', fontWeight: 'bold' }}>{job.calculated_risk_score}%</span></div>
                    </div>
                    
                    {job.required_ppe && job.required_ppe.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>🛡 필수 보호구</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {job.required_ppe.map((item, idx) => (
                                    <span key={idx} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {job.checklist_items && job.checklist_items.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>✅ 체크리스트</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {job.checklist_items.map((item, idx) => (
                                    <div key={idx} style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#10b981' }}>•</span> {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {job.allocations && job.allocations.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>👥 투입 인력</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {job.allocations.map((alloc) => (
                                    <div key={alloc.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{alloc.worker_name}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '8px' }}>{alloc.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminDataModal = ({ onClose }) => {
    const [data, setData] = useState([]);
    useEffect(() => { apiClient.get('/admin/db/workers').then(res => setData(res.data)); }, []);
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel" style={{ width: '95%', maxWidth: '1000px', height: '80vh', background: '#0f172a', display:'flex', flexDirection:'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between' }}>
                    <h3>데이터 센터</h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>
                <div style={{ overflow: 'auto', padding: '1rem', flex: 1 }}>
                     <table style={{ width: '100%', color: 'white' }}>
                        <thead><tr style={{ textAlign:'left' }}><th>ID</th><th>이름</th><th>직종</th><th>역할</th></tr></thead>
                        <tbody>{data.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.trade}</td><td>{r.role}</td></tr>)}</tbody>
                     </table>
                </div>
            </div>
        </div>
    );
};

const AppMenuModal = ({ onClose, onLogout, user, onOpenAdmin }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.98)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none' }}><X size={32} color="white" /></button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '80%', maxWidth: '400px' }}>
             <div onClick={onClose} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}><LayoutDashboard size={32} color="#3b82f6" /><div>대시보드</div></div>
             <div onClick={onOpenAdmin} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}><Database size={32} color="#ec4899" /><div>데이터 센터</div></div>
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{user?.full_name} 님</div>
            <button onClick={onLogout} style={{ marginTop: '10px', color: '#ef4444', border: 'none', background: 'none' }}>로그아웃</button>
        </div>
    </div>
);

// --- Main Layout ---

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState({ total_workers: 0, today_plans: 0, active_equipment: 0, safety_accident_free_days: 0 });
  const [plans, setPlans] = useState([]);
  const [risks, setRisks] = useState([]);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const loadData = async () => {
        try {
            const sumRes = await apiClient.get('/dashboard/summary');
            setSummary(sumRes.data);
            const planRes = await apiClient.get('/work/plans');
            setPlans(planRes.data.filter(p => p.status !== 'DONE')); 
            const riskRes = await mapApi.getRisks();
            setRisks(riskRes);
        } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-content-grid">
      {showWorkerModal && <WorkersModal onClose={() => setShowWorkerModal(false)} />}
      {showPlansModal && <TodayPlansModal plans={plans} onClose={() => setShowPlansModal(false)} onSelectJob={setSelectedJob} />}
      {showAdminModal && <AdminDataModal onClose={() => setShowAdminModal(false)} />}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showAppMenu && <AppMenuModal onClose={() => setShowAppMenu(false)} onLogout={logout} user={user} onOpenAdmin={() => { setShowAppMenu(false); setShowAdminModal(true); }} />}
      
      {/* Header with App Logo & Menu */}
      <div className="area-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight:'900', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Smart Guardian</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Welcome back, {user?.full_name} 관리자</div>
          </div>
          <button onClick={() => setShowAppMenu(true)} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px' }}>
            <Grid size={24} color="#3b82f6" />
          </button>
      </div>

      {/* Main Map Area - Prominent position */}
      <div className="area-map-group glass-panel" style={{ height: '400px', margin: '0 1.25rem 1.25rem', padding: 0, overflow: 'hidden', position: 'relative' }}>
          <MapContainer center={[37.5665, 126.9780]} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {/* Risk Zones Circles */}
            {risks.filter(r => r.lat && r.lng).map(r => (
                <Circle key={r.id} center={[r.lat, r.lng]} radius={r.radius || 20} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25 }}>
                     <Popup>
                        <div style={{ color: '#000' }}>
                           <strong>{r.name}</strong><br/>
                           Type: {r.type}
                        </div>
                     </Popup>
                </Circle>
            ))}
          </MapContainer>
          
          {/* List Overlay for Risks on Map */}
          <RiskListOverlay risks={risks} />
      </div>

      {/* Stats Area (Below map, organized in two columns on mobile if needed) */}
      <div className="area-status" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '0 1.25rem 1.25rem' }}>
        <StatCard title="출역 현황" value={`${summary.total_workers}명`} sub="금일 투입 (상세)" icon={HardHat} color="var(--accent-primary)" onClick={() => setShowWorkerModal(true)} />
        <StatCard title="금일 작업" value={`${summary.today_plans}건`} sub="진행 중 (상세)" icon={Briefcase} color="var(--accent-secondary)" onClick={() => setShowPlansModal(true)} />
        <StatCard title="가동 장비" value={`${summary.active_equipment}대`} sub="중장비 현황" icon={Truck} color="#f59e0b" />
        <StatCard title="안전 일수" value={`D+${summary.safety_accident_free_days}`} sub="무재해 달성" icon={Activity} color="#10b981" />
      </div>
    </div>
  );
};

export default DashboardLayout;
