import React, { useEffect, useState } from 'react';
import { getManagerDashboard } from '../../../api/managerApi';
import AttendanceListWidget from '../components/AttendanceListWidget';
import { ClipboardCheck, Building2 } from 'lucide-react';

/**
 * 중간관리자 - 출역 관리 전용 페이지.
 * 배정된 프로젝트 기준으로 출역 현황 위젯을 전체 화면으로 표시.
 */
const ManagerAttendance = () => {
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getManagerDashboard();
        const info = data?.project_info;
        if (info?.id) {
          setProjectId(info.id);
          setProjectName(info.name || '현장');
        } else {
          setProjectId(null);
        }
      } catch (err) {
        console.error('출역 관리 로드 실패:', err);
        setProjectId(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        로딩 중...
      </div>
    );
  }

  if (!projectId) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <ClipboardCheck size={28} color="#64748b" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>출역 관리</h1>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          <Building2 size={48} style={{ marginBottom: '1rem', opacity: 0.6 }} />
          <p style={{ margin: 0, fontSize: '1rem' }}>배정된 프로젝트가 없습니다.</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>관리자에게 현장 배정을 요청하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <ClipboardCheck size={28} color="#6366f1" />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>출역 관리</h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '4px 0 0' }}>{projectName}</p>
        </div>
      </div>
      <AttendanceListWidget projectId={projectId} />
    </div>
  );
};

export default ManagerAttendance;
