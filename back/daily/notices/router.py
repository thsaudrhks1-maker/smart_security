from fastapi import APIRouter, HTTPException
from back.daily.notices.repository import notices_repository
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class NoticeCreate(BaseModel):
    project_id: int
    title: str
    content: str
    notice_type: Optional[str] = "NORMAL" # NORMAL, IMPORTANT, EMERGENCY
    notice_role: Optional[str] = None      # ADMIN, MANAGER, PARTNER
    created_by: Optional[int] = None

@router.get("/")
async def list_notices(project_id: Optional[int] = None):
    return await notices_repository.get_all_notices(project_id)

@router.post("/")
async def create_notice(req: NoticeCreate):
    return await notices_repository.create_notice(req.model_dump())

@router.get("/latest-emergency/{project_id}")
async def get_latest_emergency(project_id: int):
    alert = await notices_repository.get_latest_emergency(project_id)
    return {"success": True, "data": alert}
