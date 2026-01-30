import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, Briefcase, ShieldAlert, Settings, LogOut, Activity 
} from 'lucide-react';
import '../../features/dashboard/Dashboard.css'; // 스타일 재사용

const NavSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const NavItem = ({ icon: Icon, path, activePath }) => {
    // path가 현재 경로에 포함되면 active 처리 (단, 루트/대시보드 구분)
    const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path));
    
    return (
      <button 
        onClick={() => path && navigate(path)}
        className={`btn-icon ${isActive ? 'active' : ''}`}
        style={{ 
          width: '48px', height: '48px', 
          borderRadius: '12px', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
          cursor: 'pointer', transition: 'all 0.2s',
          marginBottom: '0.5rem'
        }}
        title={path}
      >
        <Icon size={24} />
      </button>
    );
  };

  return (
    <nav className="sidebar-panel glass-panel" style={{ zIndex: 1000 }}>
      {/* Logo Icon (Click to Home) */}
      <div className="logo-container" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), #d97706)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)' }}>
           <Activity size={24} color="#1e1e1e" />
        </div>
      </div>

      {/* Main Menu */}
      <div className="nav-menu-main">
        <NavItem icon={LayoutDashboard} path="/dashboard" />
        {/* <NavItem icon={FileText} path="/notice" /> */}
        {/* <NavItem icon={Users} path="/workers" /> */}
        <NavItem icon={Briefcase} path="/work" />
        <NavItem icon={ShieldAlert} path="/map" />
      </div>

      {/* Bottom Menu */}
      <div className="nav-menu-bottom">
        {/* <NavItem icon={Settings} path="/settings" /> */}
        <NavItem icon={LogOut} path="/" />
      </div>
    </nav>
  );
};

export default NavSidebar;
