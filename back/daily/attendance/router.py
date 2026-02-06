
from fastapi import APIRouter
from back.daily.attendance.service import attendance_service
from typing import List

router = APIRouter()

@router.get("/")
async def list_attendance(project_id: int):
    return await attendance_service.get_today_list(project_id)
