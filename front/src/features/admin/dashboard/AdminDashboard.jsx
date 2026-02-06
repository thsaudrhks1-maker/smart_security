
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { 
  Building2, Users, Layout, Map, Plus, List, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle2, Zap, Shield
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({ projectCount: 0, companyCount: 0 });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await projectApi.getProjects();
                setSummary(prev => ({ ...prev, projectCount: res.data.data?.length || 0 }));
            } catch (e) { console.error(e); }
        };
        load();
    }, []);

    return (
        <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto', color: '#1e293b' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>👨‍💻 시스템 관리자 대시보드</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>플랫폼의 전체 프로젝트 현황과 시스템 상태를 최상위 레벨에서 관리합니다.</p>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard icon={<Building2 />} label="활성 프로젝트" value={summary.projectCount} unit="개" color="#3b82f6" />
                <StatCard icon={<Users />} label="전체 등록 사용자" value="128" unit="명" color="#10b981" />
                <StatCard icon={<AlertTriangle />} label="미해결 긴급 신고" value="0" unit="건" color="#f59e0b" />
                <StatCard icon={<Shield />} label="시스템 보안 상태" value="정상" unit="" color="#6366f1" />
            </div>

            {/* Quick Actions */}
            <section style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                    <Zap size={22} color="#f59e0b" fill="#f59e0b" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>빠른 바로가기</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                    <QuickButton icon={<Plus />} label="새 프로젝트 생성" color="#3b82f6" onClick={() => navigate('/admin/projects/create')} />
                    <QuickButton icon={<List />} label="프로젝트 목록" color="#10b981" onClick={() => navigate('/admin/projects')} />
                    <QuickButton icon={<Map />} label="현장 안전 맵 설정" color="#ef4444" onClick={() => navigate('/admin/map')} />
                    <QuickButton icon={<Users />} label="사용자/권한 관리" color="#6366f1" onClick={() => {}} />
                </div>
            </section>

            {/* Recent Activity (Placeholder) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800' }}>최근 프로젝트 업데이트</h3>
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>최근 활동 내역이 없습니다.</div>
                </div>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800' }}>시스템 알림</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <SystemAlert type="success" message="서버 코어 안정화 완료" time="2시간 전" />
                        <SystemAlert type="info" message="정기 데이터 백업 수행됨" time="5시간 전" />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* Components */
const StatCard = ({ icon, label, value, unit, color }) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', borderLeft: `6px solid ${color}` }}>
        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {React.cloneElement(icon, { size: 16 })} {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{value}</span>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '700' }}>{unit}</span>
        </div>
    </div>
);

const QuickButton = ({ icon, label, color, onClick }) => (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}>
        <div style={{ width: '45px', height: '45px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {React.cloneElement(icon, { size: 22 })}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>{label}</span>
    </button>
);

const SystemAlert = ({ type, message, time }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: type === 'success' ? '#10b981' : '#3b82f6' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>{message}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{time}</span>
    </div>
);

export default AdminDashboard;
