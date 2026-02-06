
import React from 'react';
import { Rectangle, Tooltip, Popup } from 'react-leaflet';

/**
 * [MANAGER/WORKER] 현장 구역(Zone) 맵 레이어
 * 구역의 상태(작업 유무, 위험도)에 따라 색상을 달리하여 표시합니다.
 */
const ZoneSquareLayer = ({ zone, hasWork, hasDanger, onClick }) => {
    // 좌표 보정 (그리드 크기에 맞춤)
    const pos = [Number(zone.lat), Number(zone.lng)];
    const offset = 0.000025;
    const bounds = [
        [pos[0] - offset, pos[1] - offset],
        [pos[0] + offset, pos[1] + offset]
    ];

    let color = '#94a3b8'; // 기본색 (회색)
    let fillOpacity = 0.1;

    if (hasWork) {
        color = '#3b82f6'; // 작업 중 (파란색)
        fillOpacity = 0.3;
    }
    if (hasDanger) {
        color = '#ef4444'; // 위험 (빨간색)
        fillOpacity = 0.5;
    }

    return (
        <Rectangle
            bounds={bounds}
            pathOptions={{ color: color, weight: 1, fillOpacity: fillOpacity }}
            eventHandlers={{ click: () => onClick && onClick(zone) }}
        >
            <Tooltip permanent direction="center" opacity={0.7} className="zone-label-tooltip">
                <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: color }}>{zone.name}</span>
            </Tooltip>
            <Popup>
                <div style={{ padding: '5px' }}>
                    <strong>{zone.name} ({zone.level})</strong><br/>
                    상태: {hasDanger ? '위험 관리 중' : (hasWork ? '내부 작업 중' : '정상')}
                </div>
            </Popup>
        </Rectangle>
    );
};

export default ZoneSquareLayer;
