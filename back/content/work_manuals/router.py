
from fastapi import APIRouter
from back.content.work_manuals.service import work_manuals_service

router = APIRouter()

@router.get("/")
async def list_manuals():
    return await work_manuals_service.get_manual_list()
