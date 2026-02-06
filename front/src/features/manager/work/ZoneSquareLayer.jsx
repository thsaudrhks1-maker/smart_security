import React from 'react';
import { Polygon, Popup, Tooltip } from 'react-leaflet';

/**
 * 좌표�?기�??�로 ?�사각형 구역 컴포?�트.
 * ?�드?� ?�일 기�?: step=0.00025 균일 그리?? 2*HALF < step ??HALF=0.00012 (칸이 붙어 보이??겹치지 ?�음)
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
 * ?�일 구역 ?�사각형 (Polygon). fillColor/fillOpacity�??�업·?�험·�?구역 구분.
 * ?�업/?�험 ?�으�??�색 반투명으�??�시.
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
 * pathOptions�??�겨??구역 ?�각??그리�?(?�일 ?�업 계획 ?�에???�상 ?�적 지?�용).
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
