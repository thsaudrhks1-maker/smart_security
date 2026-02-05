import React, { useState, useEffect } from 'react';
import {
  HardHat, ArrowLeft, Map, ChevronRight,
  ChevronDown, ChevronUp, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import WorkerSettingsModal from './WorkerSettingsModal';
import AttendanceCard from './AttendanceCard';
import UniversalBlueprintMap from '@/components/common/map/UniversalBlueprintMap';
import BuildingSectionView from '@/features/manager/work/BuildingSectionView';
import { workApi } from '@/api/workApi';
import { safetyApi } from '@/api/safetyApi';
import { workerApi } from '@/api/workerApi';

import { 
  WorkCard, WeatherCard, EmergencyAlertCard, RiskCard, 
  SafetyInfoCard, NoticeBar, StatCards 
} from './DashboardCards';
import { 
  WorkDetailModal, RiskDetailModal, NoticeModal, 
  EmergencyAlertModal, SafetyInfoModal 
} from './DashboardModals';
import DangerReportModal from './DangerReportModal';
import DangerZoneDetailModal from './DangerZoneDetailModal';

const STORAGE_SHOW_MAP = 'worker_home_show_map';
const STORAGE_MAP_EXPANDED = 'worker_home_map_expanded';

const WorkerDashboard = ({ isAdminView = false, onBackToAdmin = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 데이터 상태
  const [myPlans, setMyPlans] = useState([]);
  const [myRisks, setMyRisks] = useState([]);
  const [allZones, setAllZones] = useState([]);
  const [dashboardInfo, setDashboardInfo] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedZoneForReport, setSelectedZoneForReport] = useState(null);
  const [showDangerDetailModal, setShowDangerDetailModal] = useState(false);
  const [selectedDangerZone, setSelectedDangerZone] = useState(null);

  // 홈 지도 상태
  const [showMapOnHome, setShowMapOnHome] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_SHOW_MAP) ?? 'true'); } catch { return true; }
  });
  const [mapExpandedByDefault, setMapExpandedByDefault] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_MAP_EXPANDED) ?? 'false'); } catch { return false; }
  });
  const [mapExpanded, setMapExpanded] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_MAP_EXPANDED) ?? 'false'); } catch { return false; }
  });
  
  // 층별 보기 상태
  const [selectedLevel, setSelectedLevel] = useState('ALL'); // 'ALL', 'B1', '1F', '2F'
  const [showBuildingSection, setShowBuildingSection] = useState(false);

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        const [plansRes, dashboardRes, risksRes] = await Promise.all([
          workApi.getMyTodayWork(),
          workerApi.getDashboard(),
          workerApi.getAllProjectRisks()
        ]);
        setMyPlans(plansRes || []);
        setDashboardInfo(dashboardRes);
        setMyRisks(Array.isArray(risksRes) ? risksRes : []);
        setLoading(false);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setMyRisks([]);
        setLoading(false);
      }
    };
    loadWorkerData();
  }, []);

  const siteId = myPlans.length > 0 ? myPlans[0].site_id : null;
  const projectId = dashboardInfo?.user_info?.project_id;
  
  useEffect(() => {
    if (siteId == null) { setAllZones([]); return; }
    safetyApi.getZones(siteId).then((data) => setAllZones(data || [])).catch(() => setAllZones([]));
  }, [siteId]);
  
  useEffect(() => {
    if (!projectId) return;
    apiClient.get(`/projects/${projectId}`)
      .then(res => setProject(res.data))
      .catch(err => console.error('프로젝트 정보 로드 실패:', err));
  }, [projectId]);
  
  // 층별 필터링된 zones
  const filteredZones = selectedLevel === 'ALL' 
    ? allZones 
    : allZones.filter(z => z.level === selectedLevel);

  // Zone 클릭 핸들러 (위험 구역 상세 or 신고)
  const handleZoneClick = (zone) => {
    // 해당 Zone에 위험이 있는지 확인
    const dangerZone = myRisks.find(r => r.zone_id === zone.id);
    
    if (dangerZone) {
      // 위험 구역이 있으면 → 상세 모달
      setSelectedDangerZone(dangerZone);
      setShowDangerDetailModal(true);
    } else {
      // 위험 구역이 없으면 → 신고 모달
      setSelectedZoneForReport(zone);
      setShowReportModal(true);
    }
  };

  // 신고 성공 후 데이터 새로고침
  const handleReportSuccess = async () => {
    try {
      const risksRes = await workerApi.getAllProjectRisks();
      setMyRisks(Array.isArray(risksRes) ? risksRes : []);
    } catch (err) {
      console.error('위험 구역 재로드 실패:', err);
    }
  };

  const handleViewLocation = (risk) => {
    navigate('/worker/safety', { state: { focusZone: risk } });
  };

  const saveShowMapOnHome = (value) => {
    setShowMapOnHome(value);
    try { localStorage.setItem(STORAGE_SHOW_MAP, JSON.stringify(value)); } catch (_) {}
  };
  const saveMapExpandedByDefault = (value) => {
    setMapExpandedByDefault(value);
    setMapExpanded(value);
    try { localStorage.setItem(STORAGE_MAP_EXPANDED, JSON.stringify(value)); } catch (_) {}
  };

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>데이터 로딩 중...</div>;

  return (
    <div style={{ padding: '0.75rem', background: '#f1f5f9', minHeight: '100%', paddingBottom: '0.5rem' }}>
      
      {/* 헤더 */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardHat size={22} fill="#3b82f6" color='white' style={{ background: '#3b82f6', borderRadius: '50%', padding: '2px' }} />
            {user?.full_name}님
            {dashboardInfo?.user_info && (
              <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px' }}>
                {dashboardInfo.user_info.company_name} | {dashboardInfo.user_info.project_name}
              </span>
            )}
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '2rem' }}>오늘도 안전한 하루 되세요!</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdminView && onBackToAdmin && (
            <button onClick={onBackToAdmin} style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <button onClick={() => openModal('settings')} style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Settings size={18} color="#64748b" />
          </button>
        </div>
      </div>

      {/* 지도 영역 (접었다 펼치기) */}
      {showMapOnHome ? (
        <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <button onClick={() => setMapExpanded((v) => !v)} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Map size={20} color="#3b82f6" /> 나의 작업 현장 지도</span>
            {mapExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {mapExpanded && (
            <div style={{ padding: '0.75rem' }}>
              {/* 층별 보기 컨트롤 */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => { setSelectedLevel('ALL'); setShowBuildingSection(false); }}
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    background: selectedLevel === 'ALL' ? '#3b82f6' : '#f1f5f9',
                    color: selectedLevel === 'ALL' ? 'white' : '#64748b',
                    border: 'none', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  전체보기
                </button>
                <button 
                  onClick={() => setShowBuildingSection(!showBuildingSection)}
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    background: showBuildingSection ? '#3b82f6' : '#f1f5f9',
                    color: showBuildingSection ? 'white' : '#64748b',
                    border: 'none', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  층별보기
                </button>
                {selectedLevel !== 'ALL' && (
                  <span style={{ padding: '0.4rem 0.8rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    {selectedLevel}
                  </span>
                )}
              </div>

              {/* 단면도 + 지도 (층별보기 모드: 좌우 배치) */}
              {showBuildingSection ? (
                <div style={{ display: 'flex', gap: '0.75rem', minHeight: '280px' }}>
                  {/* 단면도 (왼쪽) */}
                  <div style={{ flexShrink: 0 }}>
                    <BuildingSectionView
                      project={project}
                      allZones={allZones}
                      allPlans={myPlans}
                      allRisks={myRisks}
                      selectedLevel={selectedLevel}
                      onLevelSelect={(level) => setSelectedLevel(level)}
                      compact={true}
                    />
                  </div>
                  
                  {/* 평면도 (오른쪽) */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <UniversalBlueprintMap 
                      role="WORKER"
                      zones={filteredZones}
                      plans={myPlans}
                      risks={myRisks}
                      height="280px"
                      showLabels={true}
                      onZoneClick={handleZoneClick}
                    />
                  </div>
                </div>
              ) : (
                /* 전체보기 모드: 지도만 */
                <UniversalBlueprintMap 
                  role="WORKER"
                  zones={filteredZones}
                  plans={myPlans}
                  risks={myRisks}
                  height="240px"
                  showLabels={true}
                  onZoneClick={handleZoneClick}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => { saveShowMapOnHome(true); setMapExpanded(true); }} style={{ width: '100%', padding: '0.6rem', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
            <Map size={18} /> 지도 보기
          </button>
        </div>
      )}

      {/* 대시보드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', gridAutoRows: 'minmax(100px, auto)' }}>
        <WorkCard plan={myPlans[0]} count={myPlans.length} onClick={() => openModal('work')} />
        <WeatherCard weather={dashboardInfo?.weather} />
        <EmergencyAlertCard alert={dashboardInfo?.emergency_alert} onClick={() => openModal('alert')} />
        <RiskCard risks={myRisks} onClick={() => openModal('risk')} />
        <SafetyInfoCard count={dashboardInfo?.safety_infos?.length} onClick={() => openModal('safety')} />
        <AttendanceCard projectInfo={dashboardInfo?.user_info} />
        <NoticeBar notice={dashboardInfo?.notices?.[0]} onClick={() => openModal('notice')} />
        <StatCards violations={dashboardInfo?.safety_violations_count} incidentFreeDays={dashboardInfo?.incident_free_days} />
      </div>

      <style>{`
        .dashboard-card { padding: 1rem; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer; transition: transform 0.2s; position: relative; overflow: hidden; }
        .dashboard-card:active { transform: scale(0.98); }
        @keyframes blink { 50% { opacity: 0.5; } }
      `}</style>
      
      {/* 모달 모음 */}
      <WorkDetailModal isOpen={activeModal === 'work'} onClose={closeModal} plans={myPlans} selectedIndex={selectedPlanIndex} setSelectedIndex={setSelectedPlanIndex} />
      <RiskDetailModal isOpen={activeModal === 'risk'} onClose={closeModal} risks={myRisks} onFetchLocation={handleViewLocation} />
      <NoticeModal isOpen={activeModal === 'notice'} onClose={closeModal} notices={dashboardInfo?.notices} />
      <EmergencyAlertModal isOpen={activeModal === 'alert'} onClose={closeModal} alert={dashboardInfo?.emergency_alert} />
      <SafetyInfoModal isOpen={activeModal === 'safety'} onClose={closeModal} safetyInfos={dashboardInfo?.safety_infos} />
      <WorkerSettingsModal isOpen={activeModal === 'settings'} onClose={closeModal} showMapOnHome={showMapOnHome} mapExpandedByDefault={mapExpandedByDefault} onShowMapOnHomeChange={saveShowMapOnHome} onMapExpandedByDefaultChange={saveMapExpandedByDefault} />
      
      {/* 위험 신고 모달 */}
      <DangerReportModal 
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        zone={selectedZoneForReport}
        projectId={projectId}
        onSuccess={handleReportSuccess}
      />
      
      {/* 위험 구역 상세 모달 */}
      <DangerZoneDetailModal 
        open={showDangerDetailModal}
        onClose={() => setShowDangerDetailModal(false)}
        risk={selectedDangerZone}
      />

    </div>
  );
};

export default WorkerDashboard;
