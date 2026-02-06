
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { MapPin, Calendar, Plus, ExternalLink, HardHat } from 'lucide-react';

const ProjectList = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await projectApi.getProjects();
                setProjects(res.data.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: '800' }}>현장 목록을 불러오는 중...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>🏗️ 스마트 안전 현황</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>현재 시스템에서 관제 중인 모든 건설 현장 목록입니다.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/projects/create')}
                    style={{ padding: '0.8rem 1.5rem', background: '#3b82f6', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                >
                    <Plus size={20} /> 신규 프로젝트 등록
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {projects.length === 0 ? (
                  <div style={{ padding: '5rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                    등록된 프로젝트가 없습니다. 우측 상단의 버튼을 눌러 새 현장을 등록하세요.
                  </div>
                ) : projects.map(p => (
                    <div key={p.id} style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HardHat size={28} color="#64748b" />
                          </div>
                          <div>
                              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{p.name}</h3>
                              <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.95rem', fontWeight: '600' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} color="#94a3b8"/> {p.location_address || '위치 정보 없음'}</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color="#94a3b8"/> {p.start_date || '-'} ~ {p.end_date || '-'}</span>
                              </div>
                          </div>
                        </div>
                        <button 
                            onClick={() => navigate(`/admin/projects/${p.id}`)} 
                            style={{ 
                              padding: '0.8rem 1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '12px', 
                              color: '#3b82f6', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.color = '#312e81'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#3b82f6'; }}
                        >
                            상세 정보 <ExternalLink size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;
