from back.safety.repository import SafetyRepository
from back.safety.schema import ZoneCreate, ZoneUpdate, DailyDangerZoneCreate
from datetime import datetime
from typing import List, Dict, Any

class SafetyService:
    @staticmethod
    async def get_zones(site_id: int = None):
        return await SafetyRepository.get_zones(site_id)

    @staticmethod
    async def create_zone(data: ZoneCreate):
        return await SafetyRepository.create_zone(data.dict())

    @staticmethod
    async def update_zone(zone_id: int, data: ZoneUpdate):
        update_data = data.dict(exclude_unset=True)
        return await SafetyRepository.update_zone(zone_id, update_data)

    @staticmethod
    async def get_daily_danger_zones(date_str: str, zone_id: int = None):
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        return await SafetyRepository.get_daily_danger_zones(target_date, zone_id)

    @staticmethod
    async def create_daily_danger_zone(data: DailyDangerZoneCreate):
        try:
            target_date = datetime.strptime(data.date, "%Y-%m-%d").date()
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")
            
        danger_data = {
            "zone_id": data.zone_id,
            "date": target_date,
            "risk_type": data.risk_type,
            "description": data.description.strip()
        }
        return await SafetyRepository.create_daily_danger_zone(danger_data)

    @staticmethod
    async def delete_daily_danger_zone(danger_zone_id: int):
        return await SafetyRepository.delete_daily_danger_zone(danger_zone_id)
