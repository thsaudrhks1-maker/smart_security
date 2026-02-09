import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { attendanceApi } from '@/api/attendanceApi';
import { 
  Building2, Users, Calendar, ShieldCheck, 
  QrCode, ClipboardList, Info, Bell, Map as MapIcon,
  TrendingUp, CheckCircle2, UserCheck, Clock, LogIn, LogOut, UserX, ChevronDown, ChevronUp
} from 'lucide-react';
import WorkerStatusWidget from './WorkerStatusWidget';

/**
 * [MANAGER] 현장 관리자 통합 대시보드 (최적화 레이아웃)
 */
const ManagerDashboard = () => {
    const { user } = useAuth();
    const [projectDetail, setProjectDetail] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPartner, setExpandedPartner] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            let siteId = user?.project_id;

            if (!siteId) {
                const listRes = await projectApi.getProjects().catch(() => ({ data: { data: [] } }));
                const list = listRes?.data?.data || [];
                siteId = list.length > 0 ? list[0].id : 1;
            } else {
                siteId = Number(siteId);
            }

            const [detailRes, attRes] = await Promise.all([
                projectApi.getProjectDetail(siteId).catch(() => ({ data: { data: null } })),
                attendanceApi.getAttendance(siteId, today).catch(() => ({ data: { data: [] } }))
            ]);

            if (detailRes?.data?.data) setProjectDetail(detailRes.data.data);
            setAttendance(attRes?.data?.data || []);
        } catch (e) {
            console.error('대시보드 데이터 로드 중 오류:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        if (!confirm('이 작업자를 승인하시겠습니까?')) return;
        try {
            const siteId = user?.project_id || projectDetail?.project?.id || 1;
            await projectApi.approveWorker(siteId, userId);
            alert('승인되었습니다.');
            loadDashboardData();
        } catch (e) {
            alert('승인 처리 중 오류가 발생했습니다.');
        }
    };

    if (loading) return (
        <div style={{ padding: '5rem', textAlign: 'center', color: '#3b82f6', background: 'white', height: '100vh' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ fontWeight: '800' }}>현장 데이터를 분석 중입니다...</div>
        </div>
    );

    const project = projectDetail?.project;
    const approvedWorkers = projectDetail?.approved_workers || [];
    const pendingWorkers = projectDetail?.pending_workers || [];
    const workTasks = projectDetail?.work_tasks || [];
    const dangerZones = projectDetail?.danger_zones || [];
    
    const attendanceMap = {};
    attendance.forEach(a => {
        attendanceMap[a.user_id] = a.status;
    });

    const inCount = Object.values(attendanceMap).filter(s => s === 'IN').length;
    const outCount = Object.values(attendanceMap).filter(s => s === 'OUT').length;

    return (
        <div style={{ 
            padding: '1.5rem', 
            height: 'calc(100vh - 64px)', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            color: '#1e293b',
            background: '#f8fafc'
        }}>
            {/* Header - 컴팩트 */}
            <header style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color="#3b82f6" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>Dashboard</h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
                    {user?.full_name || '관리자'} {user?.role === 'manager' ? '소장' : '님'}
                  </p>
                </div>
            </header>

            {/* Main Content - 2단 레이아웃 */}
            <div style={{ 
                flex: 1, 
                display: 'grid', 
                gridTemplateColumns: '1fr 420px', 
                gap: '1rem',
                minHeight: 0
            }}>
                {/* 좌측: 현장 정보 + 협력업체 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                    {/* 현장 정보 (크게) */}
                    <section style={{ background: 'white', padding: '1.8rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem', color: '#3b82f6' }}>
                            <Building2 size={22} />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>현장 현황</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <InfoRow label="현장명" value={project?.name || '-'} />
                            <InfoRow label="발주처" value={projectDetail?.client?.name || '-'} />
                            <InfoRow label="시공사" value={projectDetail?.constructor?.name || '-'} />
                            <InfoRow label="소장" value={projectDetail?.manager?.full_name || '-'} />
                            <InfoRow label="안전관리자" value={projectDetail?.safety_manager?.full_name || '-'} />
                            <InfoRow label="공사기간" value={`${project?.start_date || '-'} ~ ${project?.end_date || '-'}`} />
                        </div>
                        {/* 출역 통계 */}
                        <div style={{ marginTop: '1.2rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', padding: '1.2rem', borderRadius: '14px', color: 'white' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '700' }}>승인인원</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '4px' }}>{approvedWorkers.length}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', borderRight: '1px solid rgba(255,255,255,0.3)' }}>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '700' }}>출근</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '4px' }}>{inCount}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '700' }}>퇴근</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', marginTop: '4px' }}>{outCount}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 협력업체 & 승인 관리 (세로 배치) */}
                    <section style={{ 
                        background: 'white', 
                        padding: '1rem', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem', color: '#10b981' }}>
                            <Users size={16} />
                            <h2 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>협력업체 & 승인 관리</h2>
                        </div>
                        <div style={{ 
                            flex: 1,
                            overflowY: 'auto', 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            {projectDetail?.partners?.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>협력업체 없음</div>
                            ) : projectDetail?.partners?.map(partner => {
                                const partnerApproved = approvedWorkers.filter(w => w.company_id === partner.id);
                                const partnerPending = pendingWorkers.filter(w => w.company_id === partner.id);
                                const totalWorkers = partnerApproved.length + partnerPending.length;
                                const isExpanded = expandedPartner === partner.id;
                                
                                return (
                                    <div key={partner.id} style={{ 
                                        border: '1.5px solid #e2e8f0', 
                                        borderRadius: '12px', 
                                        overflow: 'hidden',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div 
                                            onClick={() => partnerPending.length > 0 && setExpandedPartner(isExpanded ? null : partner.id)}
                                            style={{ 
                                                padding: '12px', 
                                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                                                cursor: partnerPending.length > 0 ? 'pointer' : 'default',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '900', fontSize: '0.9rem', color: '#0f172a' }}>{partner.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>{partner.trade_type}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ textAlign: 'center', padding: '6px 10px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#065f46', fontWeight: '700' }}>총인원</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#10b981' }}>{totalWorkers}</div>
                                                </div>
                                                {partnerPending.length > 0 && (
                                                    <>
                                                        <div style={{ textAlign: 'center', padding: '6px 10px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                                                            <div style={{ fontSize: '0.65rem', color: '#92400e', fontWeight: '700' }}>대기</div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#f59e0b' }}>{partnerPending.length}</div>
                                                        </div>
                                                        <div>{isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {partnerPending.length > 0 && isExpanded && (
                                            <div style={{ 
                                                padding: '10px', 
                                                background: '#fffbeb', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: '6px'
                                            }}>
                                                {partnerPending.map(w => (
                                                    <div key={w.id} style={{ 
                                                        padding: '10px', 
                                                        background: 'white', 
                                                        borderRadius: '8px', 
                                                        border: '1px solid #fef3c7',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b' }}>
                                                                {w.full_name}
                                                                {w.job_title && (
                                                                    <span style={{ 
                                                                        marginLeft: '8px',
                                                                        padding: '2px 8px',
                                                                        background: '#dbeafe',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: '800',
                                                                        color: '#1e40af'
                                                                    }}>
                                                                        {w.job_title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleApprove(w.id);
                                                            }}
                                                            style={{ 
                                                                padding: '6px 12px', 
                                                                background: '#f59e0b', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                borderRadius: '6px', 
                                                                fontSize: '0.7rem', 
                                                                fontWeight: '800', 
                                                                cursor: 'pointer',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            승인
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 오늘의 작업 계획 */}
                    <section style={{ 
                        background: 'white', 
                        padding: '1rem', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem', color: '#8b5cf6' }}>
                            <ClipboardList size={16} />
                            <h2 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>오늘의 작업 계획</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {workTasks.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', fontSize: '0.8rem' }}>작업 계획 없음</div>
                            ) : workTasks.map(task => (
                                <div key={task.id} style={{ 
                                    padding: '10px', 
                                    background: '#faf5ff', 
                                    border: '1px solid #e9d5ff', 
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: '800', marginBottom: '3px' }}>
                                            {task.level} - {task.zone_name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                                            {task.work_type || '기타 작업'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                            {task.description}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '6px 10px', 
                                        background: task.calculated_risk_score >= 60 ? '#fee2e2' : '#dbeafe', 
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: task.calculated_risk_score >= 60 ? '#991b1b' : '#1e40af'
                                    }}>
                                        위험도 {task.calculated_risk_score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 위험 구역 */}
                    <section style={{ 
                        background: 'white', 
                        padding: '1rem', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem', color: '#ef4444' }}>
                            <Bell size={16} />
                            <h2 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>위험 구역</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {dangerZones.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', fontSize: '0.8rem' }}>위험 구역 없음</div>
                            ) : dangerZones.map(zone => (
                                <div key={zone.id} style={{ 
                                    padding: '10px', 
                                    background: '#fef2f2', 
                                    border: '1.5px solid #fca5a5', 
                                    borderRadius: '10px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '800' }}>
                                            {zone.level} - {zone.zone_name}
                                        </div>
                                        <div style={{ 
                                            padding: '4px 8px', 
                                            background: '#dc2626', 
                                            color: 'white', 
                                            borderRadius: '6px',
                                            fontSize: '0.65rem',
                                            fontWeight: '800'
                                        }}>
                                            {zone.risk_type}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {zone.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* 우측: 투입 인원 현황 (출퇴근 + 안전점검) */}
                <WorkerStatusWidget projectId={user?.project_id || projectDetail?.project?.id || 1} />
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ width: '90px', fontWeight: '800', color: '#64748b', fontSize: '0.75rem' }}>{label}</div>
        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
);

export default ManagerDashboard;
