import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, Briefcase, ShieldAlert, Settings, LogOut, Folder 
} from 'lucide-react';

const NavSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const NavItem = ({ icon: Icon, label, path }) => {
    // Admin 경로는 /admin 으로 시작함
    const isActive = currentPath === path || (path !== '/admin' && currentPath.startsWith(path));
    
    return (
      <button 
        onClick={() => path && navigate(path)}
        style={{ 
          width: '100%',
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          color: isActive ? '#3b82f6' : '#64748b',
          border: 'none',
          borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer', 
          transition: 'all 0.2s',
          padding: '12px 20px',
          textAlign: 'left',
          fontSize: '0.95rem',
          fontWeight: isActive ? '600' : '500'
        }}
      >
        <Icon size={20} />
        {label}
      </button>
    );
  };

  return (
    <nav style={{ 
      width: '260px',
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={28} color="#3b82f6" />
          Smart Guardian
        </h1>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', paddingLeft: '36px' }}>Admin Console</div>
      </div>

      <div style={{ padding: '20px 0', flex: 1 }}>
        <div style={{ padding: '0 20px 10px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Main Menu</div>
        <NavItem icon={LayoutDashboard} label="대시보드" path="/admin" />
        <NavItem icon={Folder} label="프로젝트 관리" path="/admin/projects" />
        <NavItem icon={Briefcase} label="작업 관리" path="/admin/work" />
        <NavItem icon={Users} label="작업자 관리" path="/admin/workers" />
        <NavItem icon={ShieldAlert} label="안전 관제" path="/admin/map" />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
        <button 
          onClick={() => navigate('/')} // 로그아웃 처리 필요 (현재는 홈으로 이동)
          style={{ 
            width: '100%', padding: '10px', borderRadius: '8px', 
            background: '#fef2f2', color: '#ef4444', 
            border: '1px solid #fee2e2', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <LogOut size={18} /> 로그아웃
        </button>
      </div>
    </nav>
  );
};

export default NavSidebar;
