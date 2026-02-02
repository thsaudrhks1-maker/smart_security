import React from 'react';
import { Outlet } from 'react-router-dom';
import NavSidebar from '../common/NavSidebar';
import '../../features/dashboard/Dashboard.css'; // 전역 레이아웃 스타일

const MainLayout = () => {
    return (
        <div className="app-container" style={{ display: 'block' }}>
            {/* 페이지 콘텐츠 영역 */}
            <div className="app-content" style={{ marginLeft: 0, paddingBottom: '80px', minHeight: '100vh', background: '#f8fafc' }}>
                <Outlet />
            </div>

            {/* 하단 고정 네비게이션 */}
            <NavSidebar />
        </div>
    );
};

export default MainLayout;
