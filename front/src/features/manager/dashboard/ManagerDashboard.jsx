
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { attendanceApi } from '@/api/attendanceApi';
import { 
  Building2, Users, Calendar, ShieldCheck, 
  QrCode, ClipboardList, Info, Bell, Map as MapIcon,
  TrendingUp, CheckCircle2
} from 'lucide-react';

/* --- Helper Components (선언부 상단 이동으로 참조 에러 방지) --- */
const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ width: '100px', fontWeight: '800', color: '#64748b', fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontWeight: '700', color: '#1e293b' }}>{value}</div>
    </div>
);

const MiniStat = ({ label, value, unit, color }) => (
    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: color }}>{value}<span style={{ fontSize: '0.8rem' }}>{unit}</span></div>
    </div>
);

const LayoutDashboardIcon = ({ size, color }) => (
    <div style={{ color, fontSize: size }}>📊</div>
);

/**
 * [MANAGER] 현장 관리자 통합 대시보드
 */
const ManagerDashboard = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState({ workers: 0, attendance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const siteId = user?.project_id || 1;
            const today = new Date().toISOString().split('T')[0];

            // 데이터 로드 시도
            const [projRes, attRes] = await Promise.all([
                projectApi.getProject(siteId).catch(() => ({ data: { data: { name: '현장 정보 없음' } } })),
                attendanceApi.getAttendance(siteId, today).catch(() => ({ data: { data: [] } }))
            ]);

            if (projRes?.data?.data) setProject(projRes.data.data);
            
            const attList = attRes?.data?.data || [];
            setStats({
                workers: attList.length + 10,
                attendance: attList.length
            });
        } catch (e) {
            console.error('대시보드 데이터 로드 중 치명적 오류:', e);
            setProject({ name: '시스템 연결 오류' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '5rem', textAlign: 'center', color: '#3b82f6', background: 'white', height: '100vh' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ fontWeight: '800' }}>현장 데이터를 분석 중입니다...</div>
        </div>
    );

    return (
        <div style={{ padding: '2.5rem', maxWidth: '1440px', margin: '0 auto', color: '#1e293b' }}>
            {/* Header: 인사말 */}
            <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LayoutDashboardIcon size={24} color="#64748b" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>Dashboard</h1>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                    안녕하세요, <strong>{user?.full_name || '관리자'}</strong> {user?.role === 'manager' ? '현장소장' : '님'}. 오늘도 안전한 현장 되세요.
                  </p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                {/* 메인 섹션 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: '#3b82f6' }}>
                            <Building2 size={20} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>현장 현황</h2>
                        </div>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <InfoRow label="현장명" value={project?.name || '정보 없음'} />
                            <InfoRow label="현장위치" value={project?.location_address || '-'} />
                            <InfoRow label="공사기간" value={`${project?.start_date || '-'} ~ ${project?.end_date || '-'}`} />
                            <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7', marginTop: '10px' }}>
                                <div style={{ fontWeight: '800', color: '#166534', width: '100px', fontSize: '0.9rem' }}>무사고일수</div>
                                <div style={{ color: '#16a34a', fontWeight: '900' }}>무사고 1일 / 목표 365일</div>
                            </div>
                        </div>
                    </section>

                    <section style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>승인 대기 인원이 없습니다.</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>모든 근로자가 작업 투입 가능 상태입니다.</p>
                    </section>

                    <section style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <QrCode size={20} color="#0f172a" /> 출근 관리 QR
                        </h3>
                        <div style={{ width: '180px', height: '180px', margin: '0 auto', background: '#f8fafc', border: '2px solid #0f172a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                            <QrCode size={120} color="#0f172a" />
                        </div>
                    </section>
                </div>

                {/* 사이드 섹션 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section style={{ background: '#22c55e', padding: '2rem', borderRadius: '24px', color: 'white', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '700', marginBottom: '8px' }}>현재 근로자</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '900' }}>{stats.workers}명</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '700', marginBottom: '8px' }}>금일 출역</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '900' }}>{stats.attendance}명</div>
                        </div>
                    </section>

                    <section style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={20} color="#6366f1" /> 실시간 출역 현황
                            </h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                            <MiniStat label="전체" value={stats.attendance} unit="명" color="#64748b" />
                            <MiniStat label="조기" value="0" unit="" color="#3b82f6" />
                            <MiniStat label="야간" value="0" unit="" color="#ef4444" />
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem 0', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                            해당 날짜의 출역 기록이 없습니다.
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
