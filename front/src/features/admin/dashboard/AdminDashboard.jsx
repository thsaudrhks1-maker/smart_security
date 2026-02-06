
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { 
  Building2, Users, Layout, Map, Plus, List, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle2, Zap, Shield, Trash2, Calendar, MapPin
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await projectApi.getProjects();
            setProjects(res.data.data || []);
        } catch (e) {
            console.error('프로젝트 목록 로드 실패', e);
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
        <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto', color: '#1e293b' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                   <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>👨‍💻 시스템 관리자 대시보드</h1>
                   <p style={{ color: '#64748b', fontSize: '1.1rem' }}>플랫폼의 전체 프로젝트 현황과 시스템 상태를 최상위 레벨에서 관리합니다.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard icon={<Building2 />} label="활성 프로젝트" value={projects.length} unit="개" color="#3b82f6" />
                <StatCard icon={<Users />} label="전체 등록 사용자" value="128" unit="명" color="#10b981" />
                <StatCard icon={<AlertTriangle />} label="미해결 긴급 신고" value="0" unit="건" color="#f59e0b" />
                <StatCard icon={<Shield />} label="시스템 보안 상태" value="정상" unit="" color="#6366f1" />
            </div>

            {/* Quick Actions */}
            <section style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                    <QuickButton icon={<Plus />} label="새 프로젝트 생성" color="#3b82f6" onClick={() => navigate('/admin/projects/create')} />
                    <QuickButton icon={<List />} label="프로젝트 목록 조회" color="#10b981" onClick={() => navigate('/admin/projects')} />
                    <QuickButton icon={<MapPin />} label="전체 부지 지도" color="#ef4444" onClick={() => navigate('/admin/map')} />
                    <QuickButton icon={<Shield />} label="보안/로그 정책" color="#6366f1" onClick={() => {}} />
                </div>
            </section>

            {/* Main Content: 프로젝트 목록 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#0f172a' }}>최근 프로젝트 목록</h3>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>총 {projects.length}개 운영 중</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {projects.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>등록된 프로젝트가 없습니다.</div>
                        ) : (
                            projects.map((proj) => (
                                <ProjectRow 
                                    key={proj.id} 
                                    project={proj} 
                                    onDelete={() => handleDelete(proj.id, proj.name)} 
                                    onView={() => navigate(`/admin/projects/${proj.id}`)}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800' }}>시스템 알림</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <SystemAlert type="success" message="서버 코어 안정화 완료" time="2시간 전" />
                            <SystemAlert type="info" message="정기 데이터 백업 수행됨" time="5시간 전" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* Components */
const ProjectRow = ({ project, onDelete, onView }) => (
    <div style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900' }}>{project.status || '진행'}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{project.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {project.location_address || '위치 미지정'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {project.floors_above}F / {project.floors_below}B</span>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
            <button 
                onClick={onView}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
            >
                상세보기
            </button>
            <button 
                onClick={onDelete}
                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
            >
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

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
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = color}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>{label}</span>
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
