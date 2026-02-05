import React from 'react';
import { Polygon, Popup, Tooltip } from 'react-leaflet';

/**
 * 좌표를 기준으로 정사각형 구역 컴포넌트.
 * 시드와 동일 기준: step=0.00025 균일 그리드. 2*HALF < step → HALF=0.00012 (칸이 붙어 보이되 겹치지 않음)
 */
const ZONE_SQUARE_HALF = 0.00012;

export function getZoneSquarePositions(lat, lng, halfDeg = ZONE_SQUARE_HALF) {
  const h = halfDeg;
  return [
    [lat - h, lng - h],
    [lat - h, lng + h],
    [lat + h, lng + h],
    [lat + h, lng - h],
  ];
}

/**
 * 단일 구역 정사각형 (Polygon). fillColor/fillOpacity로 작업·위험·빈 구역 구분.
 * 작업/위험 없으면 흰색 반투명으로 표시.
 */
export function ZoneSquare({ zone, fillColor = '#ffffff', fillOpacity = 0.55, strokeColor = 'rgba(0,0,0,0.4)', strokeWidth = 2, popupContent }) {
  if (zone.lat == null || zone.lng == null) return null;
  const positions = getZoneSquarePositions(Number(zone.lat), Number(zone.lng));

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        fillColor,
        fillOpacity,
        color: strokeColor,
        weight: strokeWidth,
      }}
    >
      {popupContent != null && <Popup>{popupContent}</Popup>}
    </Polygon>
  );
}

/**
 * pathOptions만 넘겨서 구역 사각형 그리기 (일일 작업 계획 등에서 색상 동적 지정용).
 */
export function ZoneSquareStyled({ zone, pathOptions = {}, popupContent, tooltipContent, tooltipOptions = {} }) {
  if (zone.lat == null || zone.lng == null) return null;
  const positions = getZoneSquarePositions(Number(zone.lat), Number(zone.lng));
  const defaultPath = {
    fillColor: '#ffffff',
    fillOpacity: 0.55,
    color: 'rgba(0,0,0,0.4)',
    weight: 2,
  };
  const merged = { ...defaultPath, ...pathOptions };

  return (
    <Polygon positions={positions} pathOptions={merged}>
      {popupContent != null && <Popup>{popupContent}</Popup>}
      {tooltipContent != null && (
        <Tooltip {...tooltipOptions}>
          {tooltipContent}
        </Tooltip>
      )}
    </Polygon>
  );
}

export { ZONE_SQUARE_HALF };
