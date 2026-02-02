import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ClipboardCheck, 
  LogOut, 
  HardHat 
} from 'lucide-react';

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const menu = [
    { label: '대시보드', icon: LayoutDashboard, path: '/manager' },
    { label: '내 현장 관리', icon: Briefcase, path: '/manager/my-project' },
    { label: '근로자/업체 승인', icon: Users, path: '/manager/approvals' },
    { label: '안전 점검(TBM)', icon: ClipboardCheck, path: '/manager/safety' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* 사이드바 (Manager 전용) */}
      <aside style={{ 
        width: '260px', 
        background: '#fff', 
        borderRight: '1px solid #e2e8f0', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <HardHat size={28} color="#f59e0b" /> {/* 안전모 색상 */}
            Smart Site
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', paddingLeft: '36px' }}>현장 관리자 전용</div>
        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
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
                  padding: '12px 24px',
                  background: isActive ? '#fff7ed' : 'transparent', // 주황색 틴트
                  color: isActive ? '#c2410c' : '#475569',
                  border: 'none',
                  borderRight: isActive ? '3px solid #c2410c' : '3px solid transparent',
                  fontWeight: isActive ? 'bold' : '500',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#ef4444',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main style={{ flex: 1, padding: '0', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
