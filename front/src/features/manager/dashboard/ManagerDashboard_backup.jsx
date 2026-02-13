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
 * [MANAGER] 현장 관리자 프리미엄 대시보드
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
            pendingApproval: 8
        },
        safety: {
            todayIncidents: 0,
            weekIncidents: 2,
            monthIncidents: 7,
            riskScore: 23,
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
            { time: "09:47", user: "김작업", action: "1F-C3 작업 시작", type: "work" },
            { time: "09:30", user: "최관리", action: "장비 점검 완료", type: "equipment" }
        ],
        dangerZones: [
            { id: 1, level: "1F", zone: "C1", type: "추락위험", workers: 5, status: "high" },
            { id: 2, level: "1F", zone: "C3", type: "중장비", workers: 3, status: "medium" },
            { id: 3, level: "2F", zone: "A5", type: "낙하물", workers: 2, status: "high" }
        ],
        pendingApprovals: [
            { id: 1, name: "홍길동", company: "대진건설", role: "철근공", requestDate: "오늘" },
            { id: 2, name: "김철수", company: "세종건설", role: "비계공", requestDate: "오늘" },
            { id: 3, name: "이영희", company: "대진건설", role: "용접공", requestDate: "어제" }
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
        <div className="manager-dashboard-container">
            <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
                {/* 헤더 */}
                <div className="manager-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, color: 'white' }}>
                            현장 관리 대시보드
                        </h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                            {dashboardData.project.name} · {dashboardData.project.manager} 소장
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>공사 진행률</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#22c55e' }}>
                                {dashboardData.project.progress}%
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>남은 기간</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3b82f6' }}>
                                {dashboardData.project.daysLeft}일
                            </div>
                        </div>
                    </div>
                </div>

                {/* 현장 지도 + 우측 정보 */}
                <div style={{ display: 'grid', gridTemplateColumns: '550px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* 좌측: 정사각형 지도 */}
                    <div className="manager-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapIcon size={20} color="#3b82f6" />
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, color: 'white' }}>실시간 현장 지도</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['B1', '1F', '2F'].map(level => (
                                    <button
                                        key={level}
                                        className={`level-button ${currentLevel === level ? 'active' : ''}`}
                                        onClick={() => setCurrentLevel(level)}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="map-container-premium" style={{ height: '500px' }}>
                            <CommonMap 
                                zones={dashboardData.zones.filter(z => z.level === currentLevel)}
                                currentLevel={currentLevel}
                                onZoneClick={(zone) => console.log('Zone clicked:', zone)}
                            />
                        </div>
                    </div>

                    {/* 우측: 통계 + 정보 + 승인 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* 통계 카드 2x2 그리드 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <StatCard 
                                icon={<Users size={20} />}
                                label="총 인원"
                                value={dashboardData.stats.totalWorkers}
                                subValue={`출근 ${dashboardData.stats.presentToday}`}
                                color="#3b82f6"
                            />
                            <StatCard 
                                icon={<ShieldCheck size={20} />}
                                label="안전 점수"
                                value={dashboardData.safety.riskScore}
                                subValue="우수"
                                color="#22c55e"
                            />
                            <StatCard 
                                icon={<ClipboardList size={20} />}
                                label="작업 진행"
                                value={`${dashboardData.work.tasksCompleted}/${dashboardData.work.tasksTotal}`}
                                subValue={`${dashboardData.work.completionRate}% 완료`}
                                color="#8b5cf6"
                            />
                            <StatCard 
                                icon={<Activity size={20} />}
                                label="장비 가동"
                                value={`${dashboardData.equipment.active}/${dashboardData.equipment.total}`}
                                subValue="정상 운영"
                                color="#f59e0b"
                            />
                        </div>

                        {/* 현장 상세 정보 */}
                        <div className="manager-card" style={{ padding: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                <Building2 size={18} color="#8b5cf6" />
                                <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0, color: 'white' }}>현장 상세 정보</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <InfoRow label="발주처" value={dashboardData.project.client} />
                                <InfoRow label="시공사" value={dashboardData.project.constructor} />
                                <InfoRow label="현장 소장" value={dashboardData.project.manager} />
                                <InfoRow label="마지막 점검" value={dashboardData.safety.lastInspection} />
                            </div>
                        </div>

                        {/* 승인 대기 */}
                        <div className="manager-card" style={{ padding: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                <UserCheck size={18} color="#f59e0b" />
                                <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0, color: 'white' }}>승인 대기</h2>
                                <span style={{ 
                                    marginLeft: 'auto',
                                    padding: '3px 8px',
                                    background: '#f59e0b',
                                    color: 'white',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    fontWeight: '800'
                                }}>
                                    {dashboardData.stats.pendingApproval}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {dashboardData.pendingApprovals.map((worker) => (
                                    <div key={worker.id} className="pending-worker-card" style={{ padding: '10px' }}>
                                        <div style={{ marginBottom: '6px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>
                                                {worker.name}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {worker.company} · {worker.role}
                                            </div>
                                        </div>
                                        <button className="approve-button" style={{ width: '100%', padding: '6px' }}>
                                            승인하기
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 위험 구역 현황 + 날씨 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="manager-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <AlertTriangle size={20} color="#ef4444" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, color: 'white' }}>위험 구역 현황</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {dashboardData.dangerZones.map((zone) => (
                                <div key={zone.id} style={{ 
                                    padding: '12px', 
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
                                        {zone.level} - {zone.zone}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                                        {zone.type} · {zone.workers}명 작업 중
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="manager-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Zap size={20} color="#22c55e" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, color: 'white' }}>현장 날씨</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>온도</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{dashboardData.weather.temp}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>날씨</div>
                                <div style={{ fontSize: '1.5rem' }}>☀️</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>습도</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>{dashboardData.weather.humidity}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>풍속</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>{dashboardData.weather.wind}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 그리드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 380px', gap: '1.5rem' }}>
                    {/* 좌측 상단: 실시간 활동 */}
                    <div className="manager-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Activity size={20} color="#3b82f6" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, color: 'white' }}>실시간 활동</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {dashboardData.recentActivities.map((activity, idx) => (
                                <div key={idx} style={{ 
                                    padding: '12px', 
                                    background: 'rgba(59, 130, 246, 0.1)', 
                                    borderLeft: '3px solid #3b82f6',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>
                                            {activity.user}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                                            {activity.action}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                        {activity.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 중앙 상단: 위험 구역 */}
                    <div className="manager-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <AlertTriangle size={20} color="#ef4444" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, color: 'white' }}>위험 구역 모니터링</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {dashboardData.dangerZones.map((zone) => (
                                <div key={zone.id} className="danger-zone-card" style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'white' }}>
                                            {zone.level} - {zone.zone}
                                        </span>
                                        <span style={{ 
                                            padding: '2px 10px', 
                                            background: zone.status === 'high' ? '#ef4444' : '#f59e0b',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '800'
                                        }}>
                                            {zone.type}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                                        작업 인원: {zone.workers}명
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, subValue, color }) => (
    <div className="manager-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ color, marginBottom: '0.5rem' }}>{icon}</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>{label}</div>
        <div className="stat-number" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{subValue}</div>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>{value}</div>
    </div>
);

export default ManagerDashboard;
