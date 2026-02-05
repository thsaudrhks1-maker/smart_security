import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/client';

/**
 * 매니저 신고 승인 모달
 * - 근로자 신고 내용 확인
 * - 사진 확인
 * - 승인/반려 처리
 */
function DangerReportApprovalModal({ open, onClose, report, onSuccess }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open || !report?.danger_zone_id) {
      setImages([]);
      return;
    }

    // 신고 사진 조회
    setLoading(true);
    apiClient.get(`/safety/reports/${report.danger_zone_id}/images`)
      .then(res => setImages(res.data || []))
      .catch(err => {
        console.error('사진 로드 실패:', err);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, [open, report]);

  const handleApprove = async () => {
    if (!window.confirm('이 신고를 승인하시겠습니까?\n승인 시 해당 구역이 빨간색 위험 구역으로 표시됩니다.')) {
      return;
    }

    setProcessing(true);
    try {
      await apiClient.post(`/safety/reports/${report.danger_zone_id}/approve`);
      alert('신고가 승인되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('이 신고를 반려하시겠습니까?\n반려 시 위험 구역에서 제외됩니다.')) {
      return;
    }

    setProcessing(true);
    try {
      await apiClient.post(`/safety/reports/${report.danger_zone_id}/reject`);
      alert('신고가 반려되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('반려 실패:', error);
      alert('반려 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  if (!open || !report) return null;

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
        padding: '28px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
      }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f97316'
        }}>
          <h2 style={{ margin: 0, color: '#f97316', fontSize: '20px' }}>
            🔔 근로자 위험 신고 검토
          </h2>
          <span style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#fff7ed',
            color: '#f97316',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '2px solid #f97316'
          }}>
            승인 대기
          </span>
        </div>

        {/* 구역 정보 */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '16px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '10px',
          border: '2px solid #fbbf24'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#92400e' }}>
            📍 신고 위치
          </div>
          <div style={{ fontSize: '15px', color: '#78350f' }}>
            {report.name || `구역 #${report.zone_id}`} ({report.level || '-'})
          </div>
        </div>

        {/* 위험 유형 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', fontSize: '15px' }}>
            ⚠️ 위험 유형
          </div>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fee2e2', 
            borderRadius: '8px',
            border: '1px solid #fca5a5',
            fontSize: '15px',
            fontWeight: '600',
            color: '#991b1b'
          }}>
            {getRiskTypeLabel(report.risk_type || report.level)}
          </div>
        </div>

        {/* 신고 내용 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', fontSize: '15px' }}>
            📝 신고 내용
          </div>
          <div style={{ 
            padding: '14px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '8px',
            whiteSpace: 'pre-line',
            lineHeight: '1.7',
            fontSize: '14px',
            color: '#334155',
            border: '1px solid #cbd5e1'
          }}>
            {report.description || '상세 설명 없음'}
          </div>
        </div>

        {/* 신고 사진 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            사진 로딩 중...
          </div>
        ) : images.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1e293b', fontSize: '15px' }}>
              📷 첨부 사진 ({images.length}장)
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '14px' 
            }}>
              {images.map(img => (
                <div 
                  key={img.id} 
                  style={{ 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    border: '2px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onClick={() => window.open(`http://localhost:8500/static/danger_zone_images/${img.image_name}`, '_blank')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img 
                    src={`http://localhost:8500/static/danger_zone_images/${img.image_name}`}
                    alt={`신고 사진 ${img.id}`}
                    style={{ 
                      width: '100%', 
                      height: '180px', 
                      objectFit: 'cover' 
                    }}
                  />
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8fafc', 
                    fontSize: '11px', 
                    color: '#64748b',
                    textAlign: 'center'
                  }}>
                    {new Date(img.uploaded_at).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '24px', 
            textAlign: 'center', 
            color: '#94a3b8',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            첨부된 사진이 없습니다.
          </div>
        )}

        {/* 버튼 */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={onClose}
            disabled={processing}
            style={{
              padding: '12px 24px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#475569',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            취소
          </button>
          <button
            onClick={handleReject}
            disabled={processing}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: processing ? '#ccc' : '#64748b',
              color: 'white',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {processing ? '처리중...' : '반려'}
          </button>
          <button
            onClick={handleApprove}
            disabled={processing}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: processing ? '#ccc' : '#16a34a',
              color: 'white',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {processing ? '처리중...' : '✅ 승인'}
          </button>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '14px', 
          backgroundColor: '#fffbeb', 
          borderRadius: '8px', 
          fontSize: '13px', 
          color: '#92400e',
          border: '1px solid #fde047'
        }}>
          💡 <strong>안내:</strong> 승인 시 해당 구역이 빨간색 위험 구역으로 전환되어 모든 근로자에게 표시됩니다.
        </div>
      </div>
    </div>
  );
}

// 위험 유형 한글 라벨
function getRiskTypeLabel(riskType) {
  const labels = {
    'FALL': '낙하물 위험',
    'HEAVY_EQUIPMENT': '중장비 작업',
    'FIRE': '화재 위험',
    'ELECTRIC': '감전 위험',
    'COLLAPSE': '붕괴 위험',
    'ETC': '기타 위험',
    'CAUTION': '주의 구역'
  };
  return labels[riskType] || riskType || '위험 구역';
}

export default DangerReportApprovalModal;
