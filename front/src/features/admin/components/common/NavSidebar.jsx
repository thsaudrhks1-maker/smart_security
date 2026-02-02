import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folder, 
  Briefcase, 
  Users, 
  ShieldAlert,
  LogOut,
  AlertCircle,
  Building2,
  FileText,
  CheckSquare,
  Globe,
  Settings,
  Wrench,
  Megaphone
} from 'lucide-react';

/**
 * Admin용 네비게이션 사이드바
 * 화이트 베이스 디자인 (Clean & Modern)
 */
const NavSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 메뉴 설정
  const menuConfig = [
    { category: "Main", items: [
      { icon: LayoutDashboard, label: "대시보드", path: "/admin", implemented: true },
    ]},
    { category: "Project & Work", items: [
      { icon: Folder, label: "현장 관리", path: "/admin/projects", implemented: true },
      { icon: Users, label: "근로자 관리", path: "/admin/workers", implemented: false }, 
      { icon: Building2, label: "협력사(고객사) 관리", path: "/admin/companies", implemented: false },
      { icon: Briefcase, label: "작업 관리", path: "/admin/work", implemented: false },
    ]},
    { category: "Safety & Content", items: [
      { icon: ShieldAlert, label: "안전 관제 센터", path: "/admin/map", implemented: false },
      { icon: FileText, label: "콘텐츠 관리", path: "/admin/contents", implemented: false },
      { icon: CheckSquare, label: "체크리스트 관리", path: "/admin/checklist", implemented: false },
      { icon: Globe, label: "외국인 콘텐츠 관리", path: "/admin/global", implemented: false },
    ]},
    { category: "System", items: [
      { icon: Settings, label: "유형 관리", path: "/admin/types", implemented: false },
      { icon: Wrench, label: "장비 관리", path: "/admin/equipments", implemented: false },
      { icon: Megaphone, label: "시스템 공지", path: "/admin/notice", implemented: false },
    ]}
  ];

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
          background: isActive ? '#f0f9ff' : 'transparent',
          color: implemented ? (isActive ? '#0284c7' : '#475569') : '#ef4444',
          border: 'none',
          borderLeft: isActive ? '3px solid #0284c7' : '3px solid transparent',
          cursor: 'pointer', 
          transition: 'all 0.2s',
          padding: '13px 20px',
          textAlign: 'left',
          fontSize: '0.9rem',
          fontWeight: isActive ? '600' : '500',
          position: 'relative'
        }}
        onMouseEnter={(e) => !implemented && (e.currentTarget.style.background = '#fef2f2')}
        onMouseLeave={(e) => !implemented && !isActive && (e.currentTarget.style.background = 'transparent')}
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
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
    }}>
      {/* 헤더 */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #f3f4f6' }}>
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '800', 
          color: '#111827', 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <ShieldAlert size={26} color="#0284c7" />
          Smart Guardian
        </h1>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px', paddingLeft: '34px' }}>
          Total Safety Solution
        </div>
      </div>

      {/* 메뉴 */}
      <div style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
        {menuConfig.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <div style={{ 
              padding: '10px 20px 5px', 
              fontSize: '0.7rem', 
              fontWeight: '700', 
              color: '#cbd5e1', 
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
          background: '#fef2f2', 
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertCircle size={14} />
          <span>붉은색 메뉴는 준비 중입니다</span>
        </div>
      </div>

      {/* 하단 유저 프로필 및 로그아웃 */}
      <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#64748b" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>시스템 관리자</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>admin@safe.com</div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '6px', 
            background: 'white', 
            color: '#dc2626', 
            border: '1px solid #e2e8f0', 
            fontWeight: '600',
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.borderColor = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <LogOut size={16} /> 로그아웃
        </button>
      </div>
    </nav>
  );
};
export default NavSidebar;
