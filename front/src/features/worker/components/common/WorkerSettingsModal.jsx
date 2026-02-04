import React from 'react';
import { X } from 'lucide-react';

/**
 * 근로자 홈 화면 환경설정 모달
 * - 홈에 작업 현장 지도 표시 on/off
 * - 지도 기본 펼침 on/off
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>환경설정</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#1e293b' }}
          >
            <X size={22} />
          </button>
        </div>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <div style={labelStyle}>홈 화면에 작업 현장 지도 표시</div>
          <input
            type="checkbox"
            checked={showMapOnHome}
            onChange={(e) => onShowMapOnHomeChange(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          <div style={labelStyle}>지도 기본 펼침</div>
          <input
            type="checkbox"
            checked={mapExpandedByDefault}
            onChange={(e) => onMapExpandedByDefaultChange(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <div style={hintStyle}>
            지도 표시를 끄면 홈에는 카드만 보이고, '지도 보기' 버튼으로 다시 켤 수 있습니다.
          </div>
        </label>
      </div>
    </div>
  );
};

export default WorkerSettingsModal;
