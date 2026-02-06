import React from 'react';
import { Outlet } from 'react-router-dom';
import NavSidebar from '@/features/admin/components/common/NavSidebar';

/**
 * ê´€ë¦¬ì???ˆì´?„ì›ƒ (?°ìŠ¤?¬íƒ‘)
 * - ?”ì´???Œë§ˆ
 * - ?“ì? ?ˆì´?„ì›ƒ (ìµœë? 1400px)
 * - ?˜ë‹¨ ?¤ë¹„ê²Œì´??
 */
const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', overflow: 'hidden' }}>
      {/* 1. ì¢Œì¸¡ ?¬ì´?œë°” */}
      <div style={{ height: '100vh', overflowY: 'auto' }}>
        <NavSidebar />
      </div>

      {/* 2. ë©”ì¸ ì½˜í…ì¸??ì—­ */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
