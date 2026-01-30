import React from 'react';
import { Outlet } from 'react-router-dom';
import NavSidebar from '../common/NavSidebar';
import '../../features/dashboard/Dashboard.css'; // 전역 레이아웃 스타일

const MainLayout = () => {
    return (
        <div className="app-container">
            {/* 고정 사이드바 */}
            <NavSidebar />
            
            {/* 페이지 콘텐츠 영역 */}
            <div className="app-content">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
