
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavSidebar from '@/features/admin/components/common/NavSidebar';

/**
 * [ADMIN] 관리자 통합 레이아웃 (데스크탑 최적화)
 * - 라이트 테마 기반 고대비 디자인
 * - 반응형 레이아웃 (최대 1400px 가로폭 권장)
 * - 좌측 고정 네비게이션 적용
 */
const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* 1. 좌측 통합 네비게이션 사이드바 */}
      <div style={{ height: '100vh', zIndex: 10 }}>
        <NavSidebar />
      </div>

      {/* 2. 메인 컨텐츠 영역 */}
      <main style={{ 
        flex: 1, 
        height: '100vh', 
        overflowY: 'auto', 
        minWidth: 0,
        padding: '0 1rem'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
