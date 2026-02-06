
from fastapi import APIRouter
from back.daily.repository import daily_repository
from datetime import date

router = APIRouter()

@router.get("/attendance")
async def get_attendance(project_id: int, d: date = date.today()):
    return await daily_repository.get_attendance(project_id, d)

@router.get("/tasks")
async def get_tasks(site_id: int, d: date = date.today()):
    return await daily_repository.get_tasks(site_id, d)

@router.get("/notices")
async def get_notices(project_id: int):
    return await daily_repository.get_notices(project_id)
