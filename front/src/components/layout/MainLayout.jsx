
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, HardHat, 
  ShieldAlert, ClipboardCheck, Settings, LogOut,
  Bell, Grid, Info, ShieldCheck, Flag, Smartphone, Wrench, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // 구현 여부 플래그 추가 (isImplemented)
  const menuItems = [
    { title: 'MAIN', items: [
      { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={18} />, path: `/${user?.role}/dashboard`, isImplemented: true }
    ]},
    { title: 'PROJECT & WORK', items: [
      { id: 'projects', label: '현장 관리', icon: <Building2 size={18} />, path: '/admin/projects', isImplemented: true },
      { id: 'workers', label: '근로자 관리', icon: <Users size={18} />, path: '/admin/workers', isImplemented: false },
      { id: 'companies', label: '협력사(고객사) 관리', icon: <Building2 size={18} />, path: '/admin/companies', isImplemented: true },
      { id: 'attendance', label: '출역 현황', icon: <ClipboardCheck size={18} />, path: '/admin/attendance', isImplemented: true },
      { id: 'tasks', label: '작업 관리', icon: <ClipboardCheck size={18} />, path: '/admin/tasks', isImplemented: false }
    ]},
    { title: 'SAFETY & CONTENT', items: [
      { id: 'safety', label: '안전 관제 센터', icon: <ShieldAlert size={18} />, path: '/admin/safety', isImplemented: true },
      { id: 'manuals', label: '콘텐츠 관리', icon: <Flag size={18} />, path: '/admin/manuals', isImplemented: false },
      { id: 'checklist', label: '체크리스트 관리', icon: <ClipboardCheck size={18} />, path: '/admin/checklist', isImplemented: false },
      { id: 'foreign', label: '외국인 콘텐츠 관리', icon: <Smartphone size={18} />, path: '/admin/foreign', isImplemented: false }
    ]},
    { title: 'SYSTEM', items: [
      { id: 'types', label: '유형 관리', icon: <Grid size={18} />, path: '/admin/types', isImplemented: false },
      { id: 'tools', label: '장비 관리', icon: <Wrench size={18} />, path: '/admin/tools', isImplemented: false },
      { id: 'notices', label: '시스템 공지', icon: <MessageSquare size={18} />, path: '/admin/notices', isImplemented: false }
    ]}
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '2rem 1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
            <ShieldCheck size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>Smart Guardian</h1>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, textTransform: 'uppercase', fontWeight: '700' }}>System Administrator</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 1.25rem', overflowY: 'auto' }}>
          {menuItems.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '1.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '800', paddingLeft: '0.75rem', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>{section.title}</p>
              {section.items.map(item => (
                <div 
                  key={item.id}
                  onClick={() => item.isImplemented && navigate(item.path)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '12px', 
                    cursor: item.isImplemented ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                    background: location.pathname.startsWith(item.path) ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: location.pathname.startsWith(item.path) ? '#60a5fa' : '#94a3b8',
                    marginBottom: '4px',
                    opacity: item.isImplemented ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.icon}
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.label}</span>
                  </div>
                  {/* 빨간색 미구현 표시 아이콘 */}
                  {!item.isImplemented && (
                    <Info size={14} color="#ef4444" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Status Message */}
        <div style={{ margin: '0 1.25rem 1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
             🚫 분석 메뉴는 준비 중입니다
          </p>
        </div>

        {/* User Profile */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #475569' }}>
               <Users size={20} color="#94a3b8" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{user?.full_name || '김철수 소장'}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{user?.role || 'admin'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ width: '100%', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div style={{ width: '280px' }}></div>

      {/* Main Content Area */}
      <main style={{ flex: 1, minHeight: '100vh', background: '#f8fafc' }}>
        <header style={{ height: '70px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2.5rem', gap: '1.75rem', position: 'sticky', top: 0, zIndex: 90 }}>
          <Bell size={20} color="#64748b" style={{ cursor: 'pointer' }} />
          <Grid size={20} color="#64748b" style={{ cursor: 'pointer' }} />
        </header>
        <div style={{ padding: '3rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
