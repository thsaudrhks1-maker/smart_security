from fastapi import APIRouter, HTTPException, Depends
from back.safety.schema import ZoneRead, ZoneCreate, ZoneUpdate, DailyDangerZoneCreate, DailyDangerZoneRead
from back.safety.service import SafetyService
from typing import List, Optional

router = APIRouter(prefix="/safety", tags=["safety"])

@router.get("/zones", response_model=List[ZoneRead])
async def get_zones(site_id: int = None):
    """구역 목록 조회 (site_id 있으면 해당 현장만)"""
    return await SafetyService.get_zones(site_id)

@router.post("/zones", response_model=ZoneRead, status_code=201)
async def create_zone(zone: ZoneCreate):
    """구역(Zone) 생성"""
    return await SafetyService.create_zone(zone)

@router.put("/zones/{zone_id}", response_model=ZoneRead)
async def update_zone(zone_id: int, body: ZoneUpdate):
    """구역 수정"""
    zone = await SafetyService.update_zone(zone_id, body)
    if not zone:
        raise HTTPException(status_code=404, detail="구역을 찾을 수 없습니다.")
    return zone

@router.get("/daily-danger-zones", response_model=List[DailyDangerZoneRead])
async def get_daily_danger_zones(date: str, zone_id: Optional[int] = None):
    """일일 변동 위험 구역 목록 조회"""
    rows = await SafetyService.get_daily_danger_zones(date, zone_id)
    return [
        DailyDangerZoneRead(
            id=r["id"], 
            zone_id=r["zone_id"], 
            date=str(r["date"]), 
            risk_type=r["risk_type"], 
            description=r["description"]
        ) for r in rows
    ]

@router.post("/daily-danger-zones", response_model=DailyDangerZoneRead, status_code=201)
async def create_daily_danger_zone(body: DailyDangerZoneCreate):
    """일일 변동 위험 구역 등록"""
    r = await SafetyService.create_daily_danger_zone(body)
    return DailyDangerZoneRead(
        id=r["id"],
        zone_id=r["zone_id"],
        date=str(r["date"]),
        risk_type=r["risk_type"],
        description=r["description"]
    )

@router.delete("/daily-danger-zones/{danger_zone_id}", status_code=204)
async def delete_daily_danger_zone(danger_zone_id: int):
    """일일 변동 위험 구역 삭제"""
    success = await SafetyService.delete_daily_danger_zone(danger_zone_id)
    if not success:
        raise HTTPException(status_code=404, detail="해당 위험 구역을 찾을 수 없습니다.")
    return None
