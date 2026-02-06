
from fastapi import APIRouter
from back.content.danger_info.repository import danger_info_repository

router = APIRouter()

@router.get("/")
async def list_danger_info():
    """위험 요소 정보 목록 조회"""
    data = await danger_info_repository.get_all()
    return {"success": True, "data": data}

@router.post("/")
async def create_danger_info(data: dict):
    """새로운 위험 요소 정보 생성"""
    result = await danger_info_repository.create(data)
    return {"success": True, "data": result}
