
import React, { useState, useEffect } from 'react';
import { safetyApi } from '@/api/safetyApi';
import { dangerApi } from '@/api/dangerApi';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, X, Check, Trash2, List, Plus } from 'lucide-react';
import DangerForm from './forms/DangerForm'; // 공유 폼 컴포넌트

/**
 * [COMMON] 통합 위험 구역 모달 (Refactored to use DangerForm)
 * 1. WORKER: 신규 위험 신고
 * 2. MANAGER: 위험 구역 목록 관리 및 승인
 */
function DangerZoneModal({ open, onClose, zone, onSuccess, mode = 'WORKER' }) {
  const { user } = useAuth();
  
  // 상태 관리
  const [viewSubMode, setViewSubMode] = useState('FORM'); // 'LIST' or 'FORM'
  const [dangerTemplates, setDangerTemplates] = useState([]);
  
  // DangerForm과 호환되는 상태 구조
  const [dangerForm, setDangerForm] = useState({
      mode: 'template', // 'template' | 'custom'
      danger_info_id: '',
      custom_type: '',
      custom_icon: 'alert-triangle',
      custom_color: '#ef4444', 
      description: '',
      risk_level: 3
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. 초기화 및 템플릿 로드
  useEffect(() => {
    if (open) {
      // 매니저 모드이면서 해당 구역에 이미 데이터가 있으면 리스트 모드로 시작
      if (mode === 'MANAGER' && zone?.dangers?.length > 0) {
        setViewSubMode('LIST');
      } else {
        setViewSubMode('FORM');
      }
      loadTemplates();
    }
  }, [open, zone, mode]);

  const loadTemplates = async () => {
    try {
      // API가 safetyApi 또는 dangerApi에 있을 수 있음. 
      // 기존 코드에서는 safetyApi.getDangerTemplates() 사용했으나
      // DangerForm에서는 dangerApi.getDangerInfoList() 구조를 기대할 수 있음.
      // 여기서는 safetyApi 사용 (기존 유지)
      const res = await safetyApi.getDangerTemplates();
      if (res?.success) setDangerTemplates(res.data);
    } catch (e) {
      console.error('템플릿 로드 실패:', e);
    }
  };

  // 2. 제출 로직 (신고/등록)
  const handleSubmit = async () => {
    // 폼 검증은 DangerForm 내부에서 하거나 여기서 수행
    if (dangerForm.mode === 'template' && !dangerForm.danger_info_id) {
        alert('위험 요소를 선택해주세요.');
        return;
    }
    if (dangerForm.mode === 'custom' && !dangerForm.custom_type) {
        alert('위험 유형을 입력해주세요.');
        return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', user?.project_id || 1);
      formData.append('zone_id', zone.id);
      formData.append('user_id', user?.id || user?.user_id);
      
      // 날짜 필드는 오늘 날짜 (필요 시)
      const today = new Date().toISOString().split('T')[0];
      formData.append('date', today);

      if (dangerForm.mode === 'template') {
        formData.append('danger_info_id', dangerForm.danger_info_id);
        const template = dangerTemplates.find(t => t.id === Number(dangerForm.danger_info_id));
        formData.append('risk_type', template?.danger_type || 'ETC');
      } else {
        formData.append('risk_type', dangerForm.custom_type);
        // 커스텀 정보 처리 로직 (백엔드에 따라 다름)
      }
      
      formData.append('description', dangerForm.description);
      formData.append('status', mode === 'MANAGER' ? 'APPROVED' : 'PENDING');

      files.forEach(f => formData.append('files', f));

      await safetyApi.reportDanger(formData);

      alert(mode === 'WORKER' ? '위험 요소 신고가 접수되었습니다.' : '위험 구역이 등록되었습니다.');
      if (onSuccess) onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('위험 구역 처리 실패:', err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 3. 승인/삭제 로직 (관리자 전용)
  const handleApprove = async (dangerId) => {
    if (!confirm('해당 신고 내역을 정식 위험 구역으로 승인하시겠습니까?')) return;
    try {
        await safetyApi.approveHazard(dangerId);
        alert('승인되었습니다.');
        if (onSuccess) onSuccess();
        // 리스트 갱신 필요 시 부모에게 요청하거나 여기서 처리
        onClose(); 
    } catch (e) {
       alert('승인 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (dangerId) => {
    if (!confirm('위험 구역 설정을 해제하시겠습니까?')) return;
    try {
        await safetyApi.deleteHazard(dangerId);
        alert('삭제되었습니다.');
        if (onSuccess) onSuccess();
        onClose();
    } catch (e) {
        alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const resetForm = () => {
    setDangerForm({
        mode: 'template',
        danger_info_id: '',
        custom_type: '',
        custom_icon: 'alert-triangle',
        custom_color: '#ef4444', 
        description: '',
        risk_level: 3
    });
    setFiles([]);
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 10000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '30px', padding: '30px',
        width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={28} color={viewSubMode === 'LIST' ? '#3b82f6' : '#dc2626'} />
            {mode === 'MANAGER' ? '위험 구역 관리' : '실시간 위험 신고'}
          </h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        {/* 구역 정보 바 */}
        <div style={{ marginBottom: '20px', padding: '15px 20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', marginBottom: '2px' }}>TARGET ZONE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: '#1e293b' }}>{zone?.level} {zone?.name || zone?.zone_name}</div>
          </div>
          {mode === 'MANAGER' && zone?.dangers?.length > 0 && (
            <button 
              onClick={() => setViewSubMode(viewSubMode === 'LIST' ? 'FORM' : 'LIST')}
              style={{ background: '#eff6ff', border: 'none', padding: '10px 15px', borderRadius: '12px', color: '#3b82f6', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {viewSubMode === 'LIST' ? <><Plus size={18} /> 신규 등록</> : <><List size={18} /> 목록 보기</>}
            </button>
          )}
        </div>

        {/* [Mode: LIST] 관리자 검토 및 목록 확인 */}
        {viewSubMode === 'LIST' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {zone?.dangers?.map(d => (
              <div key={d.id} style={{ padding: '20px', borderRadius: '20px', border: '1.5px solid #e2e8f0', background: d.status === 'PENDING' ? '#fffbeb' : 'white' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900', color: 'white',
                        background: d.status === 'PENDING' ? '#f59e0b' : '#3b82f6', marginRight: '6px'
                      }}>
                        {d.status === 'PENDING' ? '검토중' : '승인완료'}
                      </span>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{d.danger_type_label || d.risk_type}</strong>
                    </div>
                 </div>
                 <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '15px', lineHeight: '1.5' }}>{d.description}</div>
                 
                 {/* 이미지 썸네일 표시 (있는 경우) */}
                 {d.image_url && (
                    <div style={{ marginBottom: '15px' }}>
                        <img src={`http://localhost:8000${d.image_url}`} alt="위험 사진" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                 )}

                 <div style={{ display: 'flex', gap: '8px' }}>
                    {d.status === 'PENDING' && (
                      <button 
                        onClick={() => handleApprove(d.id)}
                        style={{ flex: 1, padding: '10px', background: '#ecfdf5', border: 'none', borderRadius: '12px', color: '#059669', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Check size={18} /> 승인
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(d.id)}
                      style={{ padding: '10px', background: '#fef2f2', border: 'none', borderRadius: '12px', color: '#dc2626', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* [Mode: FORM] 등록/신고 폼 (Shared Component) */}
        {viewSubMode === 'FORM' && (
           <DangerForm 
             dangerForm={dangerForm}
             setDangerForm={setDangerForm}
             dangerTemplates={dangerTemplates}
             files={files}
             setFiles={setFiles}
             onSubmit={handleSubmit}
             onCancel={() => {
                 if (viewSubMode === 'LIST') return; // 리스트가 있으면 리스트로 돌아가야 하나? 여기선 모달 닫기
                 onClose();
             }}
             mode={mode} // 'WORKER' or 'MANAGER'
           />
        )}
      </div>
    </div>
  );
}

export default DangerZoneModal;
