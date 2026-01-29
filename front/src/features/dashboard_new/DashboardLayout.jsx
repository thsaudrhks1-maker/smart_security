import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, HardHat, Activity, Truck, 
  Search, Bell, MoreHorizontal,
  LayoutDashboard, FileText, Users, Briefcase, ShieldAlert, Settings, LogOut 
} from 'lucide-react';
import L from 'leaflet';

// --- Mock Data Generator ---
// In a real app, this would be fetched from our new backend API
const MOCK_WORKERS = [
  { id: 1, name: '김철수', role: '용접공', lat: 37.5665, lng: 126.9780, status: 'normal' },
  { id: 2, name: '이영희', role: '신호수', lat: 37.5663, lng: 126.9784, status: 'warning' },
  { id: 3, name: '박민수', role: '배관공', lat: 37.5667, lng: 126.9778, status: 'normal' },
  { id: 4, name: '최준호', role: '안전관리자', lat: 37.5664, lng: 126.9782, status: 'normal' },
];

const MOCK_ZONES = [
  { id: 1, name: 'Zone A (추락주의)', lat: 37.5663, lng: 126.9784, radius: 30, color: '#ef4444' },
  { id: 2, name: 'Zone B (화기작업)', lat: 37.5668, lng: 126.9775, radius: 25, color: '#f97316' },
];

const MOCK_ALERTS = [
  { id: 1, time: '14:32', msg: '이영희 작업자 위험구역 진입 감지', type: 'danger' },
  { id: 2, time: '14:15', msg: '3호기 크레인 작동 시작', type: 'info' },
  { id: 3, time: '13:50', msg: '김철수 작업자 심박수 높음 (110bpm)', type: 'warning' },
];

const MOCK_JOBS = [
  { id: 1, title: 'A구역 배관 용접', team: '배관 1팀', progress: 75, status: 'working' },
  { id: 2, title: 'B구역 자재 양중', team: '양중팀', progress: 30, status: 'pending' },
  { id: 3, title: '지하 1층 전기 배선', team: '전기팀', progress: 90, status: 'finishing' },
  { id: 4, title: '안전 시설물 점검', team: '안전팀', progress: 100, status: 'done' },
];

// --- Navigation Sidebar Component ---
const NavSidebar = () => {
  const navigate = useNavigate();
  const activePath = '/dashboard'; // 현재는 대시보드만 활성화

  const NavItem = ({ icon: Icon, path, active = false }) => (
    <button 
      onClick={() => path && navigate(path)}
      className={`btn-icon ${active ? 'active' : ''}`}
      style={{ 
        width: '48px', height: '48px', 
        borderRadius: '12px', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
        color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
        cursor: 'pointer', transition: 'all 0.2s',
        marginBottom: '0.5rem'
      }}
    >
      <Icon size={24} />
    </button>
  );

  return (
    <div className="glass-panel" style={{ 
      gridColumn: '1', gridRow: '1 / span 2', 
      width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0' 
    }}>
      {/* Logo Icon */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), #d97706)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)' }}>
           <Activity size={24} color="#1e1e1e" />
        </div>
      </div>

      {/* Main Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavItem icon={LayoutDashboard} path="/dashboard" active={true} />
        <NavItem icon={FileText} path="/notice" />
        <NavItem icon={Users} path="/workers" />
        <NavItem icon={Briefcase} path="/work" />
        <NavItem icon={ShieldAlert} path="/map" />
      </div>

      {/* Bottom Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavItem icon={Settings} path="/settings" />
        <NavItem icon={LogOut} path="/" />
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <div className="glass-panel" style={{ padding: '1.25rem' }}>
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

const JobCard = ({ job }) => (
  <div className="glass-panel" style={{ minWidth: '240px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span className="text-xs text-accent">{job.team}</span>
      <MoreHorizontal size={14} className="text-muted" />
    </div>
    <div style={{ fontWeight: '600' }}>{job.title}</div>
    <div style={{ marginTop: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span className="text-xs text-muted">진행률</span>
        <span className="text-xs">{job.progress}%</span>
      </div>
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
        <div style={{ width: `${job.progress}%`, height: '100%', background: 'var(--accent-secondary)', borderRadius: '2px' }}></div>
      </div>
    </div>
  </div>
);

// --- Main Dashboard Layout ---

const DashboardLayout = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-grid-with-nav">
      
      {/* 0. Navigation Sidebar (New) */}
      <NavSidebar />

      {/* 1. Status Panel (Modified to fit new grid) */}
      <div className="area-status">
        {/* Header Title moved here */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 className="text-xl">Smart Guardian</h2>
          <div className="text-xs text-muted">Construction Safety System</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <StatCard title="출역 현황" value="142 / 150" sub="출근율 94.6%" icon={HardHat} color="var(--accent-primary)" />
          <StatCard title="가동 중 장비" value="12 / 15" sub="3대 점검 중" icon={Truck} color="var(--accent-secondary)" />
          <StatCard title="무재해 달성" value="D+324" sub="목표까지 41일" icon={Activity} color="#10b981" />
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
         {/* ... (Map Content 유지) ... */}
         <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 999, display: 'flex', justifyContent: 'space-between' }}>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} className="text-muted" />
            <input type="text" placeholder="작업자 또는 구역 검색..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '200px' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
             <button className="glass-panel" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
               <Bell size={18} />
             </button>
          </div>
        </div>

        <MapContainer center={[37.5665, 126.9780]} zoom={18} style={{ height: '100%', width: '100%', borderRadius: '16px' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* Danger Zones */}
          {MOCK_ZONES.map(zone => (
            <Circle 
              key={zone.id} 
              center={[zone.lat, zone.lng]} 
              radius={zone.radius}
              pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.2 }}
            >
              <Popup>
                <div style={{ color: '#000' }}>
                  <strong>{zone.name}</strong><br/>
                  반경: {zone.radius}m
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Workers */}
          {MOCK_WORKERS.map(worker => (
             <Marker key={worker.id} position={[worker.lat, worker.lng]}>
               <Popup>
                 <div style={{ color: '#000' }}>
                   <strong>{worker.name}</strong> <span style={{fontSize:'0.8em', color:'#666'}}>({worker.role})</span><br/>
                   상태: {worker.status === 'warning' ? '⚠️ 주의' : '정상'}
                 </div>
               </Popup>
             </Marker>
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
            {MOCK_ALERTS.map(alert => <AlertItem key={alert.id} alert={alert} />)}
         </div>
      </div>

      {/* 4. Bottom Panel: Jobs */}
      <div className="area-bottom">
         {MOCK_JOBS.map(job => <JobCard key={job.id} job={job} />)}
      </div>

    </div>
  );
};

export default DashboardLayout;
