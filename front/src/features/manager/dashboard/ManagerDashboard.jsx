import React, { useEffect, useState } from 'react';
import { getManagerDashboard } from '../../../api/managerApi';
import { useAuth } from '../../../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Award, 
  Users, 
  CheckCircle,
  Megaphone,
  QrCode
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getManagerDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch manager dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 더미 공지 (추후 API 연동 권장)
  const notices = [
    { id: 3, title: '전체 공지사항입니다.', target: '전체', date: '2025-02-16' },
    { id: 2, title: '시스템 점검 안내', target: '현장별', date: '2025-02-15' },
    { id: 1, title: '안전 공지사항입니다.', target: '현장별', date: '2025-02-06' },
  ];

  // 데이터가 없을 경우를 대비한 기본값
  const defaultStats = { total_workers: 0, today_attendance: 0, safety_accident_free_days: 0 };
  const project_info = dashboardData?.project_info || { name: '배정된 프로젝트 없음', location: '-', period: '-' };
  const stats = dashboardData?.stats || defaultStats;
  const manager_role = dashboardData?.manager_info?.role || '관리자';

  // 날짜 계산 (남은 기간)
  let daysLeft = 0;
  let endYear = new Date().getFullYear();
  let endMonth = new Date().getMonth() + 1;

  if (project_info.period && project_info.period.includes('~')) {
    const endDate = new Date(project_info.period.split('~')[1].trim());
    const today = new Date();
    if (!isNaN(endDate)) {
        daysLeft = endDate > today ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : 0;
        endYear = endDate.getFullYear();
        endMonth = endDate.getMonth() + 1;
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* 헤더 */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: '#e2e8f0', padding: '8px', borderRadius: '50%' }}>
          <Building2 size={24} color="#64748b" />
        </div>
        <div>
           <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Dashboard</h1>
           <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
             안녕하세요, <span style={{ fontWeight: '700', color: '#334155' }}>{user?.full_name}</span> {manager_role}님. 오늘도 안전한 현장 되세요.
           </div>
        </div>
      </div>

      {/* 상단 3단 위젯 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* 1. 현장 현황 */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#3b82f6" /> 현장 현황
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InfoRow label="현장명" value={project_info.name} />
            <InfoRow label="현장위치" value={project_info.location || '-'} color="#dc2626" />
            <InfoRow label="공사기간" value={project_info.period} color="#16a34a" />
            <InfoRow label="무사고일수" value={`무사고 ${stats.safety_accident_free_days || 10}일 / 목표 365일`} color="#16a34a" highlight />
          </div>
        </div>

        {/* 2. QR 코드 */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ width: '100%', fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="#334155" /> 출근 관리 QR
          </h3>
          <div style={{ border: '8px solid #1e293b', borderRadius: '12px', overflow: 'hidden', padding: '10px', background: 'white' }}>
            <QrCode size={150} color="#000" />
          </div>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}>
            [QR코드 인쇄하기]
          </button>
        </div>

        {/* 3. 운영 현황 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 근로자/출역 수 */}
          <div style={{ flex: 1, background: '#4ade80', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(74, 222, 128, 0.4)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>운영현황</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
              <div style={{ flex:1, borderRight: '1px solid rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.total_workers}명</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>등록 근로자</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.today_attendance}명</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>금일 출역</div>
              </div>
            </div>
          </div>
          
          {/* 남은 기간 */}
          <div style={{ flex: 1, background: '#22c55e', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.4)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{endYear}년 {endMonth}월 까지</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>({daysLeft} 일 남음)</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>서비스 이용기간</div>
            </div>
            <Megaphone size={100} color="white" style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2 }} />
          </div>
        </div>
      </div>

      {/* 하단 시스템 공지 */}
      <div style={{ background: 'white', padding: '0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', background: '#ecfccb', borderBottom: '1px solid #d9f99d' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#3f6212', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={20} /> 시스템 공지
          </h3>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem', textAlign: 'center', width: '60px' }}>No</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>제목</th>
              <th style={{ padding: '1rem', textAlign: 'center', width: '120px' }}>공지대상</th>
              <th style={{ padding: '1rem', textAlign: 'center', width: '150px' }}>등록일</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <tr key={notice.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>{notice.id}</td>
                <td style={{ padding: '1rem', color: '#3b82f6', fontWeight: '500', cursor: 'pointer' }}>{notice.title}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>{notice.target}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>{notice.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

// 헬퍼 컴포넌트
const InfoRow = ({ label, value, color, highlight }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <span style={{ width: '80px', color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>{label}</span>
    <span style={{ 
      flex: 1, 
      background: highlight ? '#dcfce7' : '#f1f5f9', 
      padding: '8px 12px', 
      borderRadius: '6px', 
      color: color || '#1e293b', 
      fontWeight: '600',
      fontSize: '0.95rem',
      border: highlight ? '1px solid #86efac' : '1px solid #e2e8f0'
    }}>
      {value}
    </span>
  </div>
);

export default ManagerDashboard;
