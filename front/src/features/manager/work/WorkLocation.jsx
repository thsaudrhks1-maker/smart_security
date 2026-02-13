
import React, { useState, useEffect } from 'react';
import { projectApi } from '@/api/projectApi';
import { safetyApi } from '@/api/safetyApi';
import { MapPin, RefreshCcw, Layers, Info, CheckCircle2 } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import BuildingSectionView from './BuildingSectionView';

const WorkLocation = () => {
    const [project, setProject] = useState(null);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState('1F');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pRes, zRes] = await Promise.all([
                projectApi.getProjects(),
                safetyApi.getZones()
            ]);
            if (pRes.data.data?.length > 0) setProject(pRes.data.data[0]);
            setZones(zRes || []);
        } catch (e) {
            console.error('위치 데이터 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncZones = async () => {
        if (!confirm('현재 도면 좌표를 기반으로 구역 데이터를 동기화하시겠습니까?')) return;
        setLoading(true);
        try {
            await safetyApi.syncZonesByBlueprint(project.id);
            alert('구역 동기화가 완료되었습니다.');
            loadData();
        } catch (e) {
            alert('동기화 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', fontWeight: '800', color: '#64748b' }}>현장 데이터를 로드하는 중...</div>;

    const filteredZones = zones.filter(z => z.level === selectedLevel);

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MapPin size={32} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} /> 현장 구역 및 위치 관리
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>현장의 층별 도면을 바탕으로 작업 구역을 설정하고 관리합니다.</p>
                </div>
                <button
                    onClick={handleSyncZones}
                    style={{ padding: '0.8rem 1.5rem', background: '#0f172a', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}
                >
                    <RefreshCcw size={20} /> 도면 데이터 동기화
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
                {/* 층별 필터 사이드바 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <BuildingSectionView 
                            project={project} 
                            allZones={zones} 
                            activeLevel={selectedLevel}
                            onLevelChange={setSelectedLevel}
                        />
                    </div>
                    <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '24px', border: '1px solid #dbeafe', color: '#1e40af' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Info size={18} />
                            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>관리 팁</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5 }}>
                            각 구역은 위경도 좌표를 기반으로 사각형 그리드 형태로 생성됩니다. 동기화 버튼을 누르면 프로젝트 설정에 따라 자동으로 구역이 생성됩니다.
                        </p>
                    </div>
                </div>

                {/* 지도 메인 영역 */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', height: '700px', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={20} color="#6366f1" /> {selectedLevel} 평면 구역도
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>검 검색된 구역: <strong>{filteredZones.length}</strong>개</span>
                   </div>
                   <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    {project && (
                        <CommonMap 
                            center={[project.lat, project.lng]}
                            zoom={19}
                            gridOnly={true}
                            highlightLevel={selectedLevel}
                            gridConfig={{
                                rows: project.grid_rows,
                                cols: project.grid_cols,
                                spacing: project.grid_spacing,
                                angle: project.grid_angle
                            }}
                        />
                    )}
                   </div>
                </div>
            </div>
        </div>
    );
};

export default WorkLocation;
