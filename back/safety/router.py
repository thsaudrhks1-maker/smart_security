from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from back.database import get_db
from back.safety.model import Zone
from back.safety.schema import ZoneRead

router = APIRouter(tags=["safety"])

@router.get("/safety/zones", response_model=list[ZoneRead])
async def get_zones(site_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(Zone)
    if site_id:
        query = query.where(Zone.site_id == site_id)
        
    result = await db.execute(query)
    return result.scalars().all()
