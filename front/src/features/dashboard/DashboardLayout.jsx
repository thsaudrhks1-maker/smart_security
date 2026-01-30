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

// Map Overlay for Risks - Sleek Side Panel Version
const RiskSidePanel = ({ risks, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div style={{ 
            position: 'absolute', top: 0, right: 0, height: '100%', 
            width: '220px', zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(15px)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            padding: '1.25rem', display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.3s ease-out',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.3)'
        }}>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} color="#ef4444" /> 위험 목록
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }} className="scroll-hide">
                {risks.length > 0 ? risks.map(r => (
                    <div key={r.id} style={{ 
                        padding: '12px', borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '700', marginBottom: '4px' }}>{r.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>{r.type}</span>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '2rem' }}>감지된 위험 없음</div>
                )}
            </div>
        </div>
    );
};


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

const AppMenuModal = ({ onClose, onLogout, user, onOpenAdmin }) => {
    const menus = [
        { icon: LayoutDashboard, label: '통합 대시보드', color: '#3b82f6', action: onClose },
        { icon: MapPin, label: '현장 맵 관제', color: '#10b981', action: onClose },
        { icon: Users, label: '인력 관리', color: '#8b5cf6', action: onClose },
        { icon: Truck, label: '장비 현황', color: '#f59e0b', action: onClose },
        { icon: ShieldAlert, label: '위험성 평가', color: '#ef4444', action: onClose },
        { icon: FileText, label: '안전 작업 허가서', color: '#06b6d4', action: onClose },
        { icon: Database, label: '데이터 센터', color: '#ec4899', action: onOpenAdmin },
        { icon: Settings, label: '시스템 설정', color: '#94a3b8', action: onClose },
    ];

    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', 
            zIndex: 99999, display: 'flex', flexDirection: 'column', 
            padding: '2rem', animation: 'fadeIn 0.3s ease-out',
            overflowY: 'auto' // 스크롤 추가
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .menu-grid-item:active { transform: scale(0.95); }
                .scroll-hide::-webkit-scrollbar { display: none; }
            `}</style>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>Smart Guardian <span style={{ color: '#3b82f6', fontSize: '1rem' }}>Menu</span></div>
                <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)' }}><X size={28} color="white" /></button>
            </div>

            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '1.25rem', width: '100%', maxWidth: '800px', margin: '0 auto', flex: 1
            }}>
                {menus.map((m, idx) => (
                    <div 
                        key={idx} 
                        onClick={m.action}
                        className="menu-grid-item"
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ 
                            width: '56px', height: '56px', borderRadius: '16px', 
                            background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                            <m.icon size={28} color={m.color} />
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0' }}>{m.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ 
                marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', 
                borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                maxWidth: '800px', width: '100%', margin: '2rem auto 0', border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user?.full_name?.[0]}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white' }}>{user?.full_name} 관리자</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.username}</div>
                    </div>
                </div>
                <button onClick={onLogout} style={{ 
                    padding: '10px 20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold', cursor: 'pointer'
                }}>
                    로그아웃
                </button>
            </div>
        </div>
    );
};

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
  const [showRiskPanel, setShowRiskPanel] = useState(false);
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
          
          {/* Toggle Button for Risk Panel */}
          <button 
            onClick={() => setShowRiskPanel(!showRiskPanel)}
            style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 1001,
                width: '44px', height: '44px', borderRadius: '12px',
                background: showRiskPanel ? '#ef4444' : 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <ShieldAlert size={22} color="white" />
            {risks.length > 0 && !showRiskPanel && (
                <span style={{ 
                    position: 'absolute', top: '-5px', right: '-5px', 
                    background: '#ef4444', color: 'white', fontSize: '0.65rem', 
                    fontWeight: '900', padding: '2px 6px', borderRadius: '10px',
                    border: '2px solid #0f172a'
                }}>{risks.length}</span>
            )}
            {showRiskPanel && <X size={22} color="white" />}
          </button>

          {/* Side Panel for Risks */}
          <RiskSidePanel risks={risks} isOpen={showRiskPanel} onClose={() => setShowRiskPanel(false)} />
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
