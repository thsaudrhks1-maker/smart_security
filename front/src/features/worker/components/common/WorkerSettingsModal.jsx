import React from 'react';
import SimpleModal from './SimpleModal';

/**
 * 작업자 앱 환경설정 모달 (홈 지도 표시/기본 펼침).
 * 상위에서 상태와 저장 로직을 넘기면 됨.
 */
const WorkerSettingsModal = ({
  isOpen,
  onClose,
  showMapOnHome,
  mapExpandedByDefault,
  onShowMapOnHomeChange,
  onMapExpandedByDefaultChange,
}) => {
  return (
    <SimpleModal isOpen={isOpen} onClose={onClose} title="⚙️ 환경설정">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.95rem', color: '#1e293b' }}>
          <span style={{ color: '#1e293b', fontWeight: '500' }}>홈 화면에 작업 현장 지도 표시</span>
          <input
            type="checkbox"
            checked={showMapOnHome}
            onChange={(e) => onShowMapOnHomeChange?.(e.target.checked)}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.95rem', color: '#1e293b' }}>
          <span style={{ color: '#1e293b', fontWeight: '500' }}>지도 기본 펼침</span>
          <input
            type="checkbox"
            checked={mapExpandedByDefault}
            onChange={(e) => onMapExpandedByDefaultChange?.(e.target.checked)}
          />
        </label>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
          지도 표시를 끄면 홈에는 카드만 보이고, "지도 보기" 버튼으로 다시 켤 수 있습니다.
        </p>
      </div>
    </SimpleModal>
  );
};

export default WorkerSettingsModal;
