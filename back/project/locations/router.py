
from fastapi import APIRouter
from typing import Optional
from datetime import date
from back.project.locations.service import locations_service
from back.project.locations.repository import locations_repository

router = APIRouter()

@router.get("/{project_id}/sites")
async def list_sites(project_id: int):
    return await locations_service.get_project_layout(project_id)

@router.get("/{project_id}/zones/details")
async def get_zones_with_details(project_id: int, date: Optional[str] = None):
    """구역별 작업, 작업자, 위험요소 통합 조회"""
    from datetime import date as date_type
    target_date = date or str(date_type.today())
    zones = await locations_repository.get_zones_with_details(project_id, target_date)
    return {"success": True, "data": zones}
