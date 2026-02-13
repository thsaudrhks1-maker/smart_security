import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { 
  Building2, Users, ShieldCheck, 
  Map as MapIcon, TrendingUp, UserCheck, 
  Activity, Zap, Brain, Bell, Clock, Info
} from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import SmartSiteMap from '@/components/common/SmartSiteMap';
import NoticeManagementWidget from '@/components/common/NoticeManagementWidget';
import './ManagerDashboard.css';

/**
 * [MANAGER] 현장 관리자 프리미엄 대시보드 - AI 안전 중심 & 하단 스크롤 최적화
 */
const ManagerDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [currentLevel, setCurrentLevel] = useState('1F');
    const [project, setProject] = useState(null);
    const [detail, setDetail] = useState(null);
    const [zonesData, setZonesData] = useState([]);
    
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const projectRes = await projectApi.getProjects();
            const allProjects = projectRes.data?.data || [];
            
            // [수정] 현재 로그인한 사용자의 project_id와 일치하는 프로젝트 찾기
            let currentProject = allProjects.find(p => p.id === user?.project_id);
            
            // 만약 못 찾았다면 첫 번째(기존 로직) 사용
            if (!currentProject && allProjects.length > 0) {
                currentProject = allProjects[0];
            }
            
            if (currentProject) {
                setProject(currentProject);
                const detailRes = await projectApi.getProjectDetail(currentProject.id);
                setDetail(detailRes.data.data);
                
                const today = new Date().toISOString().split('T')[0];
                const zonesRes = await projectApi.getZonesWithDetails(currentProject.id, today);
                setZonesData(zonesRes.data?.data || []);
            }
        } catch (error) {
            console.error('❌ 대시보드 데이터 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveWorker = async (workerId) => {
        if (!project || !workerId) return;
        try {
            if (!window.confirm("해당 작업자를 이 프로젝트의 공식 멤버로 승인하시겠습니까?")) return;
            
            await projectApi.approveWorker(project.id, workerId);
            alert("승인이 완료되었습니다. 이제 해당 작업자는 현장 출입 및 작업이 가능합니다.");
            loadDashboardData(); // 통계 및 목록 갱신
        } catch (error) {
            console.error('❌ 승인 처리 실패:', error);
            alert("승인 처리 중 오류가 발생했습니다.");
        }
    };
    
    const allPlans = [];
    const allDangers = [];
    zonesData.forEach(zone => {
        (zone.tasks || []).forEach(task => allPlans.push({ ...task, zone_name: zone.name, level: zone.level }));
        (zone.dangers || []).forEach(danger => allDangers.push({ ...danger, zone_name: zone.name, level: zone.level }));
    });
    
    // 실제 데이터 기반 매핑
    const dashboardData = {
        project: {
            name: project?.name || "세종대로 스마트 신축현장",
            client: detail?.client?.name || project?.client_company || "서울",
            constructor: detail?.constructor?.name || project?.constructor_company || "건설",
            manager: detail?.manager?.full_name || user?.full_name || "김씨",
            progress: 67,
            daysLeft: 45,
            period: `${project?.start_date || '2024.03'} ~ ${project?.end_date || '2026.05'}`,
            safetyRate: "98.5%"
        },
        stats: {
            totalWorkers: (detail?.approved_workers?.length || 0) + (detail?.manager ? 1 : 0),
            presentToday: detail?.attendance?.length || 0,
            riskScore: 87,
            tasksTotal: detail?.work_tasks?.length || 0,
            tasksCompleted: detail?.work_tasks?.filter(t => t.status === 'COMPLETED').length || 0,
            equipmentActive: 38,
            equipmentTotal: 45
        },
        aiSafety: {
            riskLevel: "NORMAL",
            riskScore: 32,
            prediction: "오후 강풍 예보(3.5m/s 이상)로 인한 고소작업 및 타워크레인 운용 주의 요망",
            alerts: [
                { id: 1, time: "14:10", msg: "3구역 근로자 안전모 미착용 감지", type: "WARN" },
                { id: 2, time: "13:45", msg: "중장비(굴착기) 반경 내 접근 근로자 알림", type: "DANGER" }
            ]
        },
        recentActivities: detail?.attendance?.slice(0, 10).map(a => ({
            time: a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00",
            user: a.full_name,
            action: `${a.company_name} 소장/작업자 출근 체크`,
            type: "attendance"
        })) || [],
        pendingApprovals: detail?.pending_workers?.map(w => ({
            id: w.id,
            name: w.full_name,
            company: w.company_name,
            role: w.job_title || "작업자"
        })) || [],
        weather: { temp: "12°C", humidity: "45%", wind: "2.5m/s" },
        zones: zonesData,
        plans: allPlans,
        risks: allDangers
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner">🔄</div>
            <div className="loading-text">현장 AI 분석 엔진 가동 중...</div>
        </div>
    );

    return (
        <div className="manager-dashboard-container" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                
                {/* 헤더 - 스마트 스타일 */}
                <div className="manager-header" style={{ padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '12px' }}>
                            <Brain size={20} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, color: 'white', letterSpacing: '-0.03em' }}>현장 관리 AI 대시보드</h1>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{dashboardData.project.name} · {dashboardData.project.manager}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>조회 날짜</div>
                            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#60a5fa' }}>2026-02-12</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>공사 진행</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#22c55e' }}>{dashboardData.project.progress}%</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>남은 기간</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#3b82f6' }}>{dashboardData.project.daysLeft}일</div>
                        </div>
                    </div>
                </div>

                {/* 전술 지휘 바디 - 지도 상단 이동 및 통계 카드 압축 레이아웃 */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '650px 1.4fr 1fr', 
                    gap: '1rem', 
                    flex: 1, 
                    minHeight: 0,
                    paddingBottom: '1rem'
                }}>
                    
                    {/* [좌측 컬럼] 현장 모니터링 앵커 (650px) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                        {/* 실시간 현장지도 (최상단 이동) */}
                        <div className="manager-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', height: '520px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '6px', borderRadius: '8px' }}>
                                        <MapIcon size={18} color="#3b82f6" />
                                    </div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>실시간 현장지도</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {/* [수정] 하드코딩 대신 실제 데이터에 있는 모든 층을 자동으로 추출하여 표시합니다. */}
                                    {Array.from(new Set(zonesData.map(z => z.level)))
                                        .sort((a, b) => {
                                            const order = { 'B1': -1, '1F': 1, '2F': 2, '3F': 3, '4F': 4, '5F': 5 };
                                            return (order[a] || 0) - (order[b] || 0);
                                        })
                                        .map(level => (
                                            <button 
                                                key={level} 
                                                className={`level-button ${currentLevel === level ? 'active' : ''}`} 
                                                onClick={() => setCurrentLevel(level)} 
                                                style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: '900' }}
                                            >
                                                {level}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="map-container-premium" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden' }}>
                                <SmartSiteMap 
                                    projectId={project?.id}
                                    zoom={19}
                                    zones={dashboardData.zones.filter(z => z.level === currentLevel)}
                                    plans={dashboardData.plans} 
                                    risks={dashboardData.risks} 
                                    currentLevel={currentLevel}
                                />
                            </div>
                        </div>

                        {/* AI 위험 예측 & 현장 요약 (세로 적층) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
                            <div className="manager-card" style={{ 
                                padding: '1rem 1.2rem', 
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%)', 
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Zap size={16} color="#60a5fa" />
                                    <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0 }}>AI 실시간 위험 예측</h2>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '700', lineHeight: '1.4', padding: '8px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                    "{dashboardData.aiSafety.prediction}"
                                </div>
                            </div>

                            <div className="manager-card" style={{ padding: '1.2rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                                    <Building2 size={18} color="#8b5cf6" />
                                    <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0 }}>현장 정보 브리핑</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                                    <InfoRowCompact label="발주처" value={dashboardData.project.client} />
                                    <InfoRowCompact label="시공사" value={dashboardData.project.constructor} />
                                    <InfoRowCompact label="현장소장" value={dashboardData.project.manager} />
                                    <InfoRowCompact label="공사기간" value={dashboardData.project.period} />
                                    <StatItem label="안전 이수율" value={dashboardData.project.safetyRate} />
                                    <StatItem label="현재 온도" value={dashboardData.weather.temp} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* [중앙/우측 컨테이너] - 상단 통계 + 하단 (공지/활동) */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                        
                        {/* 상단 섹션: 4대 핵심 지표 (우측 폭에 압축 배치) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', flexShrink: 0 }}>
                            <StatCard icon={<Users size={20} />} label="총 인원" value={dashboardData.stats.totalWorkers} subValue={`출근 ${dashboardData.stats.presentToday}`} color="#3b82f6" />
                            <StatCard icon={<ShieldCheck size={20} />} label="안전 점수" value={dashboardData.stats.riskScore} subValue="우수" color="#10b981" />
                            <StatCard icon={<TrendingUp size={20} />} label="작업 진행" value={`${dashboardData.stats.tasksCompleted}/${dashboardData.stats.tasksTotal}`} subValue="75%" color="#8b5cf6" />
                            <StatCard icon={<Activity size={20} />} label="장비 가동" value={`${dashboardData.stats.equipmentActive}/${dashboardData.stats.equipmentTotal}`} subValue="정상" color="#f59e0b" />
                        </div>

                        {/* 하단 섹션: 공지 및 현장 소통 그리드 */}
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minHeight: 0 }}>
                            {/* 중앙 센터: 현장 공지 */}
                            <div style={{ height: '100%', minHeight: 0 }}>
                                <NoticeManagementWidget projectId={project?.id || 1} />
                            </div>

                            {/* 우측 사이드: 활동 로그 및 승인 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                                <div className="manager-card" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                    <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Bell size={18} color="#3b82f6" />
                                        <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0 }}>실시간 활동 로그</h2>
                                    </div>
                                    <div className="scroll-section" style={{ flex: 1, padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {dashboardData.recentActivities.map((activity, idx) => (
                                                <div key={idx} style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.3)', borderLeft: '3px solid #3b82f6', borderRadius: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#f1f5f9' }}>{activity.user}</span>
                                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{activity.time}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', wordBreak: 'keep-all' }}>{activity.action}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="manager-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                    <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <UserCheck size={18} color="#f59e0b" />
                                        <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0 }}>신규 승인 대기</h2>
                                        <div style={{ marginLeft: 'auto', background: '#f59e0b', color: 'white', padding: '2px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' }}>{dashboardData.pendingApprovals.length}</div>
                                    </div>
                                    <div className="scroll-section" style={{ flex: 1, padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {dashboardData.pendingApprovals.map((worker) => (
                                                <div key={worker.id} style={{ padding: '10px 12px', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.15)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#f1f5f9' }}>{worker.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{worker.company}</div>
                                                    </div>
                                                    <button 
                                                        className="approve-button" 
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: '900' }}
                                                        onClick={() => handleApproveWorker(worker.id)}
                                                    >
                                                        승인
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, subValue, color }) => (
    <div className="manager-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <div style={{ background: `${color}15`, padding: '8px', borderRadius: '10px' }}>
            {React.cloneElement(icon, { color, size: 20 })}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>{label}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#f1f5f9' }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color, fontWeight: '800', opacity: 0.8 }}>{subValue}</div>
    </div>
);

const InfoRowCompact = ({ label, value }) => (
    <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2px', fontWeight: '800' }}>{label}</div>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f1f5f9' }}>{value}</div>
    </div>
);

const StatItem = ({ label, value }) => (
    <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f1f5f9' }}>{value}</span>
    </div>
);

export default ManagerDashboard;
