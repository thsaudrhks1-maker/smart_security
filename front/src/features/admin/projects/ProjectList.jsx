
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '@/api/projectApi';
import { Briefcase, MapPin, Calendar, Search, Filter } from 'lucide-react';

const ProjectList = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getProjects();
                setProjects(res.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>프로젝트를 불러오는 중...</div>;

    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>🏙️ 프로젝트 통합 관리</h1>
                <button onClick={() => navigate('/admin/projects/create')} style={{ padding: '10px 24px', background: '#3b82f6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                    + 신규 현장 등록
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {projects.map(p => (
                    <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{p.name}</h3>
                            <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {p.location_address || '위치 미등록'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14}/> {p.start_date || '-'} ~ {p.end_date || '-'}</span>
                            </div>
                        </div>
                        <button onClick={() => navigate(`/admin/projects/${p.id}`)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                            상세보기
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;
