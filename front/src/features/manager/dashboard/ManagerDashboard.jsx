
import React, { useState, useEffect } from 'react';
import { attendanceApi } from '@/api/attendanceApi';
import { projectApi } from '@/api/projectApi';
import { getManagerDashboard } from '@/api/authApi';
import { Users, AlertCircle, TrendingUp, CheckCircle2, Map as MapIcon, Info, LayoutDashboard } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({ present: 0, total: 24 });
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // 1. 관리자 정보 및 현장 ID 로드
                const dashRes = await getManagerDashboard();
                const siteId = dashRes?.project_info?.id;

                // 2. 출역 현황 로드
                const today = new Date().toISOString().split('T')[0];
                const attRes = await attendanceApi.getAttendance(siteId || 1, today);
                const attendanceList = attRes.data.data || [];
                setStats(prev => ({ ...prev, present: attendanceList.length }));

                // 3. 프로젝트 상세 정보 로드
                if (siteId) {
                  const projRes = await projectApi.getProject(siteId);
                  setProject(projRes.data.data);
                } else {
                  // 프로젝트가 없을 경우 첫 번째 프로젝트 로드 (데모)
                  const list = await projectApi.getProjects();
                  if (list.data.data?.length > 0) {
                    const detail = await projectApi.getProject(list.data.data[0].id);
                    setProject(detail.data.data);
                  }
                }
            } catch (e) {
                console.error('관리자 대시보드 데이터 로드 실패', e);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>데이터를 불러오는 중입니다...</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', color: '#1e293b' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LayoutDashboard size={32} color="#3b82f6" /> 현장 통합 관제 대시보드
                  </h1>
                  <p style={{ color: '#64748b' }}>오늘의 인력 투입 현황과 현장 구역별 안전 상태를 실시간 모니터링합니다.</p>
                </div>
                {project && (
                  <div style={{ padding: '0.75rem 1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', display: 'block' }}>관리 현장:</span>
                    <div style={{ fontSize: '1rem', fontWeight: '900', color: '#1e293b' }}>{project.name}</div>
                  </div>
                )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
                
                {/* Left: Map & Grid Control */}
                <section style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <MapIcon size={24} color="#6366f1" /> 실시간 현장 그리드 맵
                      </h2>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <span style={{ padding: '4px 10px', background: '#f0fdf4', color: '#16a34a', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>GPS 연동 중</span>
                         <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>디지털 트윈 온</span>
                      </div>
                    </div>
                    <div style={{ height: '480px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                      {project ? (
                        <CommonMap 
                          center={[project.lat, project.lng]}
                          zoom={17}
                          gridConfig={{
                            grid_rows: project.grid_rows,
                            grid_cols: project.grid_cols,
                            grid_spacing: project.grid_spacing
                          }}
                          markers={[{ lat: project.lat, lng: project.lng, title: '현장 사무소' }]}
                        />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8' }}>격자 정보를 불러올 수 없습니다.</div>
                      )}
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>단위 구역(Zones)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>{(project?.grid_cols || 0) * (project?.grid_rows || 0)} Tiles</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>그리드 간격</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>{project?.grid_spacing}m</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>현장 층수</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>지상 {project?.floors_above || 1}F / 지하 {project?.floors_below || 0}B</div>
                      </div>
                    </div>
                </section>

                {/* Right: Stats & Real-time Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Attendance Card */}
                  <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                          <Users size={24} color="#3b82f6" />
                          <span style={{ fontWeight: '800', color: '#475569', fontSize: '1.1rem' }}>실시간 출역 인원</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{stats.present}</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#94a3b8' }}>/ {stats.total} 명</span>
                      </div>
                      <div style={{ marginTop: '1.5rem', padding: '10px 14px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '700' }}>
                          <TrendingUp size={16} /> 어제 동시간 대비 14% 상승
                      </div>
                  </div>

                  {/* Safety Status Card */}
                  <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #fee2e2', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                          <AlertCircle size={24} color="#ef4444" />
                          <span style={{ fontWeight: '800', color: '#475569', fontSize: '1.1rem' }}>미조치 위험 구역</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#ef4444', lineHeight: 1 }}>0</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#94a3b8' }}>건</span>
                      </div>
                      <div style={{ marginTop: '1.5rem', padding: '10px 14px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '0.9rem', fontWeight: '700' }}>
                          <CheckCircle2 size={16} /> 전 구역 안전 수칙 준수 중
                      </div>
                  </div>

                  {/* System Tip */}
                  <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '1.5rem', borderRadius: '24px', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                      <Info size={18} color="#f59e0b" />
                      <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>현장 관리 팁</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                      실시간 맵의 각 격자를 클릭하면 해당 구역의 작업 할당 현황을 자세히 확인하고, 새로운 위험 요소를 마킹할 수 있습니다.
                    </p>
                  </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
