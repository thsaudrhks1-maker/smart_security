import React, { useState } from 'react';
import apiClient from '../../../api/client';

/**
 * [WORKER] 실시간 위험 요소 신고 모달
 */
function DangerReportModal({ open, onClose, zone, onSuccess }) {
  const [description, setDescription] = useState('');
  const [riskType, setRiskType] = useState('CAUTION');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      // 1. 위험 구역 생성 요청
      const reportRes = await apiClient.post('/safety/reports', {
        zone_id: zone.id,
        risk_type: riskType,
        level: riskType,
        description: description,
        lat: zone.lat,
        lng: zone.lng
      });

      const dangerZoneId = reportRes.data.danger_zone_id;

      // 2. 이미지 업로드 (있는 경우)
      if (images.length > 0 && dangerZoneId) {
        const formData = new FormData();
        images.forEach(img => formData.append('files', img));
        await apiClient.post(`/safety/reports/${dangerZoneId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('위험 요소 신고가 접수되었습니다.');
      onSuccess();
      onClose();
      setDescription('');
      setImages([]);
    } catch (err) {
      console.error('신고 실패:', err);
      alert('신고 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '24px',
        width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#d32f2f' }}>⚠️ 실시간 위험 요소 신고</h2>

        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
          <strong>신고 구역:</strong> {zone?.level || ''} {zone?.name || '구역'}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              위험 유형 <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              value={riskType}
              onChange={(e) => setRiskType(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px'
              }}
            >
              <option value="CAUTION">단순 주의</option>
              <option value="FALL">낙하 위험</option>
              <option value="HEAVY_EQUIPMENT">중장비 작업</option>
              <option value="FIRE">화재 위험</option>
              <option value="ELECTRIC">감전 위험</option>
              <option value="COLLAPSE">붕괴 위험</option>
              <option value="ETC">기타 위험</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>상세 내용</label>
            <textarea
              placeholder="위험 요소를 상세히 적어주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>현장 사진 첨부</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              style={{
                flex: 1, padding: '10px 20px', border: 'none', borderRadius: '6px',
                backgroundColor: loading ? '#ccc' : '#d32f2f', color: 'white',
                cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? '처리 중..' : '신고 접수'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
          💡 <strong>안내:</strong> 신고 접수 후 관리자 승인이 필요합니다. 승인 후에 해당 구역에 주황색 테두리로 표시됩니다.
        </div>
      </div>
    </div>
  );
}

export default DangerReportModal;
