
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Folder, Users, Building2,
  ShieldAlert, FileText, CheckSquare, Settings,
  LogOut, ShieldCheck, Briefcase, Globe, Wrench, ChevronRight
} from 'lucide-react';

const NavSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuGroups = [
    { category: "Main", items: [
      { icon: LayoutDashboard, label: "대시보드 현황", path: "/admin/dashboard", implemented: true },
      { icon: Folder, label: "프로젝트 관리", path: "/admin/projects", implemented: true },
      { icon: Building2, label: "발주/협력사 관리", path: "/admin/companies", implemented: true },
      { icon: Users, label: "전체 사용자 관리", path: "/admin/workers", implemented: false },
    ]},
    { category: "Operation", items: [
      { icon: Briefcase, label: "공종 및 직종 관리", path: "/admin/work", implemented: false },
      { icon: ShieldAlert, label: "현장 안전 맵 설정", path: "/admin/map", implemented: false },
      { icon: FileText, label: "콘텐츠/공지 관리", path: "/admin/contents", implemented: true },
      { icon: CheckSquare, label: "안전 점검표 관리", path: "/admin/checklist", implemented: false },
    ]},
    { category: "System", items: [
      { icon: Settings, label: "안전 유형 설정", path: "/admin/types", implemented: false },
      { icon: Wrench, label: "관리 장비 설정", path: "/admin/equipments", implemented: false },
      { icon: Globe, label: "시스템 언어 설정", path: "/admin/global", implemented: false },
    ]}
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      width: '280px', height: '100%', background: 'white',
      borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
      padding: '1.5rem 1rem'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px 2.5rem' }}>
        <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={24} color="white" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Smart Admin</h1>
      </div>

      {/* Menus */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {menuGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', paddingLeft: '12px', marginBottom: '12px', letterSpacing: '0.05em' }}>
              {group.category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {group.items.map((item, i) => (
                <NavLink
                  key={i}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '12px', textDecoration: 'none',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#3b82f6' : (item.implemented ? '#475569' : '#cbd5e1'),
                    fontWeight: isActive ? '800' : '600', transition: 'all 0.2s',
                    cursor: item.implemented ? 'pointer' : 'not-allowed'
                  })}
                  onClick={(e) => !item.implemented && e.preventDefault()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <item.icon size={20} />
                    <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                  </div>
                  {item.implemented && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '12px', border: 'none', background: '#fef2f2',
            color: '#ef4444', borderRadius: '12px', fontWeight: '800',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <LogOut size={18} /> 로그아웃
        </button>
      </div>
    </div>
  );
};

export default NavSidebar;
