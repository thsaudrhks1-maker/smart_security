
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ClipboardList, Map, AlertTriangle, BookOpen } from 'lucide-react';

/**
 * Worker layout (mobile-first). Max width 600px, bottom nav.
 */
const WorkerLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/worker/dashboard', icon: LayoutDashboard, label: '홈' },
    { path: '/worker/work', icon: CheckSquare, label: '내작업' },
    { path: '/worker/contents', icon: BookOpen, label: '콘텐츠' },
    { path: '/worker/attendance', icon: ClipboardList, label: '출결' },
    { path: '/worker/safety', icon: Map, label: '현장맵' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#0b1120', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: '#f1f5f9' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        {children}
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '600px',
        background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-around', padding: '12px 0 24px 0',
        zIndex: 1000, backdropFilter: 'blur(10px)',
        boxShadow: '0 -10px 15px -3px rgba(0,0,0,0.3)'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <div 
              key={item.path} 
              onClick={() => navigate(item.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: isActive ? '#3b82f6' : '#64748b', flex: 1 }}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#3b82f6' : '#64748b'} />
              <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '800' : '500' }}>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default WorkerLayout;
