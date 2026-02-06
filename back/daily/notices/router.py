
from fastapi import APIRouter, HTTPException
from back.daily.notices.repository import notices_repository
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class NoticeCreate(BaseModel):
    project_id: int
    title: str
    content: str
    is_important: Optional[bool] = False
    created_by: Optional[int] = None

@router.get("/")
async def list_notices():
    return await notices_repository.get_all_notices()

@router.post("/")
async def create_notice(req: NoticeCreate):
    return await notices_repository.create_notice(req.model_dump())
