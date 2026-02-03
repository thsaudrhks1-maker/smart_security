import React from 'react';
import { Outlet } from 'react-router-dom';
import NavSidebar from '../common/NavSidebar';

/**
 * 관리자용 레이아웃 (데스크탑)
 * - 화이트 테마
 * - 넓은 레이아웃 (최대 1400px)
 * - 하단 네비게이션
 */
const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', overflow: 'hidden' }}>
      {/* 1. 좌측 사이드바 */}
      <div style={{ height: '100vh', overflowY: 'auto' }}>
        <NavSidebar />
      </div>

      {/* 2. 메인 콘텐츠 영역 */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
