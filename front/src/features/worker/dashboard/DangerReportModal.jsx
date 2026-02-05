import React, { useState } from 'react';
import apiClient from '../../../api/client';

/**
 * 근로자 위험 신고 모달
 * - Zone 클릭 시 위험 요소 신고
 * - 사진 업로드 지원
 */
function DangerReportModal({ open, onClose, zone, projectId, onSuccess }) {
  const [riskType, setRiskType] = useState('FALL');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 신고 생성
      const reportData = {
        zone_id: zone.id,
        risk_type: riskType,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      };

      const reportRes = await apiClient.post('/safety/reports', reportData);
      const reportId = reportRes.data.id;

      // 2. 사진 업로드 (여러 장)
      for (const image of images) {
        const formData = new FormData();
        formData.append('file', image);
        await apiClient.post(`/safety/reports/${reportId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('신고가 접수되었습니다. 관리자 승인 후 위험 구역으로 표시됩니다.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('신고 실패:', error);
      alert('신고 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#d32f2f' }}>⚠️ 위험 요소 신고</h2>
        
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
          <strong>신고 구역:</strong> {zone?.level} {zone?.name}
        </div>

        <form onSubmit={handleSubmit}>
          {/* 위험 유형 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              위험 유형 <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              value={riskType}
              onChange={(e) => setRiskType(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="FALL">낙하물 위험</option>
              <option value="HEAVY_EQUIPMENT">중장비 작업</option>
              <option value="FIRE">화재 위험</option>
              <option value="ELECTRIC">감전 위험</option>
              <option value="COLLAPSE">붕괴 위험</option>
              <option value="ETC">기타</option>
            </select>
          </div>

          {/* 상세 설명 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              상세 설명 <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="위험 요소를 자세히 설명해주세요 (예: 천장 마감재가 고정되지 않아 낙하 위험)"
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* 사진 업로드 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              사진 첨부 (최대 5장)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {images.length > 0 && (
              <div style={{ marginTop: '8px', color: '#666', fontSize: '13px' }}>
                {images.length}개 파일 선택됨
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: loading ? '#ccc' : '#d32f2f',
                color: 'white',
                cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {loading ? '처리중...' : '신고 접수'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
          💡 <strong>안내:</strong> 신고 접수 후 관리자 승인이 필요합니다. 승인 시 해당 구역이 주황색 테두리로 표시됩니다.
        </div>
      </div>
    </div>
  );
}

export default DangerReportModal;
