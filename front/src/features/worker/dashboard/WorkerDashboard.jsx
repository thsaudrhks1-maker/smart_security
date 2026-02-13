
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { safetyApi } from '@/api/safetyApi';
import { projectApi } from '@/api/projectApi';
import { workApi } from '@/api/workApi';
import { Shield, Bell, Map as MapIcon, Info, LayoutDashboard, Clock } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import AttendanceCard from './AttendanceCard';
import SmartSiteMap from '@/components/common/SmartSiteMap';
import WorkerMainTiles from './WorkerMainTiles';
import DailyChecklistModal from './DailyChecklistModal';
// import DangerZoneModal from '@/components/common/DangerZoneModal';
import { SafetyGuideModal } from './DashboardModals';
import { getMyAttendance } from '@/api/attendanceApi';
import { noticeApi } from '@/api/noticeApi';
import { X, Volume2, AlertTriangle, Megaphone, CheckCircle, HelpCircle } from 'lucide-react';
import ZoneDetailModal from '@/components/common/ZoneDetailModal';
import DangerZoneGallery from '@/components/common/DangerZoneGallery';
import BeaconScannerTest from '../components/BeaconScannerTest';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [attendance, setAttendance] = useState(null); // [추가] 출근 상태
    const [zones, setZones] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mySafetyLogs, setMySafetyLogs] = useState([]); 
    const [currentLevel, setCurrentLevel] = useState('1F');
    const [latestNotice, setLatestNotice] = useState(null);
    const [notices, setNotices] = useState([]); // 전체 공지 리스트 추가
    const latestNoticeRef = React.useRef(null);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // 이력 모달 상태
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    
    // 긴급 알람 상태
    const [latestEmergency, setLatestEmergency] = useState(null);
    const [showEmergency, setShowEmergency] = useState(false);
    const [lastAlertId, setLastAlertId] = useState(localStorage.getItem('last_emergency_id'));
    
    const [selectedZone, setSelectedZone] = useState(null);
    const [isMapVisible, setIsMapVisible] = useState(true); // 지도 기본 펼침
    
    // 일반 공지 모달 상태
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [activeNotice, setActiveNotice] = useState(null);
    const [showPushModal, setShowPushModal] = useState(false);
    const [activePushAlert, setActivePushAlert] = useState(null);
    const [showScanner, setShowScanner] = useState(false); // [NEW] 비콘 스캐너 토글
    const [isAttendanceVisible, setIsAttendanceVisible] = useState(true); // [추가] 출결 카드 토글

    // [FIX] UTC(오전 9시 이전 날짜 문제 해결) -> 로컬 시간(KST) 기준 날짜 생성
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    // ... (findMyTaskFromZones, loadData, useEffect 등 기존 로직 유지) ...
    // findMyTaskFromZones는 아래에서 복붙되지 않으므로 기존 코드 유지 필요. 
    // 여기서는 return 문 내부 구조만 변경하겠음.

    // zones 데이터에서 내 작업 모두 찾기 함수
    const findAllMyTasks = (zonesList) => {
        if (!user || !zonesList || zonesList.length === 0) return [];
        const myTasks = [];
        const currentUserId = Number(user.id || user.user_id);
        const currentUserName = (user.full_name || '').replace(/\s/g, ''); // 공백 제거 후 비교

        zonesList.forEach(zone => {
            if (zone.tasks && Array.isArray(zone.tasks)) {
                zone.tasks.forEach(task => {
                     if (task.workers && Array.isArray(task.workers)) {
                        // [FIX] ID 또는 성명(공백 무시)으로 매칭
                        const isMine = task.workers.some(w => {
                            if (typeof w === 'object' && w !== null) {
                                const wid = Number(w.id || w.worker_id || w.user_id);
                                const wname = (w.full_name || '').replace(/\s/g, '');
                                return (wid === currentUserId) || (wname === currentUserName);
                            }
                            return Number(w) === currentUserId;
                        });
                        
                        if (isMine) {
                            myTasks.push({ 
                                ...task, 
                                id: task.id || task.task_id,
                                zone_name: zone.name, 
                                level: zone.level 
                            });
                        }
                     }
                });
            }
        });
        return myTasks;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const projectId = user?.project_id || 1;
            
            // API 호출 시도
            const [projectRes, zonesRes] = await Promise.allSettled([
                projectApi.getProject(projectId),
                projectApi.getZonesWithDetails(projectId, selectedDate)
            ]);
            
            // 프로젝트 정보 처리 (실패 시 null 유지)
            if (projectRes.status === 'fulfilled' && projectRes.value?.data?.success) {
                const p = projectRes.value.data.data;
                setProject({
                    ...p,
                    lat: p.lat || 37.5665,
                    lng: p.lng || 126.9780,
                    grid_rows: p.grid_rows || 10,
                    grid_cols: p.grid_cols || 10,
                    grid_spacing: p.grid_spacing || 10,
                    grid_angle: p.grid_angle || 0
                });
            } else {
                setProject(null);
            }
            
            // 구역 및 작업 정보 처리 (실패 시 빈 배열 [] 유지)
            const zonesData = (zonesRes.status === 'fulfilled' ? zonesRes.value?.data?.data : []) || [];
            setZones(zonesData);

            const myTasks = findAllMyTasks(zonesData);
            setPlans(myTasks);
            
            const currentUserId = user?.id || user?.user_id;

            // 출근 정보 로드
            if (projectId && currentUserId) {
                 try {
                     const attRes = await getMyAttendance(currentUserId);
                     if (attRes.data?.success) {
                         setAttendance(attRes.data.data);
                         if (attRes.data.data) setIsAttendanceVisible(false); // [추가] 출근 완료 시 자동 접힘
                     }

                     const logRes = await workApi.getMySafetyLogs(projectId, currentUserId, selectedDate);
                     if (logRes?.success) setMySafetyLogs(logRes.data);
                 } catch (e) { 
                     setAttendance(null);
                     setMySafetyLogs([]); 
                 }
            }

            if (myTasks.length > 0) {
                setCurrentLevel(myTasks[0].level);
            }

            // 공지사항
            try {
                const noticeRes = await noticeApi.getNotices(projectId, selectedDate);
                if (noticeRes.data?.success) {
                    const noticeList = noticeRes.data.data || [];
                    setNotices(noticeList);
                    if (noticeList.length > 0) {
                        setLatestNotice(noticeList[0]);
                        latestNoticeRef.current = noticeList[0];
                    }
                }
            } catch (e) {
                setNotices([]);
            }

        } catch (e) {
            console.error('근로자 대시보드 로드 실패:', e);
            // 에러 시 기본값 강제 설정
            setProject(null);
            setZones([]);
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        loadData(); 
        
        let eventSource = null;

        const connectSSE = () => {
            if (eventSource) return; // 이미 연결되어 있으면 중복 생성 방지

            const projectId = user?.project_id || 1;
            const userId = user?.id || user?.user_id;
            const sseUrl = noticeApi.getSseUrl(projectId, userId);
            
            console.log('📡 SSE 실시간 알림 채널 연결 시도:', sseUrl);
            eventSource = new EventSource(sseUrl);
            
            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    // 1. 공지사항 (Notice)
                    if (message.type === 'NEW_NOTICE') {
                        const notice = message.data;
                        setNotices(prev => [notice, ...prev.slice(0, 19)]);
                        if (notice.notice_type === 'EMERGENCY') {
                            setLatestEmergency(notice);
                            setShowEmergency(true);
                        } else {
                            setLatestNotice(notice);
                            latestNoticeRef.current = notice;
                            setActiveNotice(notice);
                            setShowNoticeModal(true);
                        }
                    } 
                    
                    // 2. 실시간 푸시 알림 (Push Alert)
                    else if (message.type === 'PUSH_ALERT') {
                        setActivePushAlert(message.data);
                        setShowPushModal(true);
                    }
                } catch (e) {
                    console.error('SSE 데이터 파싱 실패:', e);
                }
            };

            eventSource.onerror = () => {
                console.error('❌ SSE 연결 오류. 재연결 시도...');
                eventSource.close();
                eventSource = null;
            };
        };

        const disconnectSSE = () => {
            if (eventSource) {
                console.log('🔌 SSE 연결 해제');
                eventSource.close();
                eventSource = null;
            }
        };

        // 브라우저 탭 활성 상태에 따른 제어
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                connectSSE();
            } else {
                disconnectSSE(); // 탭을 가리면 서버 연결을 끊어줌 (서버 종료 원활)
            }
        };

        connectSSE();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            disconnectSSE();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, selectedDate, lastAlertId]);

    const handleCloseEmergency = async () => {
        if (latestEmergency) {
            localStorage.setItem('last_emergency_id', String(latestEmergency.id));
            setLastAlertId(String(latestEmergency.id));
            // 서버에 확인 기록
            try {
                await noticeApi.markAsRead(latestEmergency.id, user?.id || user?.user_id);
            } catch (e) { console.error('확인 기록 실패', e); }
        }
        setShowEmergency(false);
    };

    const handleCloseNotice = async () => {
        if (activeNotice) {
            // 서버에 확인 기록
            try {
                await noticeApi.markAsRead(activeNotice.id, user?.id || user?.user_id);
            } catch (e) { console.error('확인 기록 실패', e); }
        }
        setShowNoticeModal(false);
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
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.25rem', color: '#f1f5f9', paddingBottom: '100px', position: 'relative', zIndex: 1 }}>
            {/* 상단 통합 헤더 - 프리미엄 스타일 */}
            <header style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', 
                padding: '1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '950', margin: 0, color: '#fff', letterSpacing: '-0.03em' }}>
                            {isToday ? '오늘도 안전하게! 🛡️' : '현장 리포트'}
                        </h2>
                        {/* 출근 상태 배지 추가 */}
                        {isToday && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: attendance ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: attendance ? '#10b981' : '#f87171',
                                padding: '5px 12px', borderRadius: '12px',
                                fontSize: '0.75rem', fontWeight: '900',
                                border: `1px solid ${attendance ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                marginRight: '10px'
                            }}>
                                {attendance ? <CheckCircle size={14} /> : <HelpCircle size={14} />}
                                {attendance ? '정시 출근' : '미출근'}
                            </div>
                        )}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                     <p style={{ fontSize: '0.85rem', color: '#3b82f6', margin: 0, fontWeight: '900' }}>{user?.full_name} <span style={{ color: '#94a3b8', fontWeight: '700' }}>님</span></p>
                     <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                     <input 
                       type="date"
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                       style={{ 
                         border: 'none', background: 'transparent', fontSize: '0.8rem', 
                         color: '#94a3b8', cursor: 'pointer', outline: 'none', fontWeight: '700'
                       }}
                     />
                   </div>
                </div>
                <button 
                  onClick={() => setIsGuideModalOpen(true)}
                  style={{ 
                      width: '42px', height: '42px', background: 'rgba(245, 158, 11, 0.1)', 
                      border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '14px', 
                      color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer', transition: '0.3s' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
                >
                  <Bell size={20} />
                </button>
            </header>

            {/* 지도 토글 - 프리미엄 익스팬더 */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div 
                    onClick={() => setIsMapVisible(!isMapVisible)}
                    style={{ 
                        width: '100%', padding: '0.8rem 1.25rem', 
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', marginBottom: isMapVisible ? '0.75rem' : '0',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <MapIcon size={18} color="#60a5fa" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff', letterSpacing: '-0.02em' }}>실시간 현장 지도</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>나의 위치와 위험구역 모니터링</div>
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                         {isMapVisible ? '▲' : '▼'}
                    </div>
                </div>

                {isMapVisible && (
                    <section id="work-map-section" style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '1.25rem', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
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
                                background: currentLevel === level ? '#3b82f6' : 'rgba(15, 23, 42, 0.5)',
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
                          <span style={{ color: '#60a5fa' }}>작업 {taskCount}</span>
                          <span style={{ color: '#f87171' }}>위험 {dangerCount}</span>
                        </div>
                      </div>
                      
                      <div style={{ height: '350px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        {project && (
                          <SmartSiteMap 
                            projectId={project.id}
                            highlightLevel={currentLevel}
                            myZoneNames={myPlans.map(p => p.zone_name)}
                            zones={zones}
                            user={user}
                            onZoneClick={(zoneData) => {
                              setSelectedZone(zoneData);
                              setIsDetailModalOpen(true);
                            }}
                          />
                        )}
                      </div>

                      {/* 위험 구역 사진첩 (모바일용 토글) */}
                      <div style={{ marginTop: '1rem' }}>
                          <DangerZoneGallery 
                              zones={zones}
                              currentLevel={currentLevel}
                              onZoneClick={(zone) => {
                                  setSelectedZone(zone);
                                  setIsDetailModalOpen(true);
                              }}
                              isCollapsible={true}
                              defaultExpanded={false}
                          />
                      </div>
                    </section>
                )}
            </div>

            {/* 출역 관리 센터 토글 */}
            <div style={{ marginBottom: '1.5rem', padding: '0 1rem' }}>
                <div 
                    onClick={() => setIsAttendanceVisible(!isAttendanceVisible)}
                    style={{ 
                        width: '100%', padding: '0.8rem 1.25rem', 
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', marginBottom: isAttendanceVisible ? '0.75rem' : '0',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)', transition: 'all 0.4s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <Clock size={18} color="#60a5fa" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff', letterSpacing: '-0.02em' }}>출역 관리 센터</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>
                                {attendance ? `${new Date(attendance.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 출근 완료` : '미출근 상태'}
                            </div>
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                         {isAttendanceVisible ? '▲' : '▼'}
                    </div>
                </div>

                {isAttendanceVisible && (
                    <AttendanceCard 
                        projectInfo={{ 
                            project_id: project?.id, 
                            project_name: project?.name || '담당 현장' 
                        }} 
                        onCheckInSuccess={() => {
                            loadData();
                            setIsAttendanceVisible(false); // 출근 성공 시 자동으로 접기
                        }}
                    />
                )}
            </div>

            {/* 타일 그리드 */}
            <WorkerMainTiles 
                project={project}
                myPlan={myPlan ? { 
                    ...myPlan, 
                    isChecked: mySafetyLogs.some(log => log.plan_id === (myPlan.task_id || myPlan.id)) 
                } : null}
                dangerCount={dangerCount}
                notices={notices} // 수정: 리스트 전달
                onChecklistClick={() => setIsChecklistModalOpen(true)}
                onNoticeClick={() => setIsHistoryModalOpen(true)} // 추가
            />
            
            {/* 구역 상세 모달 (작업 계획 보기 + 위험 신고) */}
            {isDetailModalOpen && selectedZone && (
                <ZoneDetailModal 
                    zone={selectedZone}
                    date={selectedDate}
                    projectId={user?.project_id}
                    approvedWorkers={[]} // 근로자는 배정 정보 수정 불가하므로 빈 배열
                    onClose={() => setIsDetailModalOpen(false)}
                    initialViewerType="WORKER"
                />
            )}
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

            {/* 일반/중요 공지 모달 오버레이 */}
            {showNoticeModal && activeNotice && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9998, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
                }}>
                    <div style={{ 
                        width: '100%', maxWidth: '400px', background: 'white', borderRadius: '30px', 
                        overflow: 'hidden', border: `3px solid ${activeNotice.notice_type === 'IMPORTANT' ? '#f59e0b' : '#6366f1'}`
                    }}>
                        <div style={{ background: activeNotice.notice_type === 'IMPORTANT' ? '#f59e0b' : '#6366f1', padding: '15px', textAlign: 'center', color: 'white' }}>
                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                <Info size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>
                                {activeNotice.notice_type === 'IMPORTANT' ? '⚠️ 중요 공지사항' : '📢 신규 공지사항'}
                            </h3>
                        </div>
                        <div style={{ padding: '25px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                                {activeNotice.title}
                            </div>
                            <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5', background: '#f8fafc', padding: '15px', borderRadius: '15px', textAlign: 'left' }}>
                                {activeNotice.content}
                            </div>
                            <button 
                                onClick={handleCloseNotice}
                                style={{ 
                                    marginTop: '25px', width: '100%', padding: '14px', 
                                    background: '#0f172a', color: 'white', border: 'none', 
                                    borderRadius: '15px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' 
                                }}
                            >
                                확인했습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 공지사항 전체 이력 모달 (새로 추가) */}
            {isHistoryModalOpen && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{ 
                        width: '100%', maxWidth: '450px', background: 'white', borderRadius: '30px', 
                        height: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div style={{ background: '#6366f1', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Megaphone size={20} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>전체 공지사항</h3>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                            {notices.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>도착한 공지가 없습니다.</div>
                            ) : notices.map(n => (
                                <div 
                                    key={n.id} 
                                    onClick={() => {
                                        setActiveNotice(n);
                                        setShowNoticeModal(true);
                                    }}
                                    style={{ 
                                        padding: '18px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                        background: n.notice_type === 'IMPORTANT' ? '#fffbeb' : 'white',
                                        borderRadius: '15px', marginBottom: '8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ 
                                            fontSize: '0.7rem', fontWeight: '900', color: 'white', 
                                            background: n.notice_type === 'IMPORTANT' ? '#f59e0b' : '#6366f1',
                                            padding: '2px 6px', borderRadius: '4px'
                                        }}>
                                            {n.notice_type === 'IMPORTANT' ? '중요' : '공지'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>{n.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {n.content}
                                    </div>
                                </div>
                            ))}
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
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
            
            {/* 실시간 커스텀 푸시 알림 모달 */}
            {showPushModal && activePushAlert && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ 
                        width: '100%', maxWidth: '400px', 
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
                        borderRadius: '35px', overflow: 'hidden', 
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'fadeInUp 0.4s ease-out'
                    }}>
                        <div style={{ 
                            background: 'rgba(59, 130, 246, 0.15)', padding: '25px', 
                            textAlign: 'center', color: '#fff',
                            borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <div style={{ 
                                width: '60px', height: '60px', background: '#3b82f6', 
                                borderRadius: '20px', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', margin: '0 auto 15px auto',
                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4)'
                            }}>
                                <Volume2 size={32} color="white" />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '950', margin: 0, letterSpacing: '-0.02em' }}>현장 관리자 호출</h3>
                            <p style={{ margin: '8px 0 0 0', opacity: 0.7, fontSize: '0.85rem', fontWeight: '700' }}>실시간 안전 메시지</p>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ 
                                background: 'rgba(15, 23, 42, 0.5)', padding: '20px', 
                                borderRadius: '20px', marginBottom: '25px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#3b82f6', marginBottom: '10px' }}>
                                    {activePushAlert.title}
                                </div>
                                <div style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.6', fontWeight: '600' }}>
                                    {activePushAlert.content}
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowPushModal(false)}
                                style={{ 
                                    width: '100%', padding: '18px', 
                                    background: '#3b82f6', color: 'white', border: 'none', 
                                    borderRadius: '18px', fontWeight: '950', fontSize: '1.1rem', 
                                    cursor: 'pointer', transition: '0.3s',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                확인하였습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerDashboard;
