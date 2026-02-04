from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional

from back.database import get_db
from back.safety.model import Zone, DailyDangerZone
from back.safety.schema import ZoneRead, ZoneCreate, ZoneUpdate, DailyDangerZoneCreate, DailyDangerZoneRead

router = APIRouter(tags=["safety"])


@router.get("/safety/zones", response_model=list[ZoneRead])
async def get_zones(site_id: int = None, db: AsyncSession = Depends(get_db)):
    """구역 목록 조회 (site_id 있으면 해당 현장만)"""
    query = select(Zone)
    if site_id:
        query = query.where(Zone.site_id == site_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/safety/zones", response_model=ZoneRead, status_code=201)
async def create_zone(zone: ZoneCreate, db: AsyncSession = Depends(get_db)):
    """도면 위에서 정의한 구역(Zone) DB 저장. 중간관리자가 작업 배치 시 이 구역을 선택함."""
    db_zone = Zone(
        site_id=zone.site_id,
        name=zone.name,
        level=zone.level,
        type=zone.type,
        lat=zone.lat,
        lng=zone.lng,
        default_hazards=zone.default_hazards,
    )
    db.add(db_zone)
    await db.commit()
    await db.refresh(db_zone)
    return db_zone


@router.put("/safety/zones/{zone_id}", response_model=ZoneRead)
async def update_zone(
    zone_id: int,
    body: ZoneUpdate,
    db: AsyncSession = Depends(get_db)
):
    """구역 수정 (작업 위치 탭에서 위도·경도, 층, 구역명, 타입, 특징 등)"""
    result = await db.execute(select(Zone).where(Zone.id == zone_id))
    zone = result.scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=404, detail="구역을 찾을 수 없습니다.")
    if body.name is not None:
        zone.name = body.name
    if body.level is not None:
        zone.level = body.level
    if body.type is not None:
        zone.type = body.type
    if body.lat is not None:
        zone.lat = body.lat
    if body.lng is not None:
        zone.lng = body.lng
    if body.default_hazards is not None:
        zone.default_hazards = body.default_hazards
    await db.commit()
    await db.refresh(zone)
    return zone


# --- 일일 변동 위험 구역 (그날 해당 구역의 위험 위치/설명 - 작업자에게 데일리 전달) ---
@router.get("/safety/daily-danger-zones", response_model=list[DailyDangerZoneRead])
async def get_daily_danger_zones(
    date: str,
    zone_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """날짜(필수), 구역(선택)별 일일 위험 구역 목록. 중간관리자가 등록한 '오늘의 위험' 조회."""
    plan_date = datetime.strptime(date, "%Y-%m-%d").date()
    query = select(DailyDangerZone).where(DailyDangerZone.date == plan_date)
    if zone_id is not None:
        query = query.where(DailyDangerZone.zone_id == zone_id)
    query = query.order_by(DailyDangerZone.zone_id, DailyDangerZone.id)
    result = await db.execute(query)
    rows = result.scalars().all()
    return [
        DailyDangerZoneRead(id=r.id, zone_id=r.zone_id, date=str(r.date), risk_type=r.risk_type, description=r.description)
        for r in rows
    ]


@router.post("/safety/daily-danger-zones", response_model=DailyDangerZoneRead, status_code=201)
async def create_daily_danger_zone(
    body: DailyDangerZoneCreate,
    db: AsyncSession = Depends(get_db)
):
    """일일 변동 위험 구역 등록. (예: 오늘 A구역 중장비 작업 중)"""
    try:
        plan_date = datetime.strptime(body.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")
    db_row = DailyDangerZone(
        zone_id=body.zone_id,
        date=plan_date,
        risk_type=body.risk_type,
        description=body.description.strip()
    )
    db.add(db_row)
    await db.commit()
    await db.refresh(db_row)
    return DailyDangerZoneRead(
        id=db_row.id,
        zone_id=db_row.zone_id,
        date=str(db_row.date),
        risk_type=db_row.risk_type,
        description=db_row.description
    )


@router.delete("/safety/daily-danger-zones/{danger_zone_id}", status_code=204)
async def delete_daily_danger_zone(
    danger_zone_id: int,
    db: AsyncSession = Depends(get_db)
):
    """일일 변동 위험 구역 삭제"""
    result = await db.execute(select(DailyDangerZone).where(DailyDangerZone.id == danger_zone_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="해당 위험 구역을 찾을 수 없습니다.")
    await db.delete(row)
    await db.commit()
    return None
