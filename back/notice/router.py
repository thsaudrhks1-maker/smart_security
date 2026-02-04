from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from back.database import get_db
from back.auth.dependencies import get_current_user
from back.auth.model import User
from back.notice.schema import NoticeCreate, NoticeUpdate, NoticeResponse
from back.notice.repository import NoticeRepository
from typing import List

router = APIRouter(prefix="/api/notices", tags=["Notices"])

@router.post("", response_model=NoticeResponse)
async def create_notice(
    req: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "safety_manager"]:
        raise HTTPException(status_code=403, detail="공지사항 작성 권한이 없습니다.")
    return await NoticeRepository.create(db, current_user.id, req)

@router.get("/project/{project_id}", response_model=list[NoticeResponse])
async def get_project_notices(
    project_id: int,
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await NoticeRepository.get_project_notices(db, project_id, limit)

@router.get("/{notice_id}", response_model=NoticeResponse)
async def get_notice(
    notice_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notice = await NoticeRepository.get_by_id(db, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="공지사항을 찾을 수 없습니다.")
    return notice

@router.patch("/{notice_id}", response_model=NoticeResponse)
async def update_notice(
    notice_id: int,
    req: NoticeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "safety_manager"]:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")
    return await NoticeRepository.update(db, notice_id, req)

@router.delete("/{notice_id}")
async def delete_notice(
    notice_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "safety_manager"]:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
    await NoticeRepository.delete(db, notice_id)
    return {"message": "deleted"}
