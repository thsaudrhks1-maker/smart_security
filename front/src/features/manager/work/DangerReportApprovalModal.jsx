import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/client';

/**
 * ë§¤ë‹ˆ?€ ? ê³  ?¹ì¸ ëª¨ë‹¬
 * - ê·¼ë¡œ??? ê³  ?´ìš© ?•ì¸
 * - ?¬ì§„ ?•ì¸
 * - ?¹ì¸/ë°˜ë ¤ ì²˜ë¦¬
 */
function DangerReportApprovalModal({ open, onClose, report, onSuccess }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open || !report) {
      setImages([]);
      return;
    }

    // ?´ë‹¹ Zone??ëª¨ë“  PENDING ? ê³  ?¬ì§„ ê°€?¸ì˜¤ê¸?    const allPendingReports = report.allPendingReports || [report];
    console.log('?” [ë§¤ë‹ˆ?€ ëª¨ë‹¬] ëª¨ë“  PENDING ? ê³ :', allPendingReports);

    setLoading(true);
    
    // ëª¨ë“  ? ê³ ???¬ì§„??ë³‘ë ¬ë¡?ê°€?¸ì˜¤ê¸?    Promise.all(
      allPendingReports.map(r => {
        const reportId = r.id || r.danger_zone_id;
        console.log(`?” API ?¸ì¶œ: /safety/reports/${reportId}/images`);
        return apiClient.get(`/safety/reports/${reportId}/images`)
          .then(res => ({
            reportId: reportId,
            reportDesc: r.description,
            images: res.data || []
          }))
          .catch(err => {
            console.error(`???¬ì§„ ë¡œë“œ ?¤íŒ¨ (? ê³  ${reportId}):`, err);
            return { reportId: reportId, reportDesc: r.description, images: [] };
          });
      })
    )
    .then(results => {
      // ëª¨ë“  ? ê³ ???¬ì§„???˜ë‚˜??ë°°ì—´ë¡??µí•©
      const allImages = results.flatMap(r => 
        r.images.map(img => ({ ...img, reportId: r.reportId, reportDesc: r.reportDesc }))
      );
      console.log('???„ì²´ ?¬ì§„ ë¡œë“œ ?±ê³µ:', allImages);
      setImages(allImages);
    })
    .finally(() => setLoading(false));
  }, [open, report]);

  const handleApprove = async () => {
    const allReports = report.allPendingReports || [report];
    const reportCount = allReports.length;
    
    if (!window.confirm(
      `??êµ¬ì—­??${reportCount}ê°?? ê³ ë¥?ëª¨ë‘ ?¹ì¸?˜ì‹œê² ìŠµ?ˆê¹Œ?\n?¹ì¸ ???´ë‹¹ êµ¬ì—­??ë¹¨ê°„???„í—˜ êµ¬ì—­?¼ë¡œ ?œì‹œ?©ë‹ˆ??`
    )) {
      return;
    }

    setProcessing(true);
    try {
      // ëª¨ë“  ? ê³  ?¹ì¸
      await Promise.all(
        allReports.map(r => {
          const reportId = r.id || r.danger_zone_id;
          return apiClient.post(`/safety/reports/${reportId}/approve`);
        })
      );
      alert(`${reportCount}ê°?? ê³ ê°€ ?¹ì¸?˜ì—ˆ?µë‹ˆ??`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('?¹ì¸ ?¤íŒ¨:', error);
      alert('?¹ì¸ ì²˜ë¦¬ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const allReports = report.allPendingReports || [report];
    const reportCount = allReports.length;
    
    if (!window.confirm(
      `??êµ¬ì—­??${reportCount}ê°?? ê³ ë¥?ëª¨ë‘ ë°˜ë ¤?˜ì‹œê² ìŠµ?ˆê¹Œ?\në°˜ë ¤ ???„í—˜ êµ¬ì—­?ì„œ ?œì™¸?©ë‹ˆ??`
    )) {
      return;
    }

    setProcessing(true);
    try {
      // ëª¨ë“  ? ê³  ë°˜ë ¤
      await Promise.all(
        allReports.map(r => {
          const reportId = r.id || r.danger_zone_id;
          return apiClient.post(`/safety/reports/${reportId}/reject`);
        })
      );
      alert(`${reportCount}ê°?? ê³ ê°€ ë°˜ë ¤?˜ì—ˆ?µë‹ˆ??`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('ë°˜ë ¤ ?¤íŒ¨:', error);
      alert('ë°˜ë ¤ ì²˜ë¦¬ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
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
        {/* ?¤ë” */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f97316'
        }}>
          <h2 style={{ margin: 0, color: '#f97316', fontSize: '20px' }}>
            ?”” ê·¼ë¡œ???„í—˜ ? ê³  ê²€??          </h2>
          <span style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#fff7ed',
            color: '#f97316',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '2px solid #f97316'
          }}>
            ?¹ì¸ ?€ê¸?          </span>
        </div>

        {/* êµ¬ì—­ ?•ë³´ */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '16px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '10px',
          border: '2px solid #fbbf24'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#92400e' }}>
            ?“ ? ê³  ?„ì¹˜
          </div>
          <div style={{ fontSize: '15px', color: '#78350f' }}>
            {report.zoneName || `êµ¬ì—­ #${report.zone_id}`} ({report.zoneLevel || report.level || '-'})
          </div>
          {report.allPendingReports && report.allPendingReports.length > 1 && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              backgroundColor: '#fef9c3', 
              borderRadius: '6px',
              fontSize: '13px',
              color: '#713f12'
            }}>
              ? ï¸ ??êµ¬ì—­??{report.allPendingReports.length}ê°œì˜ ? ê³ ê°€ ?ˆìŠµ?ˆë‹¤
            </div>
          )}
        </div>

        {/* ?„í—˜ ? í˜• */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', fontSize: '15px' }}>
            ? ï¸ ?„í—˜ ? í˜•
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

        {/* ? ê³  ?´ìš© */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', fontSize: '15px' }}>
            ?“ ? ê³  ?´ìš©
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
            {report.description || '?ì„¸ ?¤ëª… ?†ìŒ'}
          </div>
        </div>

        {/* ? ê³  ?¬ì§„ */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            ?¬ì§„ ë¡œë”© ì¤?..
          </div>
        ) : images.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1e293b', fontSize: '15px' }}>
              ?“· ì²¨ë? ?¬ì§„ ({images.length}??
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '14px' 
            }}>
              {images.map(img => (
                <div 
                  key={`${img.reportId}_${img.id}`} 
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
                    alt={`? ê³  ?¬ì§„ ${img.id}`}
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
                    {img.reportDesc && (
                      <div style={{ 
                        marginTop: '4px', 
                        fontSize: '10px', 
                        color: '#94a3b8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {img.reportDesc}
                      </div>
                    )}
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
            ì²¨ë????¬ì§„???†ìŠµ?ˆë‹¤.
          </div>
        )}

        {/* ë²„íŠ¼ */}
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
            ì·¨ì†Œ
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
            {processing ? 'ì²˜ë¦¬ì¤?..' : 'ë°˜ë ¤'}
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
            {processing ? 'ì²˜ë¦¬ì¤?..' : '???¹ì¸'}
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
          ?’¡ <strong>?ˆë‚´:</strong> ?¹ì¸ ???´ë‹¹ êµ¬ì—­??ë¹¨ê°„???„í—˜ êµ¬ì—­?¼ë¡œ ?„í™˜?˜ì–´ ëª¨ë“  ê·¼ë¡œ?ì—ê²??œì‹œ?©ë‹ˆ??
        </div>
      </div>
    </div>
  );
}

// ?„í—˜ ? í˜• ?œê? ?¼ë²¨
function getRiskTypeLabel(riskType) {
  const labels = {
    'FALL': '?™í•˜ë¬??„í—˜',
    'HEAVY_EQUIPMENT': 'ì¤‘ì¥ë¹??‘ì—…',
    'FIRE': '?”ì¬ ?„í—˜',
    'ELECTRIC': 'ê°ì „ ?„í—˜',
    'COLLAPSE': 'ë¶•ê´´ ?„í—˜',
    'ETC': 'ê¸°í? ?„í—˜',
    'CAUTION': 'ì£¼ì˜ êµ¬ì—­'
  };
  return labels[riskType] || riskType || '?„í—˜ êµ¬ì—­';
}

export default DangerReportApprovalModal;
