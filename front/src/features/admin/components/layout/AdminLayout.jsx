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
    <div className="app-container" style={{ display: 'block' }}>
      <div className="app-content" style={{ 
        marginLeft: 0, 
        paddingBottom: '80px', 
        minHeight: '100vh', 
        background: '#f8fafc' 
      }}>
        <Outlet />
      </div>
      <NavSidebar />
    </div>
  );
};

export default AdminLayout;
