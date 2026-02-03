import React, { useState, useEffect } from 'react';
import { 
  Briefcase, AlertTriangle, CheckCircle, Clock, MapPin, HardHat, 
  ArrowLeft, Map, Cloud, Bell, FileText, Shield, Calendar, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import SimpleModal from '../components/common/SimpleModal';
import AttendanceCard from '../components/dashboard/AttendanceCard';

const WorkerDashboard = ({ isAdminView = false, onBackToAdmin = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 데이터 상태
  const [myWork, setMyWork] = useState(null);
  const [myRisks, setMyRisks] = useState([]);
  const [dashboardInfo, setDashboardInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [activeModal, setActiveModal] = useState(null); // 'work', 'risk', 'notice' ...

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        const [workRes, riskRes, dashboardRes] = await Promise.all([
          apiClient.get('/worker/my-work/today'),
          apiClient.get('/worker/my-risks/today'),
          apiClient.get('/worker/dashboard-info')
        ]);

        setMyWork(workRes.data);
        setMyRisks(riskRes.data);
        setDashboardInfo(dashboardRes.data);
        setLoading(false);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setLoading(false);
      }
    };
    loadWorkerData();
  }, []);

  const handleViewLocation = (risk) => {
    navigate('/map', { state: { focusZone: risk } });
  };

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>데이터 로딩 중...</div>;
  }

  return (
    <div style={{ padding: '0.75rem', background: '#f1f5f9', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* 헤더 */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardHat size={22} fill="#3b82f6" color='white' style={{ background: '#3b82f6', borderRadius: '50%', padding: '2px' }} />
            {user?.full_name}님
            {dashboardInfo?.user_info && (
              <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px' }}>
                {dashboardInfo.user_info.company_name} | {dashboardInfo.user_info.project_name}
              </span>
            )}
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '2rem' }}>
             오늘도 안전한 하루 되세요!
          </div>
        </div>
        
        {isAdminView && onBackToAdmin && (
          <button onClick={onBackToAdmin} style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* 메인 그리드 레이아웃 (2열 구조) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '0.35rem', 
        gridAutoRows: 'minmax(100px, auto)'
      }}>
        
        {/* [좌측 1] 금일 나의 작업 (파란색, 세로로 김) */}
        <div 
          onClick={() => openModal('work')}
          className="dashboard-card"
          style={{ 
            gridColumn: '1 / 2',
            gridRow: 'span 2',
            background: '#3b82f6', 
            color: 'white',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={18} /> 금일 나의 작업
            </div>
            {myWork ? (
              <>
                <div style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  display: 'inline-block', 
                  fontSize: '0.75rem', 
                  marginBottom: '0.5rem' 
                }}>
                  {myWork.work_type}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', lineHeight: '1.3' }}>
                  {myWork.description.length > 15 ? myWork.description.substring(0, 15) + '...' : myWork.description}
                </div>
                {/* 일일 위험 요소 뱃지 */}
                {myWork.daily_hazards && myWork.daily_hazards.length > 0 && (
                  <div style={{ 
                    marginTop: '6px', 
                    fontSize: '0.75rem', 
                    background: 'rgba(255,100,100,0.3)', 
                    border: '1px solid rgba(255,255,255,0.4)', 
                    color: '#ffecec', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertTriangle size={12} /> 위험 {myWork.daily_hazards.length}건 주의
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>
                  <MapPin size={12} style={{ display: 'inline' }} /> {myWork.zone_name}
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '1rem' }}>작업 없음</div>
            )}
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
             <ChevronRight size={20} style={{ opacity: 0.7 }} />
          </div>
        </div>

        {/* [우측 1] 날씨 (하늘색) */}
        <div style={{ background: '#60a5fa', color: 'white' }} className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                {dashboardInfo?.weather?.temperature || '-'}
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                {dashboardInfo?.weather?.condition || '정보없음'}
              </div>
            </div>
            <Cloud size={24} style={{ opacity: 0.8 }} />
          </div>
        </div>

        {/* [우측 2] 긴급알림 (빨간색) */}
        <div 
          onClick={() => openModal('alert')}
          style={{ background: '#ef4444', color: 'white' }} 
          className="dashboard-card"
        >
          <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bell size={14} /> 긴급알림
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {dashboardInfo?.emergency_alert?.title || '알림 없음'}
          </div>
           {/* 깜빡이는 효과 */}
           {dashboardInfo?.emergency_alert && (
            <div style={{ 
              width: '8px', height: '8px', background: 'white', borderRadius: '50%', 
              position: 'absolute', top: '10px', right: '10px',
              animation: 'blink 1s infinite'
            }} />
          )}
        </div>

        {/* [좌측 2] 금일 나의 위험지역 (주황색, 세로로 김) */}
        <div 
          onClick={() => openModal('risk')}
          className="dashboard-card"
          style={{ 
            gridColumn: '1 / 2',
            gridRow: 'span 2',
            background: '#f97316', 
            color: 'white',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={18} /> 위험지역
            </div>
            {myRisks.length > 0 ? (
              <div>
                <div style={{ fontSize: '1.0rem', fontWeight: '800', lineHeight: '1.4', marginBottom: '6px', wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>
                  {myRisks[0].description}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {myRisks[0].name}
                </div>
                {myRisks.length > 1 && (
                  <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
                    외 {myRisks.length - 1}건
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                <CheckCircle size={20} /> 안전함
              </div>
            )}
          </div>
           <div style={{ alignSelf: 'flex-end' }}>
             <Shield size={24} style={{ opacity: 0.3 }} />
          </div>
        </div>

        {/* [우측 3] 안전정보 (초록색) */}
        <div 
          onClick={() => openModal('safety')}
           style={{ background: '#10b981', color: 'white' }} 
           className="dashboard-card"
        >
          <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>일일 안전정보</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
               <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{dashboardInfo?.safety_infos?.length || 0}</span>
               <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '2px' }}>건</span>
            </div>
            <FileText size={20} style={{ opacity: 0.5 }} />
          </div>
        </div>

        {/* [우측 4] 출역현황 (노란색) - 기능 연동 */}
        <AttendanceCard 
          projectInfo={dashboardInfo?.user_info} 
        />

        {/* [하단 전체] 공지사항 (회색) */}
        <div 
          onClick={() => openModal('notice')}
          className="dashboard-card"
          style={{ 
            gridColumn: '1 / -1', 
            background: '#64748b', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '2px' }}>공지사항</div>
              <div style={{ fontSize: '0.9rem' }}>
                {dashboardInfo?.notices?.[0] 
                  ? dashboardInfo.notices[0].title 
                  : '등록된 공지가 없습니다.'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} style={{ opacity: 0.7 }} />
        </div>

        {/* [하단] 안전위반 / 무재해 */}
         <div style={{ background: '#8b5cf6', color: 'white', textAlign: 'center' }} className="dashboard-card">
            <div style={{ fontSize: '0.7rem' }}>안전위반</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{dashboardInfo?.safety_violations_count}건</div>
         </div>
         <div style={{ background: '#6366f1', color: 'white', textAlign: 'center' }} className="dashboard-card">
            <div style={{ fontSize: '0.7rem' }}>무재해</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{dashboardInfo?.incident_free_days}일</div>
         </div>

      </div>

      <style>{`
        .dashboard-card {
          padding: 1rem;
          border-radius: 4px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .dashboard-card:active {
          transform: scale(0.98);
        }
        @keyframes blink {
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* ============== 모달 구현 ============== */}
      
      {/* 1. 작업 상세 모달 */}
      <SimpleModal 
        isOpen={activeModal === 'work'} 
        onClose={closeModal}
        title="📋 금일 작업 상세"
      >
        {myWork ? (
          <div>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>작업명</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{myWork.description}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>작업 유형</div>
                <div style={{ fontWeight: '600' }}>{myWork.work_type}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>작업 구역</div>
                <div style={{ fontWeight: '600' }}>{myWork.zone_name}</div>
              </div>
            </div>

            {myWork.required_ppe && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#3b82f6' }}>🛡️ 필수 보호구</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {myWork.required_ppe.map((item, i) => (
                    <span key={i} style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #bfdbfe' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
             
            {myWork.checklist_items && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#10b981' }}>✅ 안전 점검 리스트</div>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {myWork.checklist_items.map((item, i) => (
                    <li key={i} style={{ marginBottom: '4px', fontSize: '0.9rem', color: '#334155' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 위험 요소 표시 */}
            {myWork.hazards && myWork.hazards.length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={18} />
                  ⚠️ 주의: 위험 요소
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {myWork.hazards.map((hazard, i) => (
                    <span key={i} style={{ 
                      background: '#fee2e2', 
                      color: '#991b1b', 
                      padding: '6px 10px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem', 
                      fontWeight: '600',
                      border: '1px solid #fca5a5'
                    }}>
                      {hazard}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>금일 배정된 작업이 없습니다.</div>
        )}
      </SimpleModal>

      {/* 2. 위험 지역 상세 모달 */}
      <SimpleModal
        isOpen={activeModal === 'risk'}
        onClose={closeModal}
        title="⚠️ 금일 위험 지역"
      >
        {myRisks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myRisks.map((risk, idx) => (
              <div key={idx} style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <span style={{ fontWeight: '700', color: '#c2410c' }}>{risk.name}</span>
                   <span style={{ background: '#f97316', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>{risk.level}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#431407', marginBottom: '0.75rem' }}>
                  {risk.description || '위험 구역입니다. 접근 시 주의하세요.'}
                </div>
                <button 
                  onClick={() => handleViewLocation(risk)}
                  style={{ width: '100%', padding: '8px', background: 'white', border: '1px solid #f97316', color: '#f97316', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                >
                  지도에서 위치 보기
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <div style={{ color: '#10b981', fontWeight: '700' }}>위험 지역 없음</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>안전한 작업 환경입니다.</div>
          </div>
        )}
      </SimpleModal>

      {/* 3. 공지사항 모달 */}
      <SimpleModal
        isOpen={activeModal === 'notice'}
        onClose={closeModal}
        title="📢 공지사항"
      >
        {dashboardInfo?.notices && dashboardInfo.notices.length > 0 ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {dashboardInfo.notices.map((notice, idx) => (
               <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: notice.priority === 'URGENT' ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                   {notice.priority === 'URGENT' && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px' }}>긴급</span>}
                   <span style={{ fontWeight: '700', color: '#1e293b' }}>{notice.title}</span>
                 </div>
                 <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                    {/* 내용이 없으면 더미 텍스트라도 보여주기 위해 */}
                    {notice.content || '공지 내용이 없습니다.'}
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>등록된 공지사항이 없습니다.</div>
        )}
      </SimpleModal>

       {/* 4. 긴급알림 모달 */}
       <SimpleModal
        isOpen={activeModal === 'alert'}
        onClose={closeModal}
        title="🚨 긴급 알림"
      >
        {dashboardInfo?.emergency_alert ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem', animation: 'blink 1s infinite' }} />
            <h2 style={{ color: '#ef4444', margin: '0 0 1rem' }}>{dashboardInfo.emergency_alert.title}</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#1e293b' }}>
              {dashboardInfo.emergency_alert.message}
            </p>
          </div>
        ) : (
           <div style={{ textAlign: 'center', color: '#94a3b8' }}>현재 발령된 긴급 알림이 없습니다.</div>
        )}
      </SimpleModal>

       {/* 5. 일일 안전정보 모달 */}
       <SimpleModal
        isOpen={activeModal === 'safety'}
        onClose={closeModal}
        title="📋 금일 안전 정보"
      >
        {dashboardInfo?.safety_infos && dashboardInfo.safety_infos.length > 0 ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {dashboardInfo.safety_infos.map((info, idx) => (
               <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem' }}>
                 <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '0.75rem', fontSize: '1rem' }}>
                   {info.title}
                 </div>
                 <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                   {info.content}
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>등록된 안전 정보가 없습니다.</div>
        )}

      </SimpleModal>

       {/* 6. 위험지역 상세 모달 */}
       <SimpleModal
        isOpen={activeModal === 'risk'}
        onClose={closeModal}
        title="⚠️ 위험 지역 목록"
      >
        {myRisks && myRisks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myRisks.map((risk, idx) => (
              <div 
                key={idx} 
                onClick={() => handleViewLocation(risk)}
                style={{ 
                  background: '#fff7ed', 
                  border: '1px solid #fdba74', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '700', color: '#c2410c', fontSize: '1rem' }}>
                    {risk.name}
                  </div>
                  <span style={{ 
                    background: risk.level === 'HIGH' ? '#fee2e2' : '#ffedd5',
                    color: risk.level === 'HIGH' ? '#991b1b' : '#9a3412',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: '600'
                  }}>
                    {risk.level}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#431407', marginBottom: '0.5rem' }}>
                  {risk.description}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fdba74', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> 지도에서 위치 보기
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            현재 지정된 위험 지역이 없습니다.
          </div>
        )}
      </SimpleModal>

    </div>
  );
};

export default WorkerDashboard;
