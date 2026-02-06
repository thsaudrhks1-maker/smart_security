import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Smartphone } from 'lucide-react';
import { getMyTodayAttendance, checkIn, checkOut } from '@/api/attendanceApi';

const AttendanceCard = ({ projectInfo, onStatusChange }) => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  // ?�간 ?�맷???�퍼 (HH:mm)
  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // ?�늘??출근 ?�보 조회
  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await getMyTodayAttendance();
      setAttendance(data);
      if (onStatusChange) onStatusChange(data);
    } catch (error) {
      console.error("출근 ?�보 로드 ?�패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!confirm('?�재 ?�각?�로 출근 처리?�시겠습?�까?')) return;
    try {
      if (!projectInfo || !projectInfo.project_id) {
        // ?�로?�트 ID가 ?�을 경우 ?�외 처리 (?�림 메시지 구체??
        alert('배정???�로?�트 ?�보가 ?�습?�다.\n관리자?�게 ?�로?�트 배정???�청?�세??');
        return;
      }
      const res = await checkIn({
        project_id: projectInfo.project_id, // ?�?�보?�에??받아???�로?�트 ID
        check_in_method: 'APP'
      });
      setAttendance(res);
      alert('출근 처리?�었?�니?? ?�늘???�전?�업 ?�세??');
    } catch (error) {
      console.error(error);
      alert('출근 처리???�패?�습?�다.');
    }
  };

  const handleCheckOut = async () => {
    if (!confirm('?�근 처리?�시겠습?�까?')) return;
    try {
      const res = await checkOut(attendance.id);
      setAttendance(res);
      alert('?�근 처리?�었?�니?? 고생?�셨?�니??');
    } catch (error) {
      console.error(error);
      alert('?�근 처리???�패?�습?�다.');
    }
  };

  if (loading) return <div className="dashboard-card" style={{ background: '#f59e0b', color: 'white', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩�?..</div>;

  return (
    <div className="dashboard-card" style={{ background: '#f59e0b', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} /> 출역 ?�황
        </div>
        {attendance ? (
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
            {attendance.check_out_time ? '?�근?�료' : '근무�?}
          </span>
        ) : (
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
            출근??
          </span>
        )}
      </div>

      <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
        {attendance ? (
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
              {formatTime(attendance.check_in_time)}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>출근 ?�료</div>
            
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
                ?�근?�기
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>?�직 출근 기록???�습?�다.</div>
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
