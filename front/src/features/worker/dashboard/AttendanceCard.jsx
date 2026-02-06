import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { checkIn, getMyAttendance } from '@/api/attendanceApi';
import { Clock, MapPin, CheckCircle2, LogIn } from 'lucide-react';

/**
 * [WORKER] 출석(출근) 카드 컴포넌트
 */
const AttendanceCard = ({ projectInfo }) => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadStatus();
  }, [user]);

  const loadStatus = async () => {
    try {
      const res = await getMyAttendance(user.id);
      if (res.data?.success && res.data?.data) {
        setAttendance(res.data.data);
      }
    } catch (error) {
      console.error("출근 정보 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!confirm('현재 시각으로 출근 처리하시겠습니까?')) return;
    try {
      if (!projectInfo || !projectInfo.project_id) {
        alert('배정된 프로젝트 정보가 없습니다.\n관리자에게 프로젝트 배정을 요청하세요.');
        return;
      }
      const res = await checkIn({
        project_id: projectInfo.project_id,
        user_id: user.id,
        check_in_method: 'APP'
      });
      
      if (res.data?.success) {
        alert('출근 처리되었습니다. 오늘도 안전작업 하세요!');
        loadStatus();
      }



    } catch (error) {
      console.error(error);
      alert('출근 처리에 실패했습니다.');
    }
  };

  if (loading) return null;

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#3b82f6" /> 출역 관리
        </h3>
        {attendance && (
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '20px' }}>
            출근 완료
          </span>
        )}
      </div>

      {attendance ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '2.5rem' }}>✅</div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>출근 시간</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>
                {new Date(attendance.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
             <MapPin size={14} /> {projectInfo?.project_name || '현장'} 에서 출역 중
          </div>
        </div>
      ) : (
        <div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            오늘 현장에 도착하셨나요?<br/>버튼을 눌러 <strong>출근 체크</strong>를 해주세요.
          </p>
          <button
            onClick={handleCheckIn}
            style={{ 
              width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', 
              border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <LogIn size={20} /> 출근하기
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
