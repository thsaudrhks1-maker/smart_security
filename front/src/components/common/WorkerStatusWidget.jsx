import React, { useState, useEffect } from 'react';
import { attendanceApi } from '@/api/attendanceApi';
import { Clock, LogIn, LogOut, UserX, CheckCircle, XCircle, Calendar } from 'lucide-react';

/**
 * [MANAGER] 투입 인원 출퇴근 및 안전점검 현황 위젯
 */
const WorkerStatusWidget = ({ projectId }) => {
    const [workers, setWorkers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkerStatus();
    }, [projectId, selectedDate]);

    const loadWorkerStatus = async () => {
        if (!projectId) return;
        
        try {
            setLoading(true);
            const res = await attendanceApi.getProjectStatus(projectId, selectedDate);
            if (res?.data?.success) {
                setWorkers(res.data.data || []);
            }
        } catch (e) {
            console.error('투입 인원 현황 조회 실패:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section style={{ 
                background: 'white', 
                padding: '1rem', 
                borderRadius: '16px', 
                border: '1px solid #e2e8f0',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>로딩 중...</div>
            </section>
        );
    }

    return (
        <section style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0
        }}>
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#6366f1" /> 투입 인원 현황
                </h3>
                <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ 
                        border: '1px solid #e2e8f0', 
                        background: '#f8fafc', 
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '0.75rem', 
                        color: '#64748b', 
                        cursor: 'pointer',
                        outline: 'none',
                        fontWeight: '700'
                    }}
                />
            </div>

            {/* 요약 통계 */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px', 
                marginBottom: '1rem',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '12px'
            }}>
                <StatBox label="총인원" value={workers.length} color="#6366f1" />
                <StatBox label="출근" value={workers.filter(w => w.check_in_time).length} color="#10b981" />
                <StatBox label="퇴근" value={workers.filter(w => w.check_out_time).length} color="#ef4444" />
                <StatBox label="점검완료" value={workers.filter(w => w.safety_checked).length} color="#f59e0b" />
            </div>

            {/* 작업자 목록 */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {workers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        투입 인원이 없습니다.
                    </div>
                ) : workers.map(worker => {
                    const hasCheckIn = !!worker.check_in_time;
                    const hasCheckOut = !!worker.check_out_time;
                    const hasSafetyCheck = worker.safety_checked;
                    
                    return (
                        <div key={worker.user_id} style={{ 
                            padding: '10px', 
                            background: hasCheckIn ? '#ecfdf5' : '#f8fafc', 
                            borderRadius: '10px', 
                            border: `1.5px solid ${hasCheckIn ? '#d1fae5' : '#f1f5f9'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            {/* 이름 및 소속 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b' }}>
                                        {worker.full_name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                        {worker.company_name || '소속 없음'}
                                    </div>
                                </div>
                            </div>

                            {/* 출퇴근 및 안전점검 상태 */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {/* 출근 */}
                                {hasCheckIn ? (
                                    <StatusBadge 
                                        icon={<LogIn size={12} />} 
                                        label={`출근 ${new Date(worker.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
                                        color="#10b981"
                                        bg="#ecfdf5"
                                    />
                                ) : (
                                    <StatusBadge 
                                        icon={<UserX size={12} />} 
                                        label="미출근"
                                        color="#94a3b8"
                                        bg="#f8fafc"
                                    />
                                )}

                                {/* 퇴근 */}
                                {hasCheckOut && (
                                    <StatusBadge 
                                        icon={<LogOut size={12} />} 
                                        label={`퇴근 ${new Date(worker.check_out_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
                                        color="#ef4444"
                                        bg="#fef2f2"
                                    />
                                )}

                                {/* 안전점검 */}
                                {hasSafetyCheck ? (
                                    <StatusBadge 
                                        icon={<CheckCircle size={12} />} 
                                        label="점검완료"
                                        color="#f59e0b"
                                        bg="#fffbeb"
                                    />
                                ) : hasCheckIn && (
                                    <StatusBadge 
                                        icon={<XCircle size={12} />} 
                                        label="점검미완"
                                        color="#dc2626"
                                        bg="#fee2e2"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const StatBox = ({ label, value, color }) => (
    <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '900', color }}>{value}</div>
    </div>
);

const StatusBadge = ({ icon, label, color, bg }) => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        padding: '4px 8px', 
        background: bg,
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: '800',
        color
    }}>
        {icon}
        <span>{label}</span>
    </div>
);

export default WorkerStatusWidget;
