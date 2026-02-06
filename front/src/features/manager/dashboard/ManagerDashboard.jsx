
import React, { useState, useEffect } from 'react';
import { attendanceApi } from '@/api/attendanceApi';
import { Users, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({ present: 5, total: 12 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await attendanceApi.getAttendance(1, new Date().toISOString().split('T')[0]);
                // res.data.data가 배열인지 확인 후 길이 측정
                const attendanceList = res.data.data || [];
                setStats({ present: attendanceList.length, total: 12 });
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>👷 현장 오퍼레이션 대시보드</h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>오늘의 현장 투입 인원 및 안전 조치 현황을 실시간으로 확인합니다.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Attendance Card */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px' }}>
                            <Users size={24} color="#3b82f6" />
                        </div>
                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>오늘의 출역 인원</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{stats.present}</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>/ {stats.total} 명</span>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.9rem', fontWeight: '600' }}>
                        <TrendingUp size={16} /> 어제보다 2명 증가
                    </div>
                </div>

                {/* Danger Zone Card */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #fee2e2', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '10px', background: '#fef2f2', borderRadius: '12px' }}>
                            <AlertCircle size={24} color="#ef4444" />
                        </div>
                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>미조치 위험 구역</span>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ef4444', lineHeight: 1 }}>0 <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>건</span></div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontSize: '0.9rem', fontWeight: '600' }}>
                        <CheckCircle2 size={16} color="#16a34a" /> 모든 구역 조치 완료
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
