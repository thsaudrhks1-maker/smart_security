
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { adminApi } from '@/api/adminApi';
import { 
  Building2, Users, Layout, Map, Plus, List, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle2, Zap, Shield, Trash2, Calendar, MapPin,
  Clock, Activity
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        project_count: 0,
        user_count: 0,
        emergency_count: 0,
        system_status: '대기'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [projRes, statsRes] = await Promise.all([
                projectApi.getProjects(),
                adminApi.getStats()
            ]);
            setProjects(projRes.data.data || []);
            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (e) {
            console.error('데이터 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`[주의] '${name}' 프로젝트를 삭제하시겠습니까?\n이 프로젝트에 등록된 모든 구역, 작업 계획, 인원 정보가 영구적으로 삭제됩니다.`)) {
            try {
                await projectApi.deleteProject(id);
                alert('프로젝트가 삭제되었습니다.');
                loadData(); // 목록 갱신
            } catch (e) {
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div style={{ 
            padding: '2rem', 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
            color: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '950', 
                        margin: 0, 
                        background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.04em'
                    }}>
                        SYSTEM CONTROL CENTER
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: '500' }}>
                        종합 건설안전 플랫폼 시스템 관리 마스터 대시보드
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="dark-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>SERVER ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard icon={<Building2 />} label="활속 프로젝트" value={stats.project_count} unit="개" color="#3b82f6" secondaryColor="rgba(59, 130, 246, 0.1)" />
                <StatCard icon={<Users />} label="전체 등록 사용자" value={stats.user_count} unit="명" color="#10b981" secondaryColor="rgba(16, 185, 129, 0.1)" />
                <StatCard icon={<AlertTriangle />} label="미해결 긴급 신고" value={stats.emergency_count} unit="건" color="#f59e0b" secondaryColor="rgba(245, 158, 11, 0.1)" />
                <StatCard icon={<Shield />} label="시스템 보안 상태" value={stats.system_status} unit="" color="#6366f1" secondaryColor="rgba(99, 102, 241, 0.1)" />
            </div>

            {/* Quick Actions & Project List Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Quick Actions */}
                    <section style={{ 
                        background: 'rgba(30, 41, 59, 0.4)', 
                        padding: '1.25rem', 
                        borderRadius: '24px', 
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <QuickButton icon={<Plus />} label="새 프로젝트 생성" color="#3b82f6" onClick={() => navigate('/admin/projects/create')} />
                            <QuickButton icon={<List />} label="프로젝트 목록" color="#10b981" onClick={() => navigate('/admin/projects')} />
                            <QuickButton icon={<MapPin />} label="관제 지도" color="#ef4444" onClick={() => navigate('/admin/map')} />
                            <QuickButton icon={<Activity />} label="시스템 로그" color="#6366f1" onClick={() => {}} />
                        </div>
                    </section>

                    {/* 프로젝트 목록 */}
                    <div style={{ 
                        background: 'rgba(30, 41, 59, 0.3)', 
                        padding: '2rem', 
                        borderRadius: '32px', 
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#3b82f620', padding: '10px', borderRadius: '12px' }}>
                                    <Layout size={20} color="#3b82f6" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>최근 프로젝트 관리</h3>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700', background: 'rgba(15, 23, 42, 0.5)', padding: '6px 14px', borderRadius: '20px' }}>
                                총 {projects.length}개 현장
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {projects.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>등록된 프로젝트가 없습니다.</div>
                            ) : (
                                projects.map((proj) => (
                                    <ProjectCard 
                                        key={proj.id} 
                                        project={proj} 
                                        onDelete={() => handleDelete(proj.id, proj.name)} 
                                        onView={() => navigate(`/admin/projects/${proj.id}`)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ 
                        background: 'rgba(30, 41, 59, 0.3)', 
                        padding: '2rem', 
                        borderRadius: '32px', 
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        height: '100%'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <Zap size={20} color="#f59e0b" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>실시간 시스템 상태</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <SystemAlert type="success" message="서버 코어 엔진 가동 중" time="2시간 전" />
                            <SystemAlert type="info" message="DB 일일 백업 완료 (db_backups)" time="5시간 전" />
                            <SystemAlert type="warning" message="새로운 현장 승인 요청" time="방금 전" />
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', marginBottom: '1rem' }}>CPU/MEM USAGE</div>
                            <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                                <div style={{ width: '35%', height: '100%', background: '#3b82f6' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', fontWeight: '700' }}>
                                <span>35% Utilized</span>
                                <span>v3.4.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* Components */
const ProjectCard = ({ project, onDelete, onView }) => (
    <div className="dark-card" style={{ 
        padding: '1.25rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid rgba(148, 163, 184, 0.05)'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.05)'}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#3b82f6', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '950' }}>{project.status || 'ACTIVE'}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.02em' }}>{project.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    <ChevronRight size={18} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                <MapPin size={14} /> {project.location_address || '위치 미지정'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', justifyContent: 'flex-end' }}>
                <Layout size={14} /> {project.floors_above}F / {project.floors_below}B
            </div>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, unit, color, secondaryColor }) => (
    <div className="dark-card" style={{ 
        padding: '1.5rem', 
        position: 'relative', 
        overflow: 'hidden',
        borderLeft: `2px solid ${color}`
    }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: color }}>
            {React.cloneElement(icon, { size: 80 })}
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: secondaryColor, padding: '6px', borderRadius: '8px', color: color }}>
                {React.cloneElement(icon, { size: 16 })}
            </div>
            {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2rem', fontWeight: '950', color: '#fff', letterSpacing: '-0.02em' }}>{value}</span>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '800' }}>{unit}</span>
        </div>
    </div>
);

const QuickButton = ({ icon, label, color, onClick }) => (
    <button 
        onClick={onClick} 
        className="dark-card"
        style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px', 
            padding: '1.25rem', 
            background: 'rgba(15, 23, 42, 0.3)', 
            border: '1px solid rgba(255,255,255,0.02)', 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
        }} 
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = color;
            e.currentTarget.style.background = `${color}10`;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.02)';
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)';
        }}
    >
        <div style={{ width: '44px', height: '44px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, border: `1px solid ${color}30` }}>
            {React.cloneElement(icon, { size: 22 })}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#94a3b8' }}>{label}</span>
    </button>
);

const SystemAlert = ({ type, message, time }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 16px', 
        background: 'rgba(15, 23, 42, 0.2)', 
        borderRadius: '16px', 
        border: '1px solid rgba(255,255,255,0.03)' 
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6',
                boxShadow: `0 0 8px ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'}`
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1' }}>{message}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>{time}</span>
    </div>
);

export default AdminDashboard;
