import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { Calendar, Map as MapIcon } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import ZoneDetailModal from '@/components/common/ZoneDetailModal';
import DangerZoneGallery from '@/components/common/DangerZoneGallery'; // 공통 컴포넌트 import
import BuildingSectionView from './BuildingSectionView';
import PlanItem from './components/PlanItem';
import DangerItem from './components/DangerItem';

/**
 * [MANAGER] 일일 작업 계획 관리
 * 리팩토링: 1300줄 -> 200줄 (모달/폼/카드 분리)
 */
const DailyPlanManagement = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [zones, setZones] = useState([]);
    const [plans, setPlans] = useState([]);
    const [dangers, setDangers] = useState([]);
    const [approvedWorkers, setApprovedWorkers] = useState([]);
    
    const [selectedLevel, setSelectedLevel] = useState('1F');
    const [selectedZone, setSelectedZone] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const siteId = user?.project_id || 1; 
            
            // 1. 프로젝트 상세 정보 가져오기 (이름, 위치, 그리드 설정 등)
            const detailRes = await projectApi.getProjectDetail(siteId);
            const detailData = detailRes.data.data;
            setProject(detailData.project);
            
            // 승인된 작업자 필터링 (백엔드 approved_workers 필드 사용)
            setApprovedWorkers(detailData.approved_workers || []);

            // 2. 구역별 상세 데이터 (작업 계획, 위험 요소 포함) 가져오기
            const zonesRes = await projectApi.getZonesWithDetails(siteId, selectedDate);
            const zonesData = zonesRes.data.data;
            setZones(zonesData);
            
            // 전체 층별 작업/위험 목록 추출 (필터링 용도)
            const allPlans = [];
            const allDangers = [];
            zonesData.forEach(zone => {
                (zone.tasks || []).forEach(task => allPlans.push({ 
                    ...task, 
                    id: task.task_id, // backend mapping 호환
                    zone_name: zone.name, 
                    level: zone.level 
                }));
                (zone.dangers || []).forEach(danger => allDangers.push({ 
                    ...danger, 
                    zone_name: zone.name, 
                    level: zone.level,
                    risk_type: danger.danger_type_label // backend mapping 호환
                }));
            });
            
            setPlans(allPlans);
            setDangers(allDangers);
            
        } catch (e) {
            console.error('데이터 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    const handleZoneClick = async (zone) => {
        setSelectedZone(zone);
        setIsModalOpen(true);
    };

    return (
        <div style={{ 
            padding: '1.5rem', 
            height: 'calc(100vh - 64px)', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            color: '#e2e8f0'
        }}>
            {isModalOpen && (
                <ZoneDetailModal 
                    zone={selectedZone}
                    date={selectedDate}
                    projectId={project?.id}
                    approvedWorkers={approvedWorkers}
                    onClose={() => {
                        setIsModalOpen(false);
                        loadData();
                    }}
                />
            )}

            <header style={{ 
                marginBottom: '1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(30, 41, 59, 0.6)', 
                backdropFilter: 'blur(20px)',
                padding: '1rem 1.5rem', 
                borderRadius: '20px', 
                border: '1px solid rgba(148, 163, 184, 0.1)', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ 
                       background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                       padding: '12px', 
                       borderRadius: '16px',
                       boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                   }}>
                     <Calendar size={40} color="#ffffff" />
                   </div>
                   <div>
                      <h1 style={{ 
                          fontSize: '1.8rem', 
                          fontWeight: '900', 
                          margin: 0, 
                          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                      }}>일일 작업 계획</h1>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '8px', color: '#94a3b8', fontSize: '1rem' }}>
                         <span style={{ fontWeight: '800', color: '#60a5fa' }}>{project?.name || '프로젝트 정보 로딩 중...'}</span>
                         <span style={{ borderLeft: '1px solid rgba(148, 163, 184, 0.3)', paddingLeft: '15px' }}>📍 {project?.location_address || '위치 정보 없음'}</span>
                      </div>
                   </div>
                </div>
                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    alignItems: 'center', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    padding: '15px 30px', 
                    borderRadius: '20px', 
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
                }}>
                    <Calendar size={24} color="#60a5fa" />
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        style={{ 
                            border: 'none', 
                            background: 'transparent', 
                            outline: 'none', 
                            fontWeight: '900', 
                            fontSize: '1.4rem', 
                            color: '#60a5fa', 
                            cursor: 'pointer',
                            colorScheme: 'dark'
                        }} 
                    />
                </div>
            </header>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '180px 1fr 280px', gap: '1.2rem', minHeight: 0 }}>
                <div className="dark-card" style={{ padding: '1rem' }}>
                    <BuildingSectionView project={project} allZones={zones} activeLevel={selectedLevel} onLevelChange={setSelectedLevel} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '15px', minHeight: 0 }}>

                    {/* 맵 영역 */}
                    <div className="dark-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="dark-card-header">
                            <MapIcon size={20} color="#60a5fa" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> {selectedLevel} 평면 구역도
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            {project?.lat && (
                                <CommonMap 
                                    center={[project.lat, project.lng]} 
                                    zoom={20} 
                                    highlightLevel={selectedLevel} 
                                    onZoneClick={handleZoneClick} 
                                    plans={plans} 
                                    risks={dangers}
                                    zones={zones}
                                    gridConfig={{ 
                                        rows: parseInt(project.grid_rows), 
                                        cols: parseInt(project.grid_cols), 
                                        spacing: parseFloat(project.grid_spacing),
                                        angle: parseFloat(project.grid_angle || 0)
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* 위험 구역 사진첩 Sidebar - 공통 컴포넌트 교체 */}
                    <div className="dark-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <DangerZoneGallery 
                            zones={zones}
                            currentLevel={selectedLevel}
                            onZoneClick={handleZoneClick}
                            isCollapsible={true} // 매니저 대시보드와 동일하게 토글 가능하도록 설정
                            defaultExpanded={true}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
                    <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ 
                            padding: '1.25rem', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            borderBottom: '1px solid rgba(59, 130, 246, 0.2)', 
                            fontWeight: '800', 
                            color: '#60a5fa'
                        }}>
                            일일 작업 ({selectedLevel})
                        </div>
                        <div className="dark-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {plans.filter(p => p.level === selectedLevel).length === 0 ? (
                                <EmptyState text="작업 없음" />
                            ) : (
                                plans.filter(p => p.level === selectedLevel).map((p, idx) => (
                                    <PlanItem key={`plan-${p.id || idx}`} plan={p} />
                                ))
                            )}
                        </div>
                    </div>
                    <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ 
                            padding: '1.25rem', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            borderBottom: '1px solid rgba(239, 68, 68, 0.2)', 
                            fontWeight: '800', 
                            color: '#f87171'
                        }}>
                            위험 구역 ({selectedLevel})
                        </div>
                        <div className="dark-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {dangers.filter(d => d.level === selectedLevel).length === 0 ? (
                                <EmptyState text="위험 구역 없음" />
                            ) : (
                                dangers.filter(d => d.level === selectedLevel).map((d, idx) => (
                                    <DangerItem key={`danger-${d.id || idx}`} danger={d} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ text }) => <div className="dark-empty-state">{text}</div>;

export default DailyPlanManagement;
