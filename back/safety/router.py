from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from back.database import get_db
from back.safety.model import Zone
from back.safety.schema import ZoneRead, ZoneCreate

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
