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
import apiClient from '../../api/client'; // apiClient directly for dashboard summary
import { workApi } from '../../api/workApi';
import { mapApi } from '../../api/mapApi';

// NavSidebar extracted to components/common/NavSidebar.jsx

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

const JobCard = ({ job }) => {
  // Derive a "Team Name" based on work type for demo purposes
  // In real app, this comes from allocations or trade field
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

// --- Main Dashboard Layout ---

const DashboardLayout = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real Data State
  const [summary, setSummary] = useState({ total_workers: 0, today_plans: 0, active_equipment: 0, safety_accident_free_days: 0 });
  const [plans, setPlans] = useState([]);
  const [risks, setRisks] = useState([]);
  const [workers, setWorkers] = useState([]);

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
            const planRes = await workApi.getPlans(); // 오늘 날짜 필터링은 백엔드 기본값 확인 필요하지만, 일단 전체 로드
            setPlans(planRes.filter(p => p.status !== 'DONE')); // 완료된 것 제외하고 표시

            // 3. Risks (Map)
            const riskRes = await mapApi.getRisks();
            setRisks(riskRes);

            // 4. Workers (Mock for now or WebSocket)
            // setWorkers(MOCK_WORKERS); 
        } catch (e) {
            console.error("Dashboard Load Error:", e);
        }
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-content-grid">
      
      {/* 1. Status Panel */}
      <div className="area-status">
        <div style={{ marginBottom: '1rem' }}>
          <h2 className="text-xl">Smart Guardian</h2>
          <div className="text-xs text-muted">Construction Safety System</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <StatCard title="출역 현황" value={`${summary.total_workers}명`} sub="금일 전체 인원" icon={HardHat} color="var(--accent-primary)" />
          <StatCard title="금일 작업" value={`${summary.today_plans}건`} sub="진행 중인 작업" icon={Briefcase} color="var(--accent-secondary)" />
          {/* 가동 중 장비 대신 무재해로 대체 (공간상) 혹은 추가 */}
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
           
           {/* Danger Zones (Risks) */}
           {/* Mock Zones for demo if API returns empty, otherwise map from API */}
           {/* {MOCK_ZONES.map(...) } -> Replace with real risks */}
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

           {/* Workers - Mock for visual only in this dashboard view */}
           <Marker position={[37.5665, 126.9780]}>
             <Popup>김반장 (관리자)</Popup>
           </Marker>
        </MapContainer>
      </div>

      {/* 3. Right Sidebar: Alerts (Mock maintained for demo effect) */}
      <div className="area-sidebar-right">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
           <h3>실시간 알림</h3>
           <span className="text-xs text-accent">Live</span>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
            {/* Mock Alerts */}
            <AlertItem alert={{ time: '14:32', msg: '위험구역 접근 감지 (A존)', type: 'danger' }} />
            <AlertItem alert={{ time: '14:15', msg: '크레인 작업 시작', type: 'info' }} />
            <AlertItem alert={{ time: '13:50', msg: '신규 작업 등록됨 (용접)', type: 'info' }} />
         </div>
      </div>

      {/* 4. Bottom Panel: Jobs (Real Data) */}
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
