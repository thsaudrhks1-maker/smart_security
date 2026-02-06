
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { 
  Building2, Users, MapPin, Calendar, ArrowLeft, 
  Settings, ClipboardList, AlertTriangle, Edit3, Map as MapIcon,
  HardHat
} from 'lucide-react';

import CommonMap from '@/components/common/CommonMap';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('개요');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await projectApi.getProject(id);
                setProject(res.data.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    if (loading) return <div style={{ color: '#1e293b', padding: '2rem' }}>현장 정보를 불러오고 있습니다...</div>;
    if (!project) return <div style={{ color: '#1e293b', padding: '2rem' }}>프로젝트 정보를 찾을 수 없습니다.</div>;

    // 실데이터 연동 (값이 없으면 0이나 '-' 표시)
    const stats = [
        { label: '총 작업자', value: project.worker_count || '0', icon: <HardHat size={20} color="#f59e0b" />, color: '#fffbeb' },
        { label: '현장 수', value: project.site_count || '1', icon: <Building2 size={20} color="#3b82f6" />, color: '#eff6ff' },
        { label: '진행 중 작업', value: project.task_count || '0', icon: <ClipboardList size={20} color="#10b981" />, color: '#ecfdf5' },
        { label: '위험 지역', value: project.alert_count || '0', icon: <AlertTriangle size={20} color="#ef4444" />, color: '#fef2f2' },
    ];

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', color: '#1e293b' }}>
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12.5rem' }}>
                    <button 
                      onClick={() => navigate(-1)} 
                      style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}
                    >
                        <ArrowLeft size={16} /> 목록으로
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{project.name}</h1>
                      <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: '#fef3c7', color: '#d97706', borderRadius: '20px', fontWeight: '800' }}>{project.status === 'ACTIVE' ? '진행중' : '계획'}</span>
                    </div>
                </div>
                <button style={{ padding: '0.75rem 1.5rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                   <Edit3 size={18}/> 정보 수정
                </button>
            </div>

            <div style={{ color: '#475569', fontSize: '0.95rem', display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} color="#94a3b8" /> {project.location_address || '현장 주소 미등록'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={18} color="#94a3b8" /> {project.start_date || '-'} ~ {project.end_date || '-'}</span>
            </div>

            {/* Progress Bar Area */}
            <div style={{ background: 'white', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '1rem' }}>프로젝트 진행률</span>
                    <span style={{ color: '#3b82f6', fontWeight: '900', fontSize: '1.1rem' }}>0%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
                </div>
            </div>

            {/* Stats Grid - 실데이터 기반 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{ 
                      background: idx === 3 ? '#fff5f5' : 'white', padding: '1.75rem', borderRadius: '20px', 
                      border: idx === 3 ? '2px solid #fecaca' : '1px solid #e2e8f0', 
                      display: 'flex', alignItems: 'center', gap: '1.25rem',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.2 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', marginBottom: '2rem' }}>
                {['개요', '현장 관리', '협력사', '작업자', '위험지역'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ 
                            padding: '1rem 2rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: '800',
                            color: activeTab === tab ? '#3b82f6' : '#94a3b8',
                            borderBottom: activeTab === tab ? '4px solid #3b82f6' : '4px solid transparent',
                            marginBottom: '-2px', transition: 'all 0.2s'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area - 시인성 강화 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '2rem' }}>
                {/* Project Info Card */}
                <InfoCard title="프로젝트 상세 정보">
                    <InfoRow label="공사명" value={project.name} />
                    <InfoRow label="공사 유형" value="일반 건축" />
                    <InfoRow label="공사 금액" value="₩50,000,000" isBold />
                    <InfoRow label="착공일" value={project.start_date || '-'} />
                    <InfoRow label="준공 예정일" value={project.end_date || '-'} />
                </InfoCard>

                {/* Relation Info Card */}
                <InfoCard title="관계사 정보">
                    <InfoRow label="발주처" value={project.client_company || '-'} />
                    <InfoRow label="시공사" value={project.constructor_company || '-'} />
                </InfoCard>

                {/* Location Map Card */}
                <InfoCard title="위치 및 지도 정보">
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      <strong>주소:</strong> {project.location_address || '주소 정보가 없습니다.'}
                    </p>
                    <div style={{ height: '300px' }}>
                        <CommonMap 
                            center={[project.lat || 37.5665, project.lng || 126.9780]} 
                            zoom={16} 
                            markers={[{ lat: project.lat || 37.5665, lng: project.lng || 126.9780, title: project.name }]}
                            gridConfig={{
                              grid_rows: project.grid_rows,
                              grid_cols: project.grid_cols,
                              grid_spacing: project.grid_spacing
                            }}
                        />
                    </div>
                </InfoCard>
            </div>
        </div>
    );
};

// 재사용 컴포넌트: 정보 카드
const InfoCard = ({ title, children }) => (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '18px', background: '#3b82f6', borderRadius: '2px' }}></div>
          {title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {children}
        </div>
    </div>
);

// 재사용 컴포넌트: 정보 열
const InfoRow = ({ label, value, isBold = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc', paddingBottom: '0.75rem' }}>
        <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '600' }}>{label}</span>
        <span style={{ color: '#1e293b', fontSize: '1rem', fontWeight: isBold ? '800' : '700', textAlign: 'right' }}>{value}</span>
    </div>
);

export default ProjectDetail;
