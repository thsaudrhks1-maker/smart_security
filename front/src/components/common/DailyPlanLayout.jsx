import React from 'react';

/**
 * 반응형 일일 작업 계획 레이아웃
 * 데스크톱/모바일에서 좌측 패널 비율 및 지도 크기 조절 가능
 */
const DailyPlanLayout = ({ 
    header, 
    sidePanel, 
    mapView, 
    rightPanel, 
    layoutConfig = {} 
}) => {
    const {
        // 데스크톱 그리드 비율 (기본: 250px 2fr 1.2fr)
        sidePanelWidth = '250px',
        mapViewRatio = '2fr',
        rightPanelRatio = '1.2fr',
        
        // 모바일 레이아웃 모드 (stack, tabs 등)
        mobileMode = 'stack',
        
        // 간격
        gap = '1.5rem',
        
        // 패딩
        padding = '2rem',
        
        // 모바일 breakpoint
        mobileBreakpoint = 768
    } = layoutConfig;

    // 미디어 쿼리 스타일
    const containerStyle = {
        padding,
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        color: '#1e293b',
        background: '#f8fafc'
    };

    const mainGridStyle = {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `${sidePanelWidth} ${mapViewRatio} ${rightPanelRatio}`,
        gap,
        minHeight: 0
    };

    return (
        <div style={containerStyle}>
            {/* 헤더 */}
            {header}

            {/* 메인 그리드 */}
            <div style={mainGridStyle} className="daily-plan-grid">
                {/* 좌측 패널 (층별 선택) */}
                <div style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '24px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
                }}>
                    {sidePanel}
                </div>

                {/* 중앙 지도 뷰 */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '24px', 
                    border: '1px solid #e2e8f0', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                }}>
                    {mapView}
                </div>

                {/* 우측 패널 (작업 목록, 위험 구역) */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem', 
                    minHeight: 0 
                }}>
                    {rightPanel}
                </div>
            </div>

            {/* 반응형 CSS */}
            <style>{`
                @media (max-width: ${mobileBreakpoint}px) {
                    .daily-plan-grid {
                        grid-template-columns: 1fr !important;
                        grid-template-rows: auto auto 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default DailyPlanLayout;
