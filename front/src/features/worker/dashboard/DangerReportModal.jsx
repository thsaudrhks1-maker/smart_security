import React, { useState } from 'react';
import apiClient from '../../../api/client';

/**
 * ê·¼ë¡œ???„í—˜ ? ê³  ëª¨ë‹¬
 * - Zone ?´ë¦­ ???„í—˜ ?”ì†Œ ? ê³ 
 * - ?¬ì§„ ?…ë¡œ??ì§€?? */
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
      // 1. ? ê³  ?ì„±
      const reportData = {
        zone_id: zone.id,
        risk_type: riskType,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      };

      const reportRes = await apiClient.post('/safety/reports', reportData);
      const reportId = reportRes.data.id;

      // 2. ?¬ì§„ ?…ë¡œ??(?¬ëŸ¬ ??
      for (const image of images) {
        const formData = new FormData();
        formData.append('file', image);
        await apiClient.post(`/safety/reports/${reportId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('? ê³ ê°€ ?‘ìˆ˜?˜ì—ˆ?µë‹ˆ?? ê´€ë¦¬ì ?¹ì¸ ???„í—˜ êµ¬ì—­?¼ë¡œ ?œì‹œ?©ë‹ˆ??');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('? ê³  ?¤íŒ¨:', error);
      alert('? ê³  ì²˜ë¦¬ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
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
        <h2 style={{ margin: '0 0 20px 0', color: '#d32f2f' }}>? ï¸ ?„í—˜ ?”ì†Œ ? ê³ </h2>
        
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
          <strong>? ê³  êµ¬ì—­:</strong> {zone?.level} {zone?.name}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ?„í—˜ ? í˜• */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              ?„í—˜ ? í˜• <span style={{ color: 'red' }}>*</span>
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
              <option value="FALL">?™í•˜ë¬??„í—˜</option>
              <option value="HEAVY_EQUIPMENT">ì¤‘ì¥ë¹??‘ì—…</option>
              <option value="FIRE">?”ì¬ ?„í—˜</option>
              <option value="ELECTRIC">ê°ì „ ?„í—˜</option>
              <option value="COLLAPSE">ë¶•ê´´ ?„í—˜</option>
              <option value="ETC">ê¸°í?</option>
            </select>
          </div>

          {/* ?ì„¸ ?¤ëª… */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              ?ì„¸ ?¤ëª… <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="?„í—˜ ?”ì†Œë¥??ì„¸???¤ëª…?´ì£¼?¸ìš” (?? ì²œì¥ ë§ˆê°?¬ê? ê³ ì •?˜ì? ?Šì•„ ?™í•˜ ?„í—˜)"
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

          {/* ?¬ì§„ ?…ë¡œ??*/}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              ?¬ì§„ ì²¨ë? (ìµœë? 5??
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
                {images.length}ê°??Œì¼ ? íƒ??              </div>
            )}
          </div>

          {/* ë²„íŠ¼ */}
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
              ì·¨ì†Œ
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
              {loading ? 'ì²˜ë¦¬ì¤?..' : '? ê³  ?‘ìˆ˜'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
          ?’¡ <strong>?ˆë‚´:</strong> ? ê³  ?‘ìˆ˜ ??ê´€ë¦¬ì ?¹ì¸???„ìš”?©ë‹ˆ?? ?¹ì¸ ???´ë‹¹ êµ¬ì—­??ì£¼í™©???Œë‘ë¦¬ë¡œ ?œì‹œ?©ë‹ˆ??
        </div>
      </div>
    </div>
  );
}

export default DangerReportModal;
