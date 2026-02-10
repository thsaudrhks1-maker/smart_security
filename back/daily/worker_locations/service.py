
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, Tuple
from sqlalchemy import text
from back.project.locations.model import project_zones
from back.device.beacons.model import device_beacons
from back.daily.worker_locations.model import daily_worker_locations

async def calculate_current_zone(db: AsyncSession, lat: Optional[float], lng: Optional[float]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
    """
    [Geofencing] GPS 좌표가 어떤 Zone(구역)에 포함되는지 계산.
    현재는 project_zones에 절대 좌표가 없으므로 추후 구현 예정.
    """
    if lat is None or lng is None:
        return None, None, "UNKNOWN"

        
    # # 실제로는 PostGIS 같은 공간 DB를 써야 하지만, 여기서는 단순 사각형(MBR) 포함 여부로 간단히 구현
    # # 가정: project_zones 테이블에 lat_min, lat_max, lng_min, lng_max 컬럼이 있다고 가정하거나,
    # #       points(JSON) 필드를 파싱해야 함.
    # #       현재는 'points' 필드(JSON)에 [[lat, lng], ...] 형태로 저장되어 있다고 가정.
    
    # query = select(project_zones).where(project_zones.is_active == True)
    # result = await db.execute(query)
    # zones = result.scalars().all()

    # for zone in zones:
    #     # JSON 포인트 데이터 파싱 (예: "[[37.1, 127.1], [37.2, 127.2], ...]")
    #     # 실제 구현에선 points 데이터 구조에 따라 파싱 로직 필요
    #     # 여기서는 임시로 '가장 단순한 거리 계산'으로 근접 Zone 찾기 (반경 20m 이내)
    #     # (Zone의 중심점 center_lat, center_lng가 있다고 가정하거나, points의 첫 번째 점 사용)
        
    #     if not zone.points:
    #         continue
            
    #     try:
    #         # Points가 문자열이면 JSON 파싱, 리스트면 그대로 사용
    #         import json
    #         points = json.loads(zone.points) if isinstance(zone.points, str) else zone.points
            
    #         if not points or len(points) < 1:
    #             continue

    #         # 임시: 첫 번째 점(기준점)과의 거리 계산 (유클리드 거리 근사치)
    #         # 0.0001도 약 11m (위도 기준)
    #         # 반경 0.0002도 (약 20m) 이내면 진입으로 간주
    #         center_lat, center_lng = points[0][0], points[0][1]
            
    #         if abs(lat - center_lat) < 0.0002 and abs(lng - center_lng) < 0.0002:
    #             # 위험 구역인지 확인 (daily_danger_zones 테이블 조회 필요하지만 일단 Zone 속성으로 판단)
    #             return zone.id, zone.name, "WARNING" if "위험" in zone.name else "SAFE"
                
    #     except Exception as e:
    #         print(f"[Zone Check Error] {e}")
    #         continue

    # TODO: 추후 project_zones의 lat/lng가 채워지거나, project_master 기준 상대좌표 계산 로직 구현 필요
    # 현재는 안전하게 None 리턴 (Zone 매핑 없음)
    return None, None, "SAFE"

async def create_worker_location(db: AsyncSession, location_data):
    """위치 정보 저장"""
    
    # 1. Zone 판별 (추후 로직 활성화 시 사용)
    mapped_zone_id = None
    alert_level = "SAFE"
    zone_name = None
    
    if location_data.tracking_mode == "GPS":
        mapped_zone_id, zone_name, alert_level = await calculate_current_zone(db, location_data.lat, location_data.lng)
    
    # 2. DB 저장
    new_log = daily_worker_locations(
        worker_id=location_data.worker_id,
        tracking_mode=location_data.tracking_mode,
        lat=location_data.lat,
        lng=location_data.lng,
        beacon_id=location_data.beacon_id,
        rssi=location_data.rssi,
        distance=location_data.distance,
        zone_id=mapped_zone_id # 판별된 구역
    )
    
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    
    return {
        "success": True,
        "data_id": new_log.id,
        "matched_zone_id": mapped_zone_id,
        "matched_zone_name": zone_name,
        "alert_level": alert_level,
        "message": f"위치 저장 완료 (Zone: {zone_name})" if zone_name else "위치 저장 완료 (Zone 미감지)"
    }
