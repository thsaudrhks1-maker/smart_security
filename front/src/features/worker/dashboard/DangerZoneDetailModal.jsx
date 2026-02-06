import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/client';

/**
 * Danger zone detail modal: type, description, detected time, PENDING/APPROVED status.
 */
function DangerZoneDetailModal({ open, onClose, risk }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !risk?.danger_zone_id) {
      setImages([]);
      return;
    }

    setLoading(true);
    apiClient.get(`/safety/reports/${risk.danger_zone_id}/images`)
      .then(res => setImages(res.data || []))
      .catch(err => {
        console.error('이미지 로드 실패:', err);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, [open, risk]);

  if (!open || !risk) return null;

  const isPending = risk.status === 'PENDING';
  const statusColor = isPending ? '#f97316' : '#dc2626';
  const statusText = isPending ? '대기 중' : '승인 완료';

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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: statusColor }}>위험 구역 정보</h2>
          <span style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: isPending ? '#fff7ed' : '#fee2e2',
            color: statusColor,
            fontSize: '13px',
            fontWeight: 'bold'
          }}>
            {statusText}
          </span>
        </div>

        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: `2px solid ${statusColor}`
        }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
            구역 {risk.name || `구역 #${risk.zone_id}`}
          </div>
          {risk.level && (
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              등급 {risk.level}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
            위험 유형
          </div>
          <div style={{
            padding: '10px',
            backgroundColor: '#fef3c7',
            borderRadius: '6px',
            border: '1px solid #fbbf24',
            fontSize: '14px'
          }}>
            {getRiskTypeLabel(risk.risk_type || risk.level)}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
            상세 설명
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            fontSize: '14px',
            color: '#334155'
          }}>
            {risk.description || '상세 설명 없음'}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
            이미지 로드 중..
          </div>
        ) : images.length > 0 ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>
              첨부 이미지 ({images.length}장)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {images.map(img => (
                <div key={img.id} style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(`http://localhost:8500/static/danger_zone_images/${img.image_name}`, '_blank')}
                >
                  <img
                    src={`http://localhost:8500/static/danger_zone_images/${img.image_name}`}
                    alt={`위험 구역 이미지 ${img.id}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    padding: '6px',
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
            padding: '20px',
            textAlign: 'center',
            color: '#94a3b8',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            첨부된 이미지가 없습니다.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#64748b',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function getRiskTypeLabel(riskType) {
  const labels = {
    'FALL': '낙하 위험',
    'HEAVY_EQUIPMENT': '중장비 작업',
    'FIRE': '화재 위험',
    'ELECTRIC': '감전 위험',
    'COLLAPSE': '붕괴 위험',
    'ETC': '기타 위험',
    'CAUTION': '주의 구역'
  };
  return labels[riskType] || riskType || '위험 구역';
}

export default DangerZoneDetailModal;
