
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { safetyApi } from '@/api/safetyApi';
import { projectApi } from '@/api/projectApi';
import { workApi } from '@/api/workApi';
import { Shield, Bell, Map as MapIcon, Info, LayoutDashboard } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import AttendanceCard from './AttendanceCard';
import WorkerMainTiles from './WorkerMainTiles';
import DailyChecklistModal from './DailyChecklistModal';
import DangerReportModal from './DangerReportModal';
import { SafetyGuideModal } from './DashboardModals';
import { noticeApi } from '@/api/noticeApi';
import { X, Volume2, AlertTriangle } from 'lucide-react';

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [zones, setZones] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mySafetyLogs, setMySafetyLogs] = useState([]); 
    const [currentLevel, setCurrentLevel] = useState('1F');

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    
    // 긴급 알람 상태
    const [latestEmergency, setLatestEmergency] = useState(null);
    const [showEmergency, setShowEmergency] = useState(false);
    const [lastAlertId, setLastAlertId] = useState(localStorage.getItem('last_emergency_id'));
    
    const [selectedZone, setSelectedZone] = useState(null);
    const [isMapVisible, setIsMapVisible] = useState(true); // 지도 기본 펼침

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // ... (findMyTaskFromZones, loadData, useEffect 등 기존 로직 유지) ...
    // findMyTaskFromZones는 아래에서 복붙되지 않으므로 기존 코드 유지 필요. 
    // 여기서는 return 문 내부 구조만 변경하겠음.

    // zones 데이터에서 내 작업 모두 찾기 함수
    const findAllMyTasks = (zonesList) => {
        if (!user || !zonesList) return [];
        const myTasks = [];
        for (const zone of zonesList) {
            if (zone.tasks && Array.isArray(zone.tasks)) {
                for (const task of zone.tasks) {
                     if (task.workers && Array.isArray(task.workers)) {
                        const isMine = task.workers.some(w => Number(w.id) === Number(user.id || user.user_id));
                        if (isMine) myTasks.push({ ...task, zone_name: zone.name, level: zone.level });
                     }
                }
            }
        }
        return myTasks;
    };

    const loadData = async () => {
        try {
            const projectId = user?.project_id || 1;
            
            const [projectRes, zonesRes] = await Promise.all([
                projectApi.getProject(projectId),
                projectApi.getZonesWithDetails(projectId, selectedDate)
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
            setZones(zonesData);

            const myTasks = findAllMyTasks(zonesData);
            setPlans(myTasks);
            
            // 추가: 나의 안전 점검 로그 조회하여 '점검 완료' 상태 확인
            const currentUserId = user?.id || user?.user_id;
            if (projectId && currentUserId) {
                 const logRes = await workApi.getMySafetyLogs(projectId, currentUserId, selectedDate);
                 if (logRes?.success) {
                     setMySafetyLogs(logRes.data);
                 }
            }

            if (myTasks.length > 0) {
                setCurrentLevel(myTasks[0].level);
            }

        } catch (e) {
            console.error('근로자 대시보드 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    const checkEmergency = async () => {
        const projectId = user?.project_id || 1;
        try {
            const res = await noticeApi.getLatestEmergency(projectId);
            if (res.data?.data) {
                const alert = res.data.data;
                // 새로운 알람이거나, 이전에 닫았던 알람이 아닐 경우
                if (String(alert.id) !== String(lastAlertId)) {
                    setLatestEmergency(alert);
                    setShowEmergency(true);
                }
            }
        } catch (e) {
            console.error('긴급 알람 체크 실패:', e);
        }
    };

    useEffect(() => { 
        loadData(); 
        // 10초마다 긴급 알람 체크
        const emergencyTimer = setInterval(checkEmergency, 10000);
        checkEmergency(); // 초기 로드 시 1회 실행
        return () => clearInterval(emergencyTimer);
    }, [user, selectedDate, lastAlertId]);

    const handleCloseEmergency = () => {
        if (latestEmergency) {
            localStorage.setItem('last_emergency_id', String(latestEmergency.id));
            setLastAlertId(String(latestEmergency.id));
        }
        setShowEmergency(false);
    };

    const myPlans = findAllMyTasks(zones);
    const myPlan = myPlans.length > 0 ? myPlans[0] : null; // 호환성 유지
    
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const displayDate = new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

    const dangerCount = Array.isArray(zones) ? zones.filter(z => z.dangers?.length > 0).length : 0;
    const taskCount = Array.isArray(zones) ? zones.filter(z => z.tasks?.length > 0).length : 0;
    
    // ... (중략) ...


    
    const levels = Array.from(new Set(zones.map(z => z.level))).sort((a, b) => {
        const order = { 'B1': -1, '1F': 1, '2F': 2, '3F': 3 };
        return (order[a] || 0) - (order[b] || 0);
    });

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.25rem', color: '#1e293b', paddingBottom: '100px' }}>
            {/* 상단 알림 및 인사 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                   <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>
                       {isToday ? '안전한 하루 되세요! 🛡️' : '지난 작업 기록'}
                   </h2>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                     <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}><strong>{user?.full_name}</strong> 님</p>
                     <input 
                       type="date"
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                       style={{ 
                         border: 'none', 
                         background: '#f1f5f9', 
                         borderRadius: '8px',
                         padding: '2px 8px',
                         fontSize: '0.8rem', 
                         color: '#64748b', 
                         cursor: 'pointer',
                         outline: 'none',
                         fontWeight: '700'
                       }}
                     />
                   </div>
                </div>
                <button 
                  onClick={() => setIsGuideModalOpen(true)}
                  style={{ width: '45px', height: '45px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Bell size={22} />
                </button>
            </div>

            {/* 지도 토글 섹션 (최상단 이동) */}
            <div style={{ marginBottom: '1.5rem' }}>
                <button 
                    onClick={() => setIsMapVisible(!isMapVisible)}
                    style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        background: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: isMapVisible ? '1rem' : '0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '12px' }}>
                            <MapIcon size={24} color="#3b82f6" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>실시간 현장 지도</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>작업 위치 및 위험 구역 확인</div>
                        </div>
                    </div>
                    <div style={{ color: '#94a3b8' }}>
                         {isMapVisible ? '접기 ▲' : '펼치기 ▼'}
                    </div>
                </button>

                {isMapVisible && (
                    <section id="work-map-section" style={{ background: 'white', padding: '1.25rem', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        {/* 층 선택 버튼 */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
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
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', fontWeight: '800' }}>
                          <span style={{ color: '#2563eb' }}>작업 {taskCount}</span>
                          <span style={{ color: '#dc2626' }}>위험 {dangerCount}</span>
                        </div>
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
                    </section>
                )}
            </div>

            {/* 메인 출석 카드 */}
            <AttendanceCard projectInfo={{ project_id: project?.id, project_name: '금일 현장' }} />
            <div style={{ height: '24px' }} />

            {/* 타일 그리드 */}
            <WorkerMainTiles 
                project={project}
                myPlan={myPlan ? { 
                    ...myPlan, 
                    isChecked: mySafetyLogs.some(log => log.plan_id === (myPlan.task_id || myPlan.id)) 
                } : null}
                dangerCount={dangerCount}
                onChecklistClick={() => setIsChecklistModalOpen(true)}
            />

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
            <DailyChecklistModal
                isOpen={isChecklistModalOpen}
                onClose={() => setIsChecklistModalOpen(false)}
                myPlans={myPlans}
                dangerCount={dangerCount}
                nearbyDangers={zones
                    .filter(z => z.level === currentLevel)
                    .flatMap(z => (z.dangers || []).map(d => ({ 
                        ...d, 
                        zone_name: z.name,
                        isMyZone: myPlans.some(p => p.zone_name === z.name && p.level === z.level)
                    })))
                }
                onSubmit={async ({ planResults, dangerResults }) => {
                    try {
                        const payload = {
                            project_id: user?.project_id,
                            worker_id: user?.id || user?.user_id,
                            plan_results: planResults,
                            // danger_results: dangerResults // 현재 API 스펙에는 없으나 추후 확장 시 사용
                        };
                        
                        await workApi.submitSafetyCheck(payload);
                        alert("안전점검이 완료되었습니다. 오늘도 안전하게 작업하세요!");
                        setIsChecklistModalOpen(false);
                        loadData(); // 데이터 새로고침 (상태 업데이트 반영)
                    } catch (error) {
                        console.error("안전점검 제출 실패:", error);
                        alert("점검 결과 제출 중 오류가 발생했습니다.");
                    }
                }}
                isSubmitted={myPlan && mySafetyLogs.some(log => log.plan_id === myPlan.id || log.plan_id === myPlan.task_id)}
            />

            {/* 긴급 알람 오버레이 */}
            {showEmergency && latestEmergency && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
                }}>
                    <div style={{ 
                        width: '100%', maxWidth: '400px', background: 'white', borderRadius: '30px', 
                        overflow: 'hidden', border: '5px solid #dc2626', animation: 'pulse 2s infinite'
                    }}>
                        <div style={{ background: '#dc2626', padding: '20px', textAlign: 'center', color: 'white' }}>
                            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                                <AlertTriangle size={48} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>🚨 긴급 안전 알람</h3>
                            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>발송: {latestEmergency.author_name || '현장 관리자'}</p>
                        </div>
                        <div style={{ padding: '25px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '15px', lineHeight: '1.4' }}>
                                {latestEmergency.title}
                            </div>
                            <div style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.6', background: '#f8fafc', padding: '15px', borderRadius: '15px', textAlign: 'left' }}>
                                {latestEmergency.content}
                            </div>
                            <button 
                                onClick={handleCloseEmergency}
                                style={{ 
                                    marginTop: '25px', width: '100%', padding: '15px', 
                                    background: '#0f172a', color: 'white', border: 'none', 
                                    borderRadius: '15px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' 
                                }}
                            >
                                확인하였습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                }
            `}} />
        </div>
    );
};

export default WorkerDashboard;
