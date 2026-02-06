
from fastapi import APIRouter
from back.project.master.service import master_service

router = APIRouter()

@router.get("/")
async def list_projects():
    return await master_service.list_all()
