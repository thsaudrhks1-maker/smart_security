import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { 
  LayoutDashboard, 
  Folder, 
  Users, 
  Building2, 
  Briefcase,
  ShieldAlert,
  FileText,
  CheckSquare,
  Globe, 
  Settings,
  Wrench,
  AlertCircle,
  LogOut,
  Megaphone
} from 'lucide-react';

/**
 * Admin용 네비게이션 사이드바
 * Dark Theme (검정 바탕 + 밝은 글씨) - 상무님 Pick
 */
const NavSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  // 메뉴 설정
  const menuConfig = [
    { category: "Main", items: [
      { icon: LayoutDashboard, label: "대시보드", path: "/admin", implemented: true },
    ]},
    { category: "Project & Work", items: [
      { icon: Folder, label: "현장 관리", path: "/admin/projects", implemented: true },
      { icon: Users, label: "근로자 관리", path: "/admin/workers", implemented: false }, 
      { icon: Building2, label: "협력사(고객사) 관리", path: "/admin/companies", implemented: true },
      { icon: Briefcase, label: "작업 관리", path: "/admin/work", implemented: false },
    ]},
    { category: "Safety & Content", items: [
      { icon: ShieldAlert, label: "안전 관제 센터", path: "/admin/map", implemented: false },
      { icon: FileText, label: "콘텐츠 관리", path: "/admin/contents", implemented: true },
      { icon: CheckSquare, label: "체크리스트 관리", path: "/admin/checklist", implemented: false },
      { icon: Globe, label: "외국인 콘텐츠 관리", path: "/admin/global", implemented: false },
    ]},
    { category: "System", items: [
      { icon: Settings, label: "유형 관리", path: "/admin/types", implemented: false },
      { icon: Wrench, label: "장비 관리", path: "/admin/equipments", implemented: false },
      { icon: Megaphone, label: "시스템 공지", path: "/admin/notice", implemented: false },
    ]}
  ];

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  const NavItem = ({ icon: Icon, label, path, implemented }) => {
    const isActive = currentPath === path || (path !== '/admin' && currentPath.startsWith(path));
    
    return (
      <button 
        onClick={() => path && navigate(path)}
        style={{ 
          width: '100%',
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          background: isActive ? '#0f172a' : 'transparent', // 더 어두운 배경으로 강조
          color: implemented ? (isActive ? '#ffffff' : '#94a3b8') : '#ef4444',
          border: 'none',
          borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer', 
          transition: 'all 0.2s',
          padding: '13px 20px',
          textAlign: 'left',
          fontSize: '0.9rem',
          fontWeight: isActive ? '600' : '400', // 선택 안된건 얇게
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = implemented ? '#cbd5e1' : '#f87171';
            e.currentTarget.style.background = '#334155';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = implemented ? '#94a3b8' : '#ef4444';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <Icon size={18} />
        <span style={{ flex: 1 }}>{label}</span>
        {!implemented && <AlertCircle size={14} color="#ef4444" />}
      </button>
    );
  };

  return (
    <nav style={{ 
      width: '260px',
      height: '100vh',
      background: '#1e293b', // Dark Slate BG
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '4px 0 10px rgba(0,0,0,0.3)'
    }}>
      {/* 헤더 */}
      <div style={{ padding: '24px 20px', background: '#0f172a', borderBottom: '1px solid #334155' }}>
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '800', 
          color: '#ffffff', 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <ShieldAlert size={26} color="#3b82f6" />
          Smart Guardian
        </h1>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', paddingLeft: '34px', letterSpacing: '0.05em' }}>
          SYSTEM ADMINISTRATOR
        </div>
      </div>

      {/* 메뉴 */}
      <div style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
        {menuConfig.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <div style={{ 
              padding: '15px 20px 8px', 
              fontSize: '0.7rem', 
              fontWeight: '700', 
              color: '#475569', 
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {group.category}
            </div>
            {group.items.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        ))}
        
        {/* 범례 */}
        <div style={{ 
          margin: '20px', 
          padding: '12px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <AlertCircle size={14} />
          <span>붉은색 메뉴는 준비 중입니다</span>
        </div>
      </div>

      {/* 하단 유저 프로필 및 로그아웃 */}
      <div style={{ padding: '16px', borderTop: '1px solid #334155', background: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#cbd5e1" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || 'GUEST'} <span style={{fontSize:'0.7rem', color:'#94a3b8', fontWeight:'normal'}}>({user?.role})</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username || 'user_id'}
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '6px', 
            background: '#334155', 
            color: '#f87171', 
            border: '1px solid #475569', 
            fontWeight: '600',
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#334155';
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.borderColor = '#475569';
          }}
        >
          <LogOut size={16} /> 로그아웃
        </button>
      </div>
    </nav>
  );
};

export default NavSidebar;
