import React from 'react';
import { 
  Shield, CheckCircle, AlertTriangle, Bell, MapPin
} from 'lucide-react';
import SimpleModal from '@/components/common/SimpleModal';

/**
 * 근로자 대시보드 전용 모달 모음
 */
export const WorkDetailModal = ({ isOpen, onClose, plans, selectedIndex, setSelectedIndex }) => {
  const detailPlan = plans[selectedIndex];
  if (!detailPlan) return null;

  return (
    <SimpleModal isOpen={isOpen} onClose={onClose} title="📋 금일 작업 상세">
      <div>
        {plans.length > 1 && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {plans.map((p, idx) => (
              <button
                key={p.id ?? idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: selectedIndex === idx ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: selectedIndex === idx ? '#eff6ff' : '#fff',
                  color: selectedIndex === idx ? '#1d4ed8' : '#64748b',
                  fontWeight: selectedIndex === idx ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {p.zone_name} · {p.work_type}
              </button>
            ))}
          </div>
        )}
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>작업명</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{detailPlan.description}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>작업 유형</div>
            <div style={{ fontWeight: '600' }}>{detailPlan.work_type}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>작업 구역</div>
            <div style={{ fontWeight: '600' }}>{detailPlan.zone_name}</div>
          </div>
        </div>

        {/* 보호구 및 체크리스트 (기존 코드 유지) */}
        {detailPlan.required_resources?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
               <Shield size={18} /> 필수 보호구 착용 확인
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {detailPlan.required_resources.map((res, i) => (
                <label key={res.id || i} style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer'
                }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                  <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600' }}>{res.name}</div>
                </label>
              ))}
            </div>
          </div>
        )}

        {detailPlan.checklist_items?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
               <CheckCircle size={18} /> 안전 점검 리스트
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {detailPlan.checklist_items.map((item, i) => (
                <label key={i} style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7', cursor: 'pointer'
                }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px', marginTop: '2px' }} />
                  <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: '500', lineHeight: '1.4' }}>{item}</div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimpleModal>
  );
};

export const RiskDetailModal = ({ isOpen, onClose, risks, onFetchLocation }) => (
  <SimpleModal isOpen={isOpen} onClose={onClose} title="⚠️ 금일 위험 지역">
    {risks.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {risks.map((risk, idx) => (
          <div key={idx} style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
               <span style={{ fontWeight: '700', color: '#c2410c' }}>{risk.name}</span>
               <span style={{ background: '#f97316', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>{risk.level}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#431407', marginBottom: '0.75rem' }}>
              {risk.description || '위험 구역입니다. 접근 시 주의하세요.'}
            </div>
            <button 
              onClick={() => onFetchLocation(risk)}
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
);

export const NoticeModal = ({ isOpen, onClose, notices }) => (
  <SimpleModal isOpen={isOpen} onClose={onClose} title="📢 공지사항">
    {notices?.length > 0 ? (
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
         {notices.map((notice, idx) => (
           <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: notice.priority === 'URGENT' ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
             <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
               {notice.priority === 'URGENT' && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px' }}>긴급</span>}
               <span style={{ fontWeight: '700', color: '#1e293b' }}>{notice.title}</span>
             </div>
             <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                {notice.content || '공지 내용이 없습니다.'}
             </div>
           </div>
         ))}
       </div>
    ) : (
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>등록된 공지사항이 없습니다.</div>
    )}
  </SimpleModal>
);

export const EmergencyAlertModal = ({ isOpen, onClose, alert }) => (
  <SimpleModal isOpen={isOpen} onClose={onClose} title="🚨 긴급 알림">
    {alert ? (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ color: '#ef4444', margin: '0 0 1rem' }}>{alert.title}</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#1e293b' }}>
          {alert.message}
        </p>
      </div>
    ) : (
       <div style={{ textAlign: 'center', color: '#94a3b8' }}>현재 발령된 긴급 알림이 없습니다.</div>
    )}
  </SimpleModal>
);

export const SafetyInfoModal = ({ isOpen, onClose, safetyInfos }) => (
  <SimpleModal isOpen={isOpen} onClose={onClose} title="📋 금일 안전 정보">
    {safetyInfos?.length > 0 ? (
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
         {safetyInfos.map((info, idx) => (
           <div key={idx} style={{ 
             background: info.type === 'TASK_SAFETY' ? '#f0f9ff' : '#f0fdf4', 
             border: info.type === 'TASK_SAFETY' ? '1px solid #bae6fd' : '1px solid #86efac', 
             borderRadius: '8px', 
             padding: '1rem' 
           }}>
             <div style={{ 
               fontWeight: '800', 
               color: info.type === 'TASK_SAFETY' ? '#0369a1' : '#10b981', 
               marginBottom: '0.75rem', 
               fontSize: '1rem',
               display: 'flex',
               alignItems: 'center',
               gap: '6px'
             }}>
               {info.type === 'TASK_SAFETY' ? <Shield size={18} /> : <Bell size={18} />}
               {info.title}
             </div>
             <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
               {info.content}
             </div>
           </div>
         ))}
       </div>
    ) : (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>등록된 안전 정보가 없습니다.</div>
    )}
  </SimpleModal>
);
