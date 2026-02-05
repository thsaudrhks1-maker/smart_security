import React, { useEffect, useState } from 'react';
import { getProjectAttendance } from '../../../api/attendanceApi';
import { 
  Users, 
  Search, 
  Calendar,
  Clock,
  UserCheck,
  MapPin,
  ChevronRight,
  Filter
} from 'lucide-react';

const AttendanceListWidget = ({ projectId }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!projectId) return;

    const loadAttendance = async () => {
      setLoading(true);
      try {
        const data = await getProjectAttendance(projectId, targetDate);
        setAttendance(data);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [projectId, targetDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return { bg: '#dcfce7', text: '#16a34a', label: '정상출근' };
      case 'LATE': return { bg: '#fef9c3', text: '#ca8a04', label: '지각' };
      case 'LEAVE_EARLY': return { bg: '#ffedd5', text: '#ea580c', label: '조퇴' };
      case 'ABSENT': return { bg: '#fee2e2', text: '#dc2626', label: '결근' };
      default: return { bg: '#f1f5f9', text: '#64748b', label: status };
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '1.5rem', 
      borderRadius: '12px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '500px'
    }}>
      {/* 위젯 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '700', 
          color: '#334155', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          margin: 0
        }}>
          <Users size={20} color="#6366f1" /> 실시간 출역 현황
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '6px',
            padding: '4px 8px'
          }}>
            <Calendar size={14} color="#64748b" style={{ marginRight: '6px' }} />
            <input 
              type="date" 
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                fontSize: '0.85rem', 
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
          <button style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '6px', 
            padding: '4px 8px',
            cursor: 'pointer'
          }}>
            <Filter size={14} color="#64748b" />
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '12px', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>전체</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{attendance.length}명</div>
        </div>
        <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '4px' }}>출근</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2563eb' }}>
            {attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length}
          </div>
        </div>
        <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '4px' }}>미출근</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#dc2626' }}>0</div>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', marginRight: '-8px', paddingRight: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>데이터 로딩 중...</div>
        ) : attendance.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            color: '#94a3b8',
            fontSize: '0.9rem',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #e2e8f0'
          }}>
            해당 날짜의 출역 기록이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attendance.map((item) => {
              const statusStyle = getStatusColor(item.status);
              return (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  border: '1px solid #f1f5f9',
                  background: '#fcfcfc',
                  transition: 'transform 0.1s ease',
                  cursor: 'pointer'
                }}>
                  {/* 프로필 아바타 (이름 첫글자) */}
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: '#e2e8f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '700',
                    color: '#64748b',
                    marginRight: '12px'
                  }}>
                    {item.full_name[0]}
                  </div>

                  {/* 정보 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{item.full_name}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        background: '#f1f5f9', 
                        color: '#64748b' 
                      }}>{item.job_type}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {item.company_name}
                    </div>
                  </div>

                  {/* 시간 및 상태 */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      background: statusStyle.bg, 
                      color: statusStyle.text,
                      display: 'inline-block',
                      marginBottom: '4px'
                    }}>
                      {statusStyle.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      <Clock size={12} /> {formatTime(item.check_in_time)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 푸터 */}
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
        <button style={{ 
          width: '100%', 
          padding: '10px', 
          background: 'white', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          color: '#475569',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          cursor: 'pointer'
        }}>
          상세 출역 리포트 보기 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AttendanceListWidget;
