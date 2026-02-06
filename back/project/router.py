
from fastapi import APIRouter, HTTPException
from back.project.repository import project_repository
from back.project.locations.map_router import router as map_router

router = APIRouter()

# 맵 하위 기능 연결
router.include_router(map_router, prefix="/map", tags=["Project Map"])

@router.get("/")
async def list_projects():
    return await project_repository.get_all_projects()

@router.get("/{project_id}/sites")
async def list_sites(project_id: int):
    return await project_repository.get_project_sites(project_id)

@router.get("/sites/{site_id}/zones")
async def list_zones(site_id: int):
    return await project_repository.get_site_zones(site_id)
