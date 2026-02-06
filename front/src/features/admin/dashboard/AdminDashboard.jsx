
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '@/api/projectApi';
import { 
  Plus, List, Map, Users, ArrowRight, 
  MapPin, Calendar, Building2, ExternalLink,
  Zap, Clock, CheckCircle, Folder
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await getProjects();
                // 백엔드가 { success: true, data: [] } 형식을 반환하므로 response.data.data를 가져와야 함
                setProjects(response.data.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <div style={{ color: '#1e293b', padding: '2rem' }}>데이터 로딩 중...</div>;

    // 요약 데이터 계산
    const totalCount = projects.length;
    const inProgressCount = projects.filter(p => p.status === 'ACTIVE').length;
    const planningCount = projects.filter(p => !p.status || p.status === 'PLANNING').length;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* 1. 빠른 작업 (Quick Tasks) */}
            <section style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <Zap size={20} color="#1e293b" />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>빠른 작업</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <QuickButton icon={<Plus size={18}/>} label="새 프로젝트 생성" color="#3b82f6" onClick={() => navigate('/admin/projects/create')} />
                    <QuickButton icon={<List size={18}/>} label="프로젝트 목록" color="#10b981" onClick={() => navigate('/admin/projects')} />
                    <QuickButton icon={<Map size={18}/>} label="안전 지도 보기" color="#ef4444" onClick={() => navigate('/admin/safety')} />
                    <QuickButton icon={<Users size={18}/>} label="작업자 관리" color="#6366f1" onClick={() => {}} />
                </div>
            </section>

            {/* 2. 최근 프로젝트 리스트 */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <Clock size={20} color="#1e293b" />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>최근 프로젝트 ({projects.length}개)</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {projects.slice(0, 3).map(p => (
                        <div key={p.id} style={{ 
                            background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>{p.name}</h3>
                                    <span style={{ 
                                        padding: '2px 10px', fontSize: '0.75rem', fontWeight: '800', borderRadius: '20px',
                                        background: p.status === 'ACTIVE' ? '#fef3c7' : '#dcfce7',
                                        color: p.status === 'ACTIVE' ? '#d97706' : '#16a34a'
                                    }}>
                                        {p.status === 'ACTIVE' ? '진행중' : '계획'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {p.location_address || '위치 미지정'}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {p.start_date || '미정'} ~ {p.end_date || '미정'}</span>
                                    {p.constructor_company && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {p.constructor_company}</span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/admin/projects/${p.id}`)}
                                style={{ 
                                    padding: '0.6rem 1.2rem', background: '#4f46e5', color: 'white', border: 'none', 
                                    borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
                                }}
                            >
                                상세보기
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. 통합 현황 (Summary Cards) */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <Folder size={20} color="#1e293b" />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>통합 현황</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    <StatusCard label="진행 중" value={inProgressCount} color="#3b82f6" icon={<Zap size={24} color="#3b82f6" opacity={0.2} />} />
                    <StatusCard label="계획 단계" value={planningCount} color="#f59e0b" icon={<Clock size={24} color="#f59e0b" opacity={0.2} />} />
                    <StatusCard label="완료" value="0" color="#10b981" icon={<CheckCircle size={24} color="#10b981" opacity={0.2} />} />
                    <StatusCard label="전체 프로젝트" value={totalCount} color="#6366f1" icon={<Folder size={24} color="#6366f1" opacity={0.2} />} />
                </div>
            </section>
        </div>
    );
};

// 재사용 컴포넌트: 퀵 버튼
const QuickButton = ({ icon, label, color, onClick }) => (
    <button 
        onClick={onClick}
        style={{ 
            background: 'white', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${color}40`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = `${color}08`;
            e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <div style={{ color: color }}>{icon}</div>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: color }}>{label}</span>
    </button>
);

// 재사용 컴포넌트: 현황 카드
const StatusCard = ({ label, value, color, icon }) => (
    <div style={{ 
        background: 'white', padding: '1.5rem 2rem', borderRadius: '20px', border: '1px solid #e2e8f0',
        position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    }}>
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
            {icon}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b', marginBottom: '1rem' }}>{label}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>{value}</div>
    </div>
);

export default AdminDashboard;
