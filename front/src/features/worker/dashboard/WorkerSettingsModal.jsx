
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Settings, LogOut, ChevronRight, Bell, Shield, HelpCircle } from 'lucide-react';

const WorkerSettingsModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!open) return null;

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 12000, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: 'white', width: '100%', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '2rem 1.5rem', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto 1.5rem' }} onClick={onClose} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👷</div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>{user?.full_name}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.username} | {user?.role}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SettingItem icon={<Bell size={20} color="#6366f1" />} label="알림 설정" />
          <SettingItem icon={<Shield size={20} color="#10b981" />} label="개인정보 및 보안" />
          <SettingItem icon={<HelpCircle size={20} color="#3b82f6" />} label="고객센터 및 도움말" />
        </div>

        <button
          onClick={handleLogout}
          style={{ width: '100%', marginTop: '2rem', padding: '1.1rem', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <LogOut size={20} /> 로그아웃
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          Smart Security v1.2.4 (Beta)
        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '20px', cursor: 'pointer' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {icon}
      <span style={{ fontWeight: '700', color: '#334155' }}>{label}</span>
    </div>
    <ChevronRight size={18} color="#cbd5e1" />
  </div>
);

export default WorkerSettingsModal;
