
from fastapi import APIRouter
from back.content.work_info.service import work_info_service

router = APIRouter()

@router.get("/")
async def list_work_info():
    return await work_info_service.get_work_info_list()
