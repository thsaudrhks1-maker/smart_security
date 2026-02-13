import React, { useState, useEffect } from 'react';
import { projectApi } from '@/api/projectApi';
import CommonMap from './CommonMap';

/**
 * [COMMON] SmartSiteMap - 프로젝트 설정 자동 연동형 지도 컴포넌트
 * @param {number} projectId - 프로젝트 ID (필수)
 * @param {Array} zones - 구역 상세 데이터 리스트
 * @param {Array} plans - 작업 계획 리스트
 * @param {Array} risks - 위험 요소 리스트
 * @param {Array|string} myZoneNames - 보라색으로 강조할 작업자 본인의 구역 이름들
 * @param {string} highlightLevel - 현재 표시할 층 (예: '1F')
 */
const SmartSiteMap = ({ 
    projectId, 
    zones = [], 
    plans = [], 
    risks = [], 
    myZoneNames = [],
    highlightLevel = '1F',
    onZoneClick,
    onMapClick,
    gridOnly = false,
    user = null,
    zoom = 19,
    ...props 
}) => {
    const [projectConfig, setProjectConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;
        
        const loadProjectConfig = async () => {
            try {
                // 프로젝트의 실제 위치와 격자(회전 포함) 설정을 서버에서 직접 가져옵니다.
                // 이로써 각 페이지에서 데이터 조립을 중복해서 할 필요가 없어집니다.
                const res = await projectApi.getProject(projectId);
                // 백엔드 API 응답 구조인 { success: true, data: { ...project } } 에 맞춰 수정
                const p = res.data?.data || res.data; 
                
                if (p && p.lat) {
                    setProjectConfig({
                        center: [p.lat || 37.5665, p.lng || 126.9780],
                        gridConfig: {
                            rows: parseInt(p.grid_rows) || 10,
                            cols: parseInt(p.grid_cols) || 10,
                            spacing: parseFloat(p.grid_spacing) || 10,
                            angle: parseFloat(p.grid_angle || 0)
                        }
                    });
                }
            } catch (err) {
                console.error("❌ SmartSiteMap 설정 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProjectConfig();
    }, [projectId]);

    if (loading) {
        return (
            <div style={{ 
                width: '100%', height: '100%', minHeight: '300px',
                background: 'rgba(15, 23, 42, 0.5)', borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', fontSize: '0.9rem', fontWeight: '800'
            }}>
                현장 지도 인프라 동기화 중...
            </div>
        );
    }

    if (!projectConfig) return <div>현장 정보를 불러올 수 없습니다.</div>;

    return (
        <CommonMap
            center={projectConfig.center}
            zoom={zoom}
            gridConfig={projectConfig.gridConfig}
            zones={zones}
            plans={plans}
            risks={risks}
            highlightLevel={highlightLevel}
            myZoneNames={myZoneNames}
            onZoneClick={onZoneClick}
            onMapClick={onMapClick}
            gridOnly={gridOnly}
            user={user}
            {...props}
        />
    );
};

export default SmartSiteMap;
