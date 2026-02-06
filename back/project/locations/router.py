
from fastapi import APIRouter
from back.project.locations.service import locations_service

router = APIRouter()

@router.get("/{project_id}/sites")
async def list_sites(project_id: int):
    return await locations_service.get_project_layout(project_id)
