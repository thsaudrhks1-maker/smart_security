import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ClipboardCheck, 
  ClipboardList,
  LogOut, 
  HardHat,
  FileText,
  ShieldAlert,
  MapPin,
  Map,
  GraduationCap,
  Megaphone,
  Bell
} from 'lucide-react';

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const menu = [
    { label: '대시보드', icon: LayoutDashboard, path: '/manager' },
    { label: '일일 작업 계획', icon: ClipboardList, path: '/manager/work' },
    { label: '작업 위치', icon: Map, path: '/manager/locations' },
    { label: '협력사 관리', icon: Briefcase, path: '/manager/companies' },
    { label: '근로자 관리', icon: Users, path: '/manager/workers' },
    { label: '출역 관리', icon: ClipboardCheck, path: '/manager/attendance' },
    { label: '안전정보 열람현황', icon: FileText, path: '/manager/safety-info' },
    { label: '위반자 등록/현황', icon: ShieldAlert, path: '/manager/violations' },
    { label: '근로자 위치확인', icon: MapPin, path: '/manager/location' },
    { label: '안전교육 현황', icon: GraduationCap, path: '/manager/education' },
    { label: '현장 공지', icon: Megaphone, path: '/manager/notice' },
    { label: '긴급 알림', icon: Bell, path: '/manager/emergency' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* 사이드바 (Manager 전용 - Dark Theme 적용) */}
      <aside style={{ 
        width: '260px', 
        height: '100vh',
        background: '#1e293b', // Admin과 동일한 Dark Background
        color: '#ffffff',
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto',
        boxShadow: '4px 0 10px rgba(0,0,0,0.3)',
        zIndex: 10
      }}>
        {/* 헤더 */}
        <div style={{ padding: '24px', background: '#0f172a', borderBottom: '1px solid #334155' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <HardHat size={28} color="#f59e0b" /> {/* 안전모 아이콘 유지 */}
            Smart Site
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', paddingLeft: '36px', letterSpacing: '0.05em' }}>
            PROJECT MANAGER
          </div>
        </div>

        {/* 메뉴 영역 */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {menu.map((item) => {
            const isActive = path === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '13px 24px',
                  background: isActive ? '#0f172a' : 'transparent', // 활성화 시 더 어두운 배경
                  color: isActive ? '#ffffff' : '#94a3b8', // 활성화 시 흰색, 평소 회색
                  border: 'none',
                  borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent', // 포인트 컬러: 안전 주황색
                  fontWeight: isActive ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.background = '#334155';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={20} color={isActive ? '#f59e0b' : 'currentColor'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* 하단 로그아웃 */}
        <div style={{ padding: '16px', borderTop: '1px solid #334155', background: '#0f172a' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#334155',
              color: '#f87171',
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
      </aside>

      {/* 메인 콘텐츠 */}
      <main style={{ flex: 1, padding: '0', overflowY: 'auto', height: '100vh', background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
