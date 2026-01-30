import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, HardHat, Activity, Truck, 
  Search, Bell, MoreHorizontal, Grid, Database,
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

// --- Admin Data Modal (Excel-like View) ---
const AdminDataModal = ({ onClose }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient.get('/admin/db/workers');
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.85)', zIndex: 999999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{ width: '95%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
                 <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'10px' }}>
                            <Database color="#3b82f6" /> 통합 데이터 센터 (Workers)
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            전체 작업자 및 계정 정보 통합 조회
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#e2e8f0' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px' }}>ID</th>
                                    <th style={{ padding: '12px' }}>이름</th>
                                    <th style={{ padding: '12px' }}>직종</th>
                                    <th style={{ padding: '12px' }}>생년월일</th>
                                    <th style={{ padding: '12px' }}>연락처</th>
                                    <th style={{ padding: '12px' }}>주소</th>
                                    <th style={{ padding: '12px' }}>계정(ID)</th>
                                    <th style={{ padding: '12px' }}>권한</th>
                                    <th style={{ padding: '12px' }}>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, idx) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '10px' }}>{row.id}</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.name}</td>
                                        <td style={{ padding: '10px' }}>{row.trade}</td>
                                        <td style={{ padding: '10px' }}>{row.birth_date}</td>
                                        <td style={{ padding: '10px' }}>{row.phone_number}</td>
                                        <td style={{ padding: '10px' }}>{row.address}</td>
                                        <td style={{ padding: '10px', color: '#94a3b8' }}>{row.username}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ 
                                                background: row.role==='manager'?'#8b5cf6':'rgba(255,255,255,0.1)', 
                                                padding:'2px 6px', borderRadius:'4px', fontSize:'0.8rem' 
                                            }}>{row.role}</span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                             <span style={{ 
                                                color: row.status==='ON_SITE'?'#10b981':'#94a3b8'
                                            }}>{row.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
const AppMenuModal = ({ onClose, onLogout, user, onOpenAdmin }) => {
    const menuItems = [
        { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, color: '#3b82f6', action: onClose },
        { id: 'admin_data', label: '데이터 센터', icon: Database, color: '#ec4899', action: onOpenAdmin },
        { id: 'workers', label: '작업자 관리', icon: Users, color: '#10b981', action: () => alert('작업자 관리 페이지 준비중') },
        { id: 'work', label: '작업 계획', icon: Briefcase, color: '#f59e0b', action: () => alert('작업 계획 페이지 준비중') },
        { id: 'map', label: '현장 지도', icon: Search, color: '#8b5cf6', action: () => alert('지도 관리 페이지 준비중') },
        { id: 'sos', label: '긴급 호출', icon: ShieldAlert, color: '#ef4444', action: () => alert('긴급 호출 기능 테스트') },
        { id: 'settings', label: '시스템 설정', icon: Settings, color: '#64748b', action: () => alert('설정 페이지 준비중') },
    ];

    const getAge = (birthDate) => {
        if (!birthDate) return '';
        const year = parseInt(birthDate.split('-')[0]);
        const currentYear = new Date().getFullYear();
        return `${currentYear - year}세`;
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(15, 23, 42, 0.98)', zIndex: 99999, 
            backdropFilter: 'blur(12px)',
            overflowY: 'auto', // 스크롤 활성화
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                minHeight: '100%', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px 0' // 위아래 여백 확보
            }}>
                {/* Styled Close Button */}
                <button 
                    onClick={onClose} 
                    className="btn-close-hover"
                    style={{ 
                        position: 'absolute', top: '24px', right: '24px',
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        borderRadius: '50%', width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'background 0.2s',
                        zIndex: 100 // 맨 위로
                    }} 
                >
                    <X size={24} color="white" />
                </button>

                <div style={{ marginBottom: '2.5rem', textAlign: 'center', marginTop: '20px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.2rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Smart Guardian
                    </h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Safety Management System</p>
                </div>

                {/* Grid Menu */}
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', // 모바일에선 2열이 안전함
                    width: '85%', maxWidth: '400px',
                    marginBottom: '2rem'
                }}>
                    {menuItems.map(item => (
                        <div key={item.id} onClick={item.action} style={{
                            background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.2rem',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
                            cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'transform 0.2s, background 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ 
                                background: `${item.color}25`, padding: '12px', borderRadius: '16px',
                                color: item.color, boxShadow: `0 0 15px ${item.color}20`
                            }}>
                                <item.icon size={28} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* User Profile Section */}
                <div style={{ width: '85%', maxWidth: '400px' }}>
                     <div style={{ 
                        background: 'rgba(30, 41, 59, 0.8)', borderRadius: '16px', padding: '1rem 1.25rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ 
                                width: '48px', height: '48px', 
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                                borderRadius: '14px', 
                                display:'flex', alignItems:'center', justifyContent:'center', 
                                fontWeight:'bold', fontSize: '1.4rem', color: 'white',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                            }}>
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {user?.full_name}
                                    {user?.birth_date && (
                                        <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#94a3b8', background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                                            {getAge(user.birth_date)}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                                    {(user?.role === 'manager' || user?.role === 'admin') ? '현장 관리자' : '현장 작업자'}
                                </div>
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onLogout(); }} style={{ 
                            background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', 
                            padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#f87171'; }}
                        >
                            로그아웃
                        </button>
                    </div>
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
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data on Mount
  useEffect(() => {
    // ... (Data Loading Logic preserved) ...
    const loadData = async () => {
        try {
            const sumRes = await apiClient.get('/dashboard/summary');
            setSummary(sumRes.data);
            const planRes = await workApi.getPlans();
            setPlans(planRes.filter(p => p.status !== 'DONE')); 
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
      {showAdminModal && <AdminDataModal onClose={() => setShowAdminModal(false)} />}
      {showAppMenu && <AppMenuModal 
          onClose={() => setShowAppMenu(false)} 
          onLogout={logout} 
          user={user} 
          onOpenAdmin={() => { setShowAppMenu(false); setShowAdminModal(true); }}
      />}
      
      {/* 1. Status Panel (Header Area) */}
      <div className="area-status">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="text-xl" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>Smart Guardian</h2>
            <div style={{ marginTop: '4px', fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 'bold' }}>{user?.full_name || user?.username}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                   {(user?.role === 'manager' || user?.role === 'admin') ? '현장 관리자' : '현장 작업자'}
                </span>
            </div>
          </div>
          
          {/* Only Grid Menu Button */}
          <button 
                onClick={() => setShowAppMenu(true)} 
                className="btn-icon" 
                style={{ 
                    padding: '8px', color: 'white', 
                    background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }} 
                title="전체 메뉴"
            >
                <Grid size={22} />
            </button>
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
