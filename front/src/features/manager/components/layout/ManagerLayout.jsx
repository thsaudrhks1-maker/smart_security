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
    { label: '?€?œë³´??, icon: LayoutDashboard, path: '/manager' },
    { label: '?¼ì¼ ?‘ì—… ê³„íš', icon: ClipboardList, path: '/manager/work' },
    { label: 'ì½˜í…ì¸??´ëŒ', icon: FileText, path: '/manager/contents' },
    { label: '?‘ì—… ?„ì¹˜', icon: Map, path: '/manager/locations' },
    { label: '?‘ë ¥??ê´€ë¦?, icon: Briefcase, path: '/manager/companies' },
    { label: 'ê·¼ë¡œ??ê´€ë¦?, icon: Users, path: '/manager/workers' },
    { label: 'ì¶œì—­ ê´€ë¦?, icon: ClipboardCheck, path: '/manager/attendance' },
    { label: '?ˆì „?•ë³´ ?´ëŒ?„í™©', icon: FileText, path: '/manager/safety-info' },
    { label: '?„ë°˜???±ë¡/?„í™©', icon: ShieldAlert, path: '/manager/violations' },
    { label: 'ê·¼ë¡œ???„ì¹˜?•ì¸', icon: MapPin, path: '/manager/location' },
    { label: '?ˆì „êµìœ¡ ?„í™©', icon: GraduationCap, path: '/manager/education' },
    { label: '?„ì¥ ê³µì?', icon: Megaphone, path: '/manager/notices' },
    { label: 'ê¸´ê¸‰ ?Œë¦¼', icon: Bell, path: '/manager/emergency' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* ?¬ì´?œë°” (Manager ?„ìš© - Dark Theme ?ìš©) */}
      <aside style={{ 
        width: '260px', 
        height: '100vh',
        background: '#1e293b', // Adminê³??™ì¼??Dark Background
        color: '#ffffff',
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto',
        boxShadow: '4px 0 10px rgba(0,0,0,0.3)',
        zIndex: 10
      }}>
        {/* ?¤ë” */}
        <div style={{ padding: '24px', background: '#0f172a', borderBottom: '1px solid #334155' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <HardHat size={28} color="#f59e0b" /> {/* ?ˆì „ëª??„ì´ì½?? ì? */}
            Smart Site
          </h1>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f59e0b', marginTop: '6px', paddingLeft: '36px', letterSpacing: '0.02em' }}>
            ?„ì¥ ê´€ë¦¬ì
          </div>
        </div>

        {/* ë©”ë‰´ ?ì—­ */}
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
                  background: isActive ? '#0f172a' : 'transparent', // ?œì„±???????´ë‘??ë°°ê²½
                  color: isActive ? '#ffffff' : '#94a3b8', // ?œì„±?????°ìƒ‰, ?‰ì†Œ ?Œìƒ‰
                  border: 'none',
                  borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent', // ?¬ì¸??ì»¬ëŸ¬: ?ˆì „ ì£¼í™©??
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

        {/* ?˜ë‹¨ ë¡œê·¸?„ì›ƒ */}
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
            <LogOut size={16} /> ë¡œê·¸?„ì›ƒ
          </button>
        </div>
      </aside>

      {/* ë©”ì¸ ì½˜í…ì¸?*/}
      <main style={{ flex: 1, padding: '0', overflowY: 'auto', height: '100vh', background: '#f8fafc', color: '#1e293b' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
