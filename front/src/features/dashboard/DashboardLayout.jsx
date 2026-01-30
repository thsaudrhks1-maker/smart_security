import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, HardHat, Activity, Truck, 
  Search, Bell, MoreHorizontal, Grid,
  LayoutDashboard, FileText, Users, Briefcase, ShieldAlert, Settings, LogOut, X
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
    style={{ padding: '1.25rem', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s' }}
    onClick={onClick}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'scale(1.02)')}
    onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'scale(1)')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span className="text-muted text-sm">{title}</span>
      <Icon size={18} color={color} />
    </div>
    <div className="text-2xl" style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{value}</div>
    <div className="text-xs" style={{ color: color }}>{sub}</div>
  </div>
);

const AlertItem = ({ alert }) => (
  <div className="glass-panel" style={{ padding: '1rem', borderLeft: `3px solid ${alert.type === 'danger' ? 'var(--accent-danger)' : 'var(--accent-secondary)'}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
      <span className="text-xs text-muted">{alert.time}</span>
      {alert.type === 'danger' && <AlertTriangle size={14} color="var(--accent-danger)" />}
    </div>
    <div className="text-sm">{alert.msg}</div>
  </div>
);

const JobCard = ({ job }) => {
  const getTeamName = (type) => {
      if (type.includes('용접') || type.includes('배관')) return '설비팀';
      if (type.includes('전기')) return '전기팀';
      if (type.includes('양중') || type.includes('크레인')) return '양중팀';
      if (type.includes('안전')) return '안전팀';
      return '건축팀';
  };

  const statusMap = {
      'PLANNED': { label: '예정', color: 'var(--text-muted)' },
      'IN_PROGRESS': { label: '진행중', color: 'var(--accent-secondary)' },
      'DONE': { label: '완료', color: 'var(--success)' },
  };

  const st = statusMap[job.status] || statusMap['PLANNED'];

  return (
    <div className="glass-panel" style={{ minWidth: '240px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: job.calculated_risk_score >= 70 ? '3px solid var(--accent-danger)' : '3px solid var(--success)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="text-xs text-accent">{getTeamName(job.work_type)}</span>
        <span className="text-xs" style={{ color: st.color, border: `1px solid ${st.color}`, padding: '1px 6px', borderRadius: '4px' }}>{st.label}</span>
      </div>
      
      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{job.description}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px' }}>
          <Briefcase size={12}/> {job.work_type}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span className="text-xs text-muted">진행상태</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
          <div style={{ 
              width: job.status === 'DONE' ? '100%' : (job.status === 'IN_PROGRESS' ? '60%' : '0%'), 
              height: '100%', 
              background: st.color, 
              borderRadius: '2px', 
              transition: 'width 0.5s ease'
          }}></div>
        </div>
      </div>
    </div>
  );
};

// --- Worker List Modal ---
const WorkersModal = ({ onClose }) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, WORKING, REST
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await apiClient.get('/dashboard/workers/today');
                setWorkers(res.data);
            } catch (err) {
                console.error(err);
                alert("명단 로딩 실패");
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, []);

    const filteredWorkers = workers.filter(w => {
        if (filter === 'WORKING') return w.today_status === 'WORKING';
        if (filter === 'REST') return w.today_status === 'REST';
        return true;
    });

    const getAge = (birthDate) => {
        if (!birthDate) return '-세';
        const year = parseInt(birthDate.split('-')[0]);
        const currentYear = new Date().getFullYear();
        return `${currentYear - year}세`;
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: '#1e293b' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>📋 금일 인력 현황</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            총 {workers.length}명 / 출역 {workers.filter(w=>w.today_status==='WORKING').length}명
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>
                
                {/* 탭 필터 */}
                <div style={{ display: 'flex', gap: '10px', padding: '10px 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button 
                        onClick={() => setFilter('ALL')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: filter==='ALL'?'var(--accent-primary)':'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                    >전체 ({workers.length})</button>
                    <button 
                        onClick={() => setFilter('WORKING')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: filter==='WORKING'?'var(--success)':'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                    >출역중 ({workers.filter(w=>w.today_status==='WORKING').length})</button>
                </div>

                <div style={{ padding: '1rem', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {filteredWorkers.map((w) => (
                                <li key={w.id} style={{ 
                                    padding: '1rem', marginBottom: '0.8rem', background: 'rgba(255,255,255,0.03)', 
                                    borderRadius: '8px', borderLeft: `4px solid ${w.today_status==='WORKING' ? 'var(--success)' : 'gray'}`
                                }}>
                                    {/* 요약 정보 (항상 표시) */}
                                    <div 
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{w.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.trade} | {getAge(w.birth_date)}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {w.today_status === 'WORKING' && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                                                    {w.today_work} ({w.today_role})
                                                </span>
                                            )}
                                            <div className="badge" style={{ 
                                                background: w.today_status === 'WORKING' ? 'var(--success)' : 'rgba(255,255,255,0.1)', 
                                                color: w.today_status === 'WORKING' ? 'black' : 'gray' 
                                            }}>
                                                {w.today_status === 'WORKING' ? '작업중' : '대기'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 상세 정보 (클릭 시 확장) */}
                                    {expandedId === w.id && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <div>📞 {w.phone_number || '정보없음'}</div>
                                            <div>🎂 {w.birth_date}</div>
                                            <div style={{ gridColumn: 'span 2' }}>🏠 {w.address || '주소 미등록'}</div>
                                            <div style={{ gridColumn: 'span 2',color: 'white' }}>
                                                {w.today_status === 'WORKING' 
                                                    ? `✅ 금일 [${w.today_work}] 현장에 ${w.today_role}(으)로 투입되었습니다.` 
                                                    : `💤 금일 배정된 작업이 없습니다.`
                                                }
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- App Menu Modal (All Features) ---
const AppMenuModal = ({ onClose, onLogout, user }) => {
    const menuItems = [
        { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, color: '#3b82f6', action: onClose },
        { id: 'workers', label: '작업자 관리', icon: Users, color: '#10b981', action: () => alert('작업자 관리 페이지 준비중') },
        { id: 'work', label: '작업 계획', icon: Briefcase, color: '#f59e0b', action: () => alert('작업 계획 페이지 준비중') },
        { id: 'map', label: '현장 지도', icon: Search, color: '#8b5cf6', action: () => alert('지도 관리 페이지 준비중') },
        { id: 'sos', label: '긴급 호출', icon: ShieldAlert, color: '#ef4444', action: () => alert('긴급 호출 기능 테스트') },
        { id: 'settings', label: '시스템 설정', icon: Settings, color: '#64748b', action: () => alert('설정 페이지 준비중') },
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(15, 23, 42, 0.95)', zIndex: 99999, 
            backdropFilter: 'blur(10px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px' }} className="btn-icon">
                <X size={32} color="white" />
            </button>

            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Smart Guardian</h2>
                <p className="text-muted">전체 메뉴</p>
            </div>

            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', 
                width: '90%', maxWidth: '500px' 
            }}>
                {menuItems.map(item => (
                    <div key={item.id} onClick={item.action} style={{
                        background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                        cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                        transition: '0.2s'
                    }}>
                        <div style={{ 
                            background: `${item.color}20`, padding: '12px', borderRadius: '12px',
                            color: item.color
                        }}>
                            <item.icon size={32} />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.label}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', width: '90%', maxWidth: '500px' }}>
                 <div style={{ 
                    background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' }}>
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{user?.full_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.role}</div>
                        </div>
                    </div>
                    <button onClick={onLogout} style={{ 
                        background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', 
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                    }}>
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Layout ---

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real Data State
  const [summary, setSummary] = useState({ total_workers: 0, today_plans: 0, active_equipment: 0, safety_accident_free_days: 0 });
  const [plans, setPlans] = useState([]);
  const [risks, setRisks] = useState([]);
  
  // Modal State
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showAppMenu, setShowAppMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data on Mount
  useEffect(() => {
    const loadData = async () => {
        try {
            // 1. Dashboard Summary
            const sumRes = await apiClient.get('/dashboard/summary');
            setSummary(sumRes.data);

            // 2. Today's Plans
            const planRes = await workApi.getPlans();
            setPlans(planRes.filter(p => p.status !== 'DONE')); 

            // 3. Risks (Map)
            const riskRes = await mapApi.getRisks();
            setRisks(riskRes);
        } catch (e) {
            console.error("Dashboard Load Error:", e);
        }
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-content-grid">
      {/* Modals */}
      {showWorkerModal && <WorkersModal onClose={() => setShowWorkerModal(false)} />}
      {showAppMenu && <AppMenuModal onClose={() => setShowAppMenu(false)} onLogout={logout} user={user} />}
      
      {/* 1. Status Panel */}
      <div className="area-status">
        <div style={{ marginBottom: '1rem' }}>
          <h2 className="text-xl">Smart Guardian</h2>
          <div className="text-sm text-accent" style={{ marginTop:'4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>안녕하세요, {user?.full_name || user?.username}님</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={() => setShowAppMenu(true)} 
                    className="btn-icon" 
                    style={{ padding: '4px', color: 'var(--text-muted)' }} 
                    title="전체 메뉴"
                >
                    <Grid size={20} />
                </button>
                <button 
                    onClick={logout} 
                    className="btn-icon" 
                    style={{ padding: '4px', color: 'var(--text-muted)' }} 
                    title="로그아웃"
                >
                    <LogOut size={20} />
                </button>
              </div>
          </div>
          <div className="text-xs text-muted" style={{ marginTop:'2px' }}>
              {(user?.role === 'manager' || user?.role === 'admin') ? '현장 관리자 (Manager)' : '현장 작업자 (Worker)'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <StatCard 
            title="출역 현황" 
            value={`${summary.total_workers}명`} 
            sub="금일 투입 인원 (Click 상세)" 
            icon={HardHat} 
            color="var(--accent-primary)" 
            onClick={() => setShowWorkerModal(true)} // Click Event
          />
          <StatCard title="금일 작업" value={`${summary.today_plans}건`} sub="진행 중인 작업" icon={Briefcase} color="var(--accent-secondary)" />
          <StatCard title="가동 장비" value={`${summary.active_equipment}대`} sub="크레인/리프트 등" icon={Truck} color="#f59e0b" />
          <StatCard title="무재해 현황" value={`D+${summary.safety_accident_free_days}`} sub="목표 달성 순항 중" icon={Activity} color="#10b981" />
        </div>
        
        <div className="glass-panel" style={{ marginTop: 'auto', padding: '1.25rem' }}>
           <div className="text-xs text-muted">System Status</div>
           <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
             <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
             Online
           </div>
           <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>Updated: {currentTime.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* 2. Main Map Area */}
      <div className="area-map glass-panel" style={{ border: 'none', position: 'relative' }}>
         <MapContainer center={[37.5665, 126.9780]} zoom={18} style={{ height: '100%', width: '100%', borderRadius: '16px' }} zoomControl={false}>
           <TileLayer
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
             url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
           />
           
           {risks.map(risk => (
             <Circle 
               key={risk.id} 
               center={[risk.lat, risk.lng]} 
               radius={risk.radius || 10}
               pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }}
             >
               <Popup>
                 <div style={{ color: '#000' }}>
                   <strong>{risk.name}</strong><br/>
                   {risk.type}
                 </div>
               </Popup>
             </Circle>
           ))}
        </MapContainer>
      </div>

      {/* 3. Right Sidebar: Alerts */}
      <div className="area-sidebar-right">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
           <h3>실시간 알림</h3>
           <span className="text-xs text-accent">Live</span>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
            <AlertItem alert={{ time: '14:32', msg: '위험구역 접근 감지 (A존)', type: 'danger' }} />
            <AlertItem alert={{ time: '14:15', msg: '크레인 작업 시작', type: 'info' }} />
            <AlertItem alert={{ time: '13:50', msg: '신규 작업 등록됨 (용접)', type: 'info' }} />
         </div>
      </div>

      {/* 4. Bottom Panel: Jobs */}
      <div className="area-bottom">
         {plans.length === 0 ? (
             <div style={{color:'gray', padding:'1rem'}}>진행 중인 작업이 없습니다.</div>
         ) : (
             plans.map(plan => <JobCard key={plan.id} job={plan} />)
         )}
      </div>

    </div>
  );
};

export default DashboardLayout;
