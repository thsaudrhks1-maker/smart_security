
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { safetyApi } from '@/api/safetyApi';
import { projectApi } from '@/api/projectApi';
import { workApi } from '@/api/workApi';
import { Shield, Bell, Map as MapIcon, Info, LayoutDashboard } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import AttendanceCard from './AttendanceCard';
import DashboardCards from './DashboardCards';
import DangerReportModal from './DangerReportModal';
import DangerZoneDetailModal from './DangerZoneDetailModal';
import { SafetyGuideModal } from './DashboardModals';

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [zones, setZones] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentLevel, setCurrentLevel] = useState('1F');

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);

    const loadData = async () => {
        try {
            const projectId = user?.project_id || 1;
            const today = new Date().toISOString().split('T')[0];
            
            const [projectRes, zonesRes, plansRes] = await Promise.all([
                projectApi.getProject(projectId),
                projectApi.getZonesWithDetails(projectId, today),
                workApi.getPlans({ project_id: projectId, d: today })
            ]);
            
            if (projectRes?.data?.success) {
                const p = projectRes.data.data;
                setProject({
                    ...p,
                    lat: p.lat || 37.5665,
                    lng: p.lng || 126.9780,
                    grid_rows: p.grid_rows || 10,
                    grid_cols: p.grid_cols || 10,
                    grid_spacing: p.grid_spacing || 10
                });
            }
            
            const zonesData = zonesRes?.data?.data || [];
            const plansData = plansRes?.data?.data || [];
            
            setZones(zonesData);
            setPlans(plansData);

            // 본인 작업이 있는 경우 해당 층으로 자동 전환
            const myPlanData = Array.isArray(plansData) ? plansData.find(p => p.workers?.some(w => w.id === (user?.id || user?.user_id))) : null;
            if (myPlanData && myPlanData.level) {
                setCurrentLevel(myPlanData.level);
            }



        } catch (e) {
            console.error('근로자 대시보드 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [user]);

    const myPlan = Array.isArray(plans) ? plans.find(p => p.workers?.some(w => w.id === (user?.id || user?.user_id))) : null;
    
    // 통계 계산
    const dangerCount = Array.isArray(zones) ? zones.filter(z => z.dangers?.length > 0).length : 0;
    const taskCount = Array.isArray(zones) ? zones.filter(z => z.tasks?.length > 0).length : 0;
    // 구역 데이터에 기반한 동적 층 리스트 생성
    const levels = Array.from(new Set(zones.map(z => z.level))).sort((a, b) => {
        const order = { 'B1': -1, '1F': 1, '2F': 2, '3F': 3 };
        return (order[a] || 0) - (order[b] || 0);
    });

    // 지도 섹션으로 스크롤 이동
    const scrollToMap = () => {
        const mapSection = document.getElementById('work-map-section');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.25rem', color: '#1e293b', paddingBottom: '100px' }}>
            {/* 상단 알림 및 인사 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                   <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>안전한 하루 되세요! 🛡️</h2>
                   <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}><strong>{user?.full_name}</strong> 님, 오늘도 안전 작업 하세요.</p>
                </div>
                <button 
                  onClick={() => setIsGuideModalOpen(true)}
                  style={{ width: '45px', height: '45px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Bell size={22} />
                </button>
            </div>

            {/* 메인 출석 카드 */}
            <AttendanceCard projectInfo={{ project_id: project?.id, project_name: '금일 현장' }} />

            <div style={{ height: '24px' }} />

            {/* 핵심 요약 카드 */}
            <DashboardCards 
              zonesCount={zones.length} 
              risksCount={dangerCount} 
              myWorkZone={myPlan ? myPlan.zone_name : '미배정'}
              onMyZoneClick={myPlan ? scrollToMap : null}
            />

            {/* 실시간 현장 지도 영역 */}
            <section id="work-map-section" style={{ background: 'white', padding: '1.25rem', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapIcon size={20} color="#3b82f6" /> 실시간 현장 지도
                </h3>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', fontWeight: '800' }}>
                  <span style={{ color: '#2563eb' }}>작업 {taskCount}</span>
                  <span style={{ color: '#dc2626' }}>위험 {dangerCount}</span>
                </div>
              </div>
              
              {/* 층 선택 버튼 */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem', overflowX: 'auto' }}>
                {(levels.length > 0 ? levels : ['B1', '1F', '2F']).map(level => (
                  <button
                    key={level}
                    onClick={() => setCurrentLevel(level)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: currentLevel === level ? '#3b82f6' : '#f1f5f9',
                      color: currentLevel === level ? 'white' : '#64748b',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
              
              <div style={{ height: '350px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                {project && (
                  <CommonMap 
                    center={[project.lat, project.lng]}
                    zoom={19}
                    gridConfig={{ 
                      rows: parseInt(project.grid_rows), 
                      cols: parseInt(project.grid_cols), 
                      spacing: parseFloat(project.grid_spacing) 
                    }}
                    highlightLevel={currentLevel}
                    myZoneName={myPlan?.zone_name}
                    zones={zones}

                    onZoneClick={(zoneData) => {
                      setSelectedZone(zoneData);
                      setIsReportModalOpen(true);
                    }}
                  />

                )}
              </div>
              <div style={{ marginTop: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '15px', fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                <Info size={16} color="#3b82f6" />
                <span>지도를 클릭하여 **위험 요소를 즉시 신고**할 수 있습니다.</span>
              </div>
            </section>

            {/* 모달 모음 */}
            <DangerReportModal 
              open={isReportModalOpen} 
              onClose={() => setIsReportModalOpen(false)} 
              zone={selectedZone}
              onSuccess={loadData}
            />
            <SafetyGuideModal 
              isOpen={isGuideModalOpen} 
              onClose={() => setIsGuideModalOpen(false)} 
            />
        </div>
    );
};

export default WorkerDashboard;
