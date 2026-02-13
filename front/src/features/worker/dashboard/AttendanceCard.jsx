import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { checkIn, getMyAttendance } from '@/api/attendanceApi';
import { Clock, MapPin, CheckCircle2, LogIn, CheckCircle } from 'lucide-react';

/**
 * [WORKER] 출석(출근) 카드 컴포넌트 - 프리미엄 버전
 */
const AttendanceCard = ({ projectInfo, onCheckInSuccess }) => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id || user?.user_id;
    if (userId) loadStatus(userId);
  }, [user]);

  const loadStatus = async (userId) => {
    try {
      const res = await getMyAttendance(userId);
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
      const userId = user?.id || user?.user_id;
      const res = await checkIn({
        project_id: projectInfo.project_id,
        user_id: userId,
        check_in_method: 'APP'
      });
      
      if (res.data?.success) {
        alert('출근 처리되었습니다. 오늘도 안전작업 하세요!');
        loadStatus(userId);
        if (onCheckInSuccess) onCheckInSuccess(); // [추가] 부모 갱신
      }
    } catch (error) {
      console.error(error);
      alert('출근 처리에 실패했습니다.');
    }
  };

  if (loading) return null;

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      backdropFilter: 'blur(20px)', 
      padding: '1.5rem', 
      borderRadius: '28px', 
      border: '1px solid rgba(255,255,255,0.1)', 
      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 장식 */}
      <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '6px', borderRadius: '10px' }}>
            <Clock size={20} color="#3b82f6" />
          </div>
          출역 관리 센터
        </h3>
        {attendance && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.75rem', fontWeight: '900', color: '#10b981', 
            background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '30px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <CheckCircle size={14} /> 정시 출근
          </div>
        )}
      </div>

      {attendance ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '20px', padding: '1.25rem', 
            background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', 
            border: '1px solid rgba(255,255,255,0.05)' 
          }}>
            <div style={{ 
              width: '60px', height: '60px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle2 size={32} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>금일 출근 시각</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#fff', letterSpacing: '-0.02em' }}>
                {new Date(attendance.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700' }}>
             <MapPin size={16} color="#3b82f6" /> 
             <span style={{ color: '#e2e8f0' }}>{projectInfo?.project_name || '대한건설 세종대로 현장'}</span> 에서 근무 중
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.6', fontWeight: '700' }}>
            현장에 도착하셨나요? <br/>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>오늘의 안전 작업을 위해 출근 체크를 진행해 주세요.</span>
          </p>
          <button
            onClick={handleCheckIn}
            className="check-in-button"
            style={{ 
              width: '100%', padding: '1.1rem', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
              color: 'white', border: 'none', borderRadius: '20px', 
              fontWeight: '900', fontSize: '1.1rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <LogIn size={22} /> 지금 출근하기
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .check-in-button:active { transform: scale(0.97); filter: brightness(0.9); }
      `}} />
    </div>
  );
};

export default AttendanceCard;
