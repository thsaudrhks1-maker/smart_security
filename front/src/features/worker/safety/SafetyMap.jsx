
import React, { useState, useEffect } from 'react';
import { safetyApi } from '@/api/safetyApi';
import { projectApi } from '@/api/projectApi';
import { Map as MapIcon, AlertTriangle, Info, Plus } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import DangerZoneModal from '@/components/common/DangerZoneModal';
import { useAuth } from '@/context/AuthContext';

const SafetyMap = () => {
    const { user } = useAuth();
    const [zones, setZones] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);
    const [currentLevel, setCurrentLevel] = useState('1F');

    useEffect(() => {
        const load = async () => {
            try {
                // 사용자의 프로젝트 ID 가져오기
                const projectId = user?.project_id || 1;
                
                const today = new Date().toISOString().split('T')[0];
                
                // 프로젝트 정보와 구역 상세 정보 조회
                const [projectRes, zonesRes] = await Promise.all([
                    projectApi.getProject(projectId),
                    projectApi.getZonesWithDetails(projectId, today)
                ]);
                
                if (projectRes?.data) {
                    setProject({
                        id: projectRes.data.id,
                        lat: projectRes.data.lat || 37.5013068,
                        lng: projectRes.data.lng || 127.0398106,
                        grid_rows: projectRes.data.grid_rows || 4,
                        grid_cols: projectRes.data.grid_cols || 3
                    });
                }
                
                setZones(zonesRes?.data || []);
            } catch (e) { 
                console.error('데이터 로드 실패:', e); 
            } finally { 
                setLoading(false); 
            }
        };
        load();
    }, [user]);

    // 위험 구역 통계
    const dangerCount = zones.filter(z => z.dangers?.length > 0).length;
    const taskCount = zones.filter(z => z.tasks?.length > 0).length;
    
    // 층별 필터링
    const levels = ['B1', '1F', '2F', '3F', '4F', '5F'];
    
    return (
        <div style={{ height: 'calc(100vh - 70px)', position: 'relative', background: '#f8fafc' }}>
            {/* 헤더 */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000 }}>
                <div style={{ background: 'white', padding: '12px 20px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapIcon size={20} color="#3b82f6" />
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '900' }}>실시간 현장 안전지도</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>
                            작업 {taskCount}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
                            위험 {dangerCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* 층 선택 */}
            <div style={{ position: 'absolute', top: '90px', left: '20px', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {levels.map(level => (
                        <button
                            key={level}
                            onClick={() => setCurrentLevel(level)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: currentLevel === level ? '#3b82f6' : '#f1f5f9',
                                color: currentLevel === level ? 'white' : '#64748b',
                                fontWeight: '900',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* 지도 */}
            {project ? (
                <CommonMap 
                    center={[project.lat, project.lng]}
                    zoom={19}
                    gridRows={project.grid_rows}
                    gridCols={project.grid_cols}
                    highlightLevel={currentLevel}
                    zones={zones}
                    onZoneClick={(zoneData) => {
                        setSelectedZone(zoneData);
                        setIsReportOpen(true);
                    }}
                />
            ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    {loading ? '지도를 불러오는 중...' : '프로젝트 정보를 찾을 수 없습니다.'}
                </div>
            )}

            {/* 안내 패널 */}
            <div style={{ position: 'absolute', bottom: '100px', left: '20px', right: '20px', zIndex: 1000 }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.9)', color: 'white', padding: '15px', borderRadius: '20px', backdropFilter: 'blur(8px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <Info size={18} color="#f59e0b" />
                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>현장 안전 정보</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '20px', height: '3px', background: '#3b82f6', borderRadius: '2px' }}></div>
                            <span>작업 구역</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '20px', height: '3px', background: '#ef4444', borderRadius: '2px' }}></div>
                            <span>위험 구역</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '20px', height: '3px', background: '#fbbf24', borderRadius: '2px' }}></div>
                            <span>주의 구역</span>
                        </div>
                    </div>
                </div>
            </div>

            <DangerZoneModal 
                open={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                zone={selectedZone}
                mode="WORKER"
                onSuccess={() => {}} 
            />
        </div>
    );
};

export default SafetyMap;
