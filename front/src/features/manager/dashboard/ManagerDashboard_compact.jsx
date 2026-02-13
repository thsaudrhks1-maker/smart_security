import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { attendanceApi } from '@/api/attendanceApi';
import { 
  Building2, Users, Calendar, ShieldCheck, 
  QrCode, ClipboardList, Info, Bell, Map as MapIcon,
  TrendingUp, CheckCircle2, UserCheck, Clock, AlertTriangle, Activity, Zap
} from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import './ManagerDashboard.css';

/**
 * [MANAGER] 현장 관리자 프리미엄 대시보드 - 한 화면 최적화
 */
const ManagerDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // 더미 데이터 (실제로는 API에서 가져옴)
    const dashboardData = {
        project: {
            name: "스마트시티 A블록 건설공사",
            client: "서울시청",
            constructor: "대한건설",
            manager: user?.full_name || "김현장",
            progress: 67,
            daysLeft: 45
        },
        stats: {
            totalWorkers: 156,
            presentToday: 142,
            absentToday: 14,
            approvedWorkers: 156,
            pendingApproval: 3
        },
        safety: {
            todayIncidents: 0,
            weekIncidents: 2,
            monthIncidents: 7,
            riskScore: 87,
            lastInspection: "2시간 전"
        },
        work: {
            tasksTotal: 24,
            tasksCompleted: 18,
            tasksInProgress: 4,
            tasksPending: 2,
            completionRate: 75
        },
        equipment: {
            total: 45,
            active: 38,
            maintenance: 5,
            idle: 2
        },
        weather: {
            temp: "12°C",
            condition: "맑음",
            humidity: "45%",
            wind: "2.5m/s"
        },
        recentActivities: [
            { time: "10:23", user: "박근로", action: "출근 체크", type: "attendance" },
            { time: "10:15", user: "이안전", action: "위험구역 점검 완료", type: "safety" },
            { time: "09:47", user: "김작업", action: "1F-C3 작업 시작", type: "work" }
        ],
        dangerZones: [
            { id: 1, level: "1F", zone: "C1", type: "추락위험", workers: 5, status: "high" },
            { id: 2, level: "1F", zone: "C3", type: "중장비", workers: 3, status: "medium" },
            { id: 3, level: "2F", zone: "A5", type: "낙하물", workers: 2, status: "high" }
        ],
        pendingApprovals: [
            { id: 1, name: "홍길동", company: "대진건설", role: "철근공" },
            { id: 2, name: "김철수", company: "세종건설", role: "비계공" },
            { id: 3, name: "이영희", company: "대진건설", role: "용접공" }
        ],
        zones: [
            { id: 1, level: "1F", zone_name: "C1", risk_type: "추락위험", x: 200, y: 150, width: 100, height: 80 },
            { id: 2, level: "1F", zone_name: "C3", risk_type: "중장비", x: 350, y: 200, width: 100, height: 80 },
            { id: 3, level: "1F", zone_name: "D3", risk_type: "낙하물", x: 350, y: 320, width: 100, height: 80 },
            { id: 4, level: "1F", zone_name: "A5", risk_type: "일반작업", x: 500, y: 100, width: 120, height: 100 },
            { id: 5, level: "1F", zone_name: "E4", risk_type: "일반작업", x: 500, y: 380, width: 120, height: 100 }
        ]
    };

    const [currentLevel, setCurrentLevel] = useState('1F');

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner">🔄</div>
            <div className="loading-text">현장 데이터를 분석 중입니다...</div>
        </div>
    );

    return (
        <div className="manager-dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 헤더 - 컴팩트 */}
                <div className="manager-header" style={{ 
                    padding: '1rem 1.5rem',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, color: 'white' }}>
                            현장 관리 대시보드
                        </h1>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                            {dashboardData.project.name} · {dashboardData.project.manager}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>공사 진행</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#22c55e' }}>
                                {dashboardData.project.progress}%
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>남은 기간</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#3b82f6' }}>
                                {dashboardData.project.daysLeft}일
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 - 2단 레이아웃 */}
                <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
                    {/* 좌측: 지도 */}
                    <div className="manager-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapIcon size={18} color="#3b82f6" />
                                <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0, color: 'white' }}>실시간 현장 지도</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {['B1', '1F', '2F'].map(level => (
                                    <button
                                        key={level}
                                        className={`level-button ${currentLevel === level ? 'active' : ''}`}
                                        onClick={() => setCurrentLevel(level)}
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="map-container-premium" style={{ flex: 1, minHeight: 0 }}>
                            <CommonMap 
                                zones={dashboardData.zones.filter(z => z.level === currentLevel)}
                                currentLevel={currentLevel}
                                onZoneClick={(zone) => console.log('Zone clicked:', zone)}
                                highlightLevel={currentLevel}
                            />
                        </div>
                    </div>

                    {/* 우측: 정보 그리드 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                        {/* 통계 카드 4개 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
                            <StatCard 
                                icon={<Users size={18} />}
                                label="총 인원"
                                value={dashboardData.stats.totalWorkers}
                                subValue={`출근 ${dashboardData.stats.presentToday}`}
                                color="#3b82f6"
                            />
                            <StatCard 
                                icon={<ShieldCheck size={18} />}
                                label="안전 점수"
                                value={dashboardData.safety.riskScore}
                                subValue="우수"
                                color="#22c55e"
                            />
                            <StatCard 
                                icon={<ClipboardList size={18} />}
                                label="작업 진행"
                                value={`${dashboardData.work.tasksCompleted}/${dashboardData.work.tasksTotal}`}
                                subValue={`${dashboardData.work.completionRate}%`}
                                color="#8b5cf6"
                            />
                            <StatCard 
                                icon={<Activity size={18} />}
                                label="장비 가동"
                                value={`${dashboardData.equipment.active}/${dashboardData.equipment.total}`}
                                subValue="정상"
                                color="#f59e0b"
                            />
                        </div>

                        {/* 2단 그리드: 위험 구역 + 날씨 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* 위험 구역 */}
                            <div className="manager-card" style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                                    <AlertTriangle size={16} color="#ef4444" />
                                    <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0, color: 'white' }}>위험 구역</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {dashboardData.dangerZones.map((zone) => (
                                        <div key={zone.id} style={{ 
                                            padding: '8px', 
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'white' }}>
                                                {zone.level} - {zone.zone}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {zone.type} · {zone.workers}명
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 날씨 */}
                            <div className="manager-card" style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                                    <Zap size={16} color="#22c55e" />
                                    <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0, color: 'white' }}>현장 날씨</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>온도</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>{dashboardData.weather.temp}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>날씨</div>
                                        <div style={{ fontSize: '1.2rem' }}>☀️</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>습도</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '900', color: 'white' }}>{dashboardData.weather.humidity}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>풍속</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '900', color: 'white' }}>{dashboardData.weather.wind}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3단 그리드: 실시간 활동 + 현장 정보 + 승인 대기 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
                            {/* 실시간 활동 */}
                            <div className="manager-card" style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                                    <Activity size={16} color="#3b82f6" />
                                    <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0, color: 'white' }}>실시간 활동</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {dashboardData.recentActivities.map((activity, idx) => (
                                        <div key={idx} style={{ 
                                            padding: '8px', 
                                            background: 'rgba(59, 130, 246, 0.1)', 
                                            borderLeft: '2px solid #3b82f6',
                                            borderRadius: '6px'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white' }}>
                                                {activity.user}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {activity.action}
                                            </div>
                                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                                {activity.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 현장 정보 */}
                            <div className="manager-card" style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                                    <Building2 size={16} color="#8b5cf6" />
                                    <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0, color: 'white' }}>현장 정보</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <InfoRowCompact label="발주처" value={dashboardData.project.client} />
                                    <InfoRowCompact label="시공사" value={dashboardData.project.constructor} />
                                    <InfoRowCompact label="현장 소장" value={dashboardData.project.manager} />
                                    <InfoRowCompact label="마지막 점검" value={dashboardData.safety.lastInspection} />
                                </div>
                            </div>

                            {/* 승인 대기 */}
                            <div className="manager-card" style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                                    <UserCheck size={16} color="#f59e0b" />
                                    <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0, color: 'white' }}>승인 대기</h2>
                                    <span style={{ 
                                        marginLeft: 'auto',
                                        padding: '2px 6px',
                                        background: '#f59e0b',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '0.65rem',
                                        fontWeight: '800'
                                    }}>
                                        {dashboardData.stats.pendingApproval}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {dashboardData.pendingApprovals.map((worker) => (
                                        <div key={worker.id} style={{ 
                                            padding: '8px',
                                            background: 'rgba(251, 191, 36, 0.1)',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                            borderRadius: '6px'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white' }}>
                                                {worker.name}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {worker.company} · {worker.role}
                                            </div>
                                            <button className="approve-button" style={{ 
                                                width: '100%', 
                                                padding: '4px',
                                                marginTop: '4px',
                                                fontSize: '0.7rem'
                                            }}>
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
    );
};

const StatCard = ({ icon, label, value, subValue, color }) => (
    <div className="manager-card" style={{ padding: '1rem', textAlign: 'center' }}>
        <div style={{ color, marginBottom: '0.3rem' }}>{icon}</div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>{label}</div>
        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'white', marginBottom: '0.2rem' }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>{subValue}</div>
    </div>
);

const InfoRowCompact = ({ label, value }) => (
    <div style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{value}</div>
    </div>
);

export default ManagerDashboard;
