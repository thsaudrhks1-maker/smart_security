import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, Briefcase, ShieldAlert, Settings, LogOut, Folder 
} from 'lucide-react';
import '../../features/dashboard/Dashboard.css';

const NavSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const NavItem = ({ icon: Icon, path }) => {
    // path가 현재 경로에 포함되면 active 처리
    const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path));
    
    return (
      <button 
        onClick={() => path && navigate(path)}
        style={{ 
          flex: 1,
          height: '100%',
          border: 'none',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'transparent',
          color: isActive ? '#f97316' : '#94a3b8',
          cursor: 'pointer', 
          transition: 'all 0.2s',
          padding: '8px 0',
          position: 'relative'
        }}
      >
        <div style={{
          padding: '8px',
          borderRadius: '12px',
          background: isActive ? '#fff7ed' : 'transparent',
          marginBottom: '2px'
        }}>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        {isActive && (
          <div style={{
            position: 'absolute',
            bottom: '0',
            width: '20px',
            height: '3px',
            background: '#f97316',
            borderRadius: '2px 2px 0 0'
          }} />
        )}
      </button>
    );
  };

  return (
    <nav style={{ 
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      height: '70px',
      background: 'white',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
      paddingBottom: 'safe-area-inset-bottom' // 아이폰 하단 바 대응
    }}>
      <NavItem icon={LayoutDashboard} path="/dashboard" />
      <NavItem icon={Folder} path="/projects" />
      <NavItem icon={Briefcase} path="/work" />
      <NavItem icon={ShieldAlert} path="/map" />
      <NavItem icon={LogOut} path="/" />
    </nav>
  );
};

export default NavSidebar;
