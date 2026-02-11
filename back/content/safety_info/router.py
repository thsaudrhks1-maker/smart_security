
from fastapi import APIRouter, HTTPException
from typing import Optional
from back.content.safety_info.service import safety_info_service
from back.content.safety_info.repository import safety_info_repo

router = APIRouter()

@router.get("/")
async def list_safety_info(category: Optional[str] = None):
    data = await safety_info_repo.get_all(category)
    return {"success": True, "data": data}


# KOSHA 동기화 엔드포인트는 제거됨 (CSI로 통합)

@router.get("/recommend")
async def recommend_safety(task: str):
    """
    [AI] 작업 내용 기반 유사 안전 정보 추천
    """
    try:
        recommendations = await safety_info_service.recommend_safety_info(task)
        return {"success": True, "data": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
