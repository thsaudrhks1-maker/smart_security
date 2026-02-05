import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Smartphone } from 'lucide-react';
import { getMyTodayAttendance, checkIn, checkOut } from '@/api/attendanceApi';

const AttendanceCard = ({ projectInfo, onStatusChange }) => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  // 시간 포맷팅 헬퍼 (HH:mm)
  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // 오늘의 출근 정보 조회
  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await getMyTodayAttendance();
      setAttendance(data);
      if (onStatusChange) onStatusChange(data);
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
        // 프로젝트 ID가 없을 경우 예외 처리 (알림 메시지 구체화)
        alert('배정된 프로젝트 정보가 없습니다.\n관리자에게 프로젝트 배정을 요청하세요.');
        return;
      }
      const res = await checkIn({
        project_id: projectInfo.project_id, // 대시보드에서 받아온 프로젝트 ID
        check_in_method: 'APP'
      });
      setAttendance(res);
      alert('출근 처리되었습니다. 오늘도 안전작업 하세요!');
    } catch (error) {
      console.error(error);
      alert('출근 처리에 실패했습니다.');
    }
  };

  const handleCheckOut = async () => {
    if (!confirm('퇴근 처리하시겠습니까?')) return;
    try {
      const res = await checkOut(attendance.id);
      setAttendance(res);
      alert('퇴근 처리되었습니다. 고생하셨습니다!');
    } catch (error) {
      console.error(error);
      alert('퇴근 처리에 실패했습니다.');
    }
  };

  if (loading) return <div className="dashboard-card" style={{ background: '#f59e0b', color: 'white', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩중...</div>;

  return (
    <div className="dashboard-card" style={{ background: '#f59e0b', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} /> 출역 현황
        </div>
        {attendance ? (
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
            {attendance.check_out_time ? '퇴근완료' : '근무중'}
          </span>
        ) : (
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
            출근전
          </span>
        )}
      </div>

      <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
        {attendance ? (
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
              {formatTime(attendance.check_in_time)}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>출근 완료</div>
            
            {!attendance.check_out_time && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleCheckOut(); }}
                style={{ 
                  marginTop: '10px', 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  fontWeight: 'bold',
                  cursor: 'pointer' 
                }}
              >
                퇴근하기
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>아직 출근 기록이 없습니다.</div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleCheckIn(); }}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '8px', 
                border: 'none', 
                background: 'white', 
                color: '#d97706', 
                fontWeight: '800', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Smartphone size={18} /> 출근체크
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCard;
