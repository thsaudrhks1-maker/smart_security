import React from 'react';
import { X } from 'lucide-react';

/**
 * ê·¼ë¡œ?????”ë©´ ?˜ê²½?¤ì • ëª¨ë‹¬
 * - ?ˆì— ?‘ì—… ?„ì¥ ì§€???œì‹œ on/off
 * - ì§€??ê¸°ë³¸ ?¼ì¹¨ on/off
 */
const WorkerSettingsModal = ({
  isOpen,
  onClose,
  showMapOnHome,
  mapExpandedByDefault,
  onShowMapOnHomeChange,
  onMapExpandedByDefaultChange,
}) => {
  if (!isOpen) return null;

  const labelStyle = { fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px' };
  const hintStyle = { fontSize: '0.8rem', color: '#64748b', marginTop: '4px' };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '400px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>?˜ê²½?¤ì •</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#1e293b' }}
          >
            <X size={22} />
          </button>
        </div>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <div style={labelStyle}>???”ë©´???‘ì—… ?„ì¥ ì§€???œì‹œ</div>
          <input
            type="checkbox"
            checked={showMapOnHome}
            onChange={(e) => onShowMapOnHomeChange(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          <div style={labelStyle}>ì§€??ê¸°ë³¸ ?¼ì¹¨</div>
          <input
            type="checkbox"
            checked={mapExpandedByDefault}
            onChange={(e) => onMapExpandedByDefaultChange(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <div style={hintStyle}>
            ì§€???œì‹œë¥??„ë©´ ?ˆì—??ì¹´ë“œë§?ë³´ì´ê³? 'ì§€??ë³´ê¸°' ë²„íŠ¼?¼ë¡œ ?¤ì‹œ ì¼????ˆìŠµ?ˆë‹¤.
          </div>
        </label>
      </div>
    </div>
  );
};

export default WorkerSettingsModal;
