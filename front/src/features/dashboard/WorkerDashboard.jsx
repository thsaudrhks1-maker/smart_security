import React, { useState, useEffect } from 'react';
import { Briefcase, AlertTriangle, CheckCircle, Clock, MapPin, HardHat, ArrowLeft, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * 작업자 전용 대시보드
 * - 금일 나의 작업
 * - 금일 나의 위험지역
 * - 개인화된 정보만 표시
 * - 흰색 배경 + 어두운 글씨
 */
const WorkerDashboard = ({ isAdminView = false, onBackToAdmin = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myWork, setMyWork] = useState(null);
  const [myRisks, setMyRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        // 내 작업 정보 조회
        const workRes = await apiClient.get('/worker/my-work/today');
        setMyWork(workRes.data);

        // 내 위험지역 정보 조회
        const riskRes = await apiClient.get('/worker/my-risks/today');
        setMyRisks(riskRes.data);

        setLoading(false);
      } catch (err) {
        console.error('작업자 데이터 로드 실패:', err);
        setLoading(false);
      }
    };

    loadWorkerData();
  }, []);

  const handleViewLocation = (risk) => {
    // 위치 데이터와 함께 지도 페이지로 이동
    navigate('/map', { state: { focusZone: risk } });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ color: '#64748b', fontSize: '1.1rem' }}>데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1.5rem', 
      background: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '800', 
            color: '#1e293b', 
            marginBottom: '0.25rem' 
          }}>
            <HardHat size={20} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            안녕하세요, {user?.full_name}님
          </h1>
          <div style={{ 
            color: '#64748b', 
            fontSize: '0.85rem', 
            marginLeft: '1.8rem', 
            marginBottom: '0px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>@{user?.username}</span>
            <span style={{
              background: '#e2e8f0',
              color: '#475569',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '400'
            }}>
              {user?.role === 'admin' ? '관리자' : '작업자'}
            </span>
          </div>
        </div>
        
        {/* 관리자 뷰에서 돌아가기 버튼 */}
        {isAdminView && onBackToAdmin && (
          <button
            onClick={onBackToAdmin}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#64748b',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={18} />
            데이터베이스로 돌아가기
          </button>
        )}
      </div>

      {/* 금일 나의 작업 */}
      <div style={{ 
        padding: '1.5rem', 
        marginBottom: '1.5rem',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '800', 
          color: '#3b82f6', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Briefcase size={24} />
          금일 나의 작업
        </h2>

        {myWork ? (
          <div>
            <div style={{ 
              background: '#f8fafc', 
              padding: '1.25rem', 
              borderRadius: '12px',
              marginBottom: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                {myWork.description}
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                fontSize: '0.85rem', 
                color: '#64748b',
                marginTop: '0.75rem'
              }}>
                <span><MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} />{myWork.zone_name}</span>
                <span><Clock size={16} style={{ display: 'inline', marginRight: '4px' }} />{myWork.work_type}</span>
              </div>
            </div>

            {/* 필수 보호구 */}
            {myWork.required_ppe && myWork.required_ppe.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
                  🛡 필수 보호구
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {myWork.required_ppe.map((item, idx) => (
                    <span key={idx} style={{ 
                      background: '#eff6ff', 
                      color: '#3b82f6', 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      border: '1px solid #bfdbfe'
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 체크리스트 */}
            {myWork.checklist_items && myWork.checklist_items.length > 0 && (
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
                  ✅ 안전 체크리스트
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myWork.checklist_items.map((item, idx) => (
                    <label key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: '#1e293b',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#64748b' 
          }}>
            금일 배정된 작업이 없습니다.
          </div>
        )}
      </div>

      {/* 금일 나의 위험지역 */}
      <div style={{ 
        padding: '1.5rem',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '800', 
          color: '#ef4444', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={24} />
          금일 나의 위험지역
        </h2>

        {myRisks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myRisks.map((risk, idx) => (
              <div key={idx} style={{ 
                background: '#fef2f2', 
                padding: '1rem', 
                borderRadius: '12px',
                border: '1px solid #fecaca'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                    {risk.name}
                  </span>
                  <span style={{ 
                    background: '#ef4444', 
                    color: 'white', 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem',
                    fontWeight: '800'
                  }}>
                    {risk.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {risk.level} - {risk.description || '위험 구역'}
                </div>
                {/* 위치 보기 버튼 */}
                <button
                  onClick={() => handleViewLocation(risk)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    background: 'white',
                    color: '#ef4444',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ef4444';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#ef4444';
                  }}
                >
                  <Map size={18} />
                  지도에서 위치 보기
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#64748b' 
          }}>
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
            <div>금일 위험지역이 없습니다.</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>안전한 작업 환경입니다.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
