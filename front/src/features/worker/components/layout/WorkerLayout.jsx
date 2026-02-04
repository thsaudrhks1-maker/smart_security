import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ClipboardList, Map, AlertTriangle } from 'lucide-react';

/**
 * 작업자용 레이아웃(모바일)
 * - 좁은 레이아웃 (최대 600px)
 * - 하단 네비게이션 탭바 적용
 */
const WorkerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/worker', icon: LayoutDashboard, label: '홈' },
    { path: '/worker/work', icon: CheckSquare, label: '작업' },
    { path: '/worker/attendance', icon: ClipboardList, label: '출근' },
    { path: '/worker/safety', icon: Map, label: '안전지도' },
    { path: '/worker/report', icon: AlertTriangle, label: '신고' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f1f5f9', height: '100vh', maxHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '80px', WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '600px',
        background: 'white', borderTop: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-around', padding: '10px 0',
        zIndex: 1000, boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/worker' && location.pathname.startsWith(item.path));
          return (
            <div 
              key={item.path} 
              onClick={() => navigate(item.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: isActive ? '#3b82f6' : '#94a3b8', flex: 1 }}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '0.75rem', fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default WorkerLayout;
