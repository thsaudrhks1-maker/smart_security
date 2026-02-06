import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { Calendar, Map as MapIcon } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import ZoneDetailModal from '@/components/common/ZoneDetailModal';
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
            let siteId = user?.project_id;
            if (!siteId) {
                const listRes = await projectApi.getProjects().catch(() => ({ data: { data: [] } }));
                const list = listRes?.data?.data || [];
                siteId = list.length > 0 ? list[0].id : 1;
            } else {
                siteId = Number(siteId);
            }
            
            const [projRes, zonesDetailRes, detailRes] = await Promise.all([
                projectApi.getProject(siteId),
                projectApi.getZonesWithDetails(siteId, selectedDate),
                projectApi.getProjectDetail(siteId)
            ]);

            const projectData = projRes.data?.data;
            const zonesWithDetails = zonesDetailRes?.data?.data || [];

            if (projectData) setProject(projectData);
            
            // 구역별 상세 정보 (tasks, dangers 포함)
            setZones(zonesWithDetails);
            
            // plans와 dangers를 별도로 추출하여 기존 로직 호환
            const allPlans = [];
            const allDangers = [];
            
            zonesWithDetails.forEach(zone => {
                (zone.tasks || []).forEach(task => {
                    allPlans.push({
                        ...task,
                        zone_name: zone.name,
                        level: zone.level
                    });
                });
                
                (zone.dangers || []).forEach(danger => {
                    allDangers.push({
                        ...danger,
                        zone_name: zone.name,
                        level: zone.level
                    });
                });
            });
            
            setPlans(allPlans);
            setDangers(allDangers);
            
            // 승인된 작업자 목록
            setApprovedWorkers(detailRes?.data?.data?.approved_workers || []);
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
        <div style={{ padding: '2rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', color: '#1e293b', background: '#f8fafc' }}>
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

            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '16px' }}>
                     <Calendar size={40} color="#3b82f6" />
                   </div>
                   <div>
                      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>일일 작업 계획</h1>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '8px', color: '#64748b', fontSize: '1rem' }}>
                         <span style={{ fontWeight: '800', color: '#3b82f6' }}>{project?.name || '프로젝트 정보 로딩 중...'}</span>
                         <span style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '15px' }}>📍 {project?.location_address || '위치 정보 없음'}</span>
                      </div>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f8fafc', padding: '15px 30px', borderRadius: '20px', border: '2px solid #3b82f6' }}>
                    <Calendar size={24} color="#3b82f6" />
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '900', fontSize: '1.4rem', color: '#1e40af', cursor: 'pointer' }} 
                    />
                </div>
            </header>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '250px 2fr 1.2fr', gap: '1.5rem', minHeight: 0 }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <BuildingSectionView project={project} allZones={zones} activeLevel={selectedLevel} onLevelChange={setSelectedLevel} />
                </div>

                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: '800' }}>
                        <MapIcon size={20} color="#3b82f6" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> {selectedLevel} 평면 구역도
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
                                gridConfig={{ rows: parseInt(project.grid_rows), cols: parseInt(project.grid_cols), spacing: parseFloat(project.grid_spacing) }}
                            />
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
                    <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: '#eff6ff', borderBottom: '1px solid #dbeafe', fontWeight: '800', color: '#1e40af' }}>
                            일일 작업 ({selectedLevel})
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {plans.filter(p => p.level === selectedLevel).length === 0 ? (
                                <EmptyState text="작업 없음" />
                            ) : (
                                plans.filter(p => p.level === selectedLevel).map((p, idx) => (
                                    <PlanItem key={`plan-${p.id || idx}`} plan={p} />
                                ))
                            )}
                        </div>
                    </div>
                    <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: '#fff1f2', borderBottom: '1px solid #ffe4e6', fontWeight: '800', color: '#9f1239' }}>
                            위험 구역 ({selectedLevel})
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
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

const EmptyState = ({ text }) => <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{text}</div>;

export default DailyPlanManagement;
