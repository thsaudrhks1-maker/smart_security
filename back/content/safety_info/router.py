
from fastapi import APIRouter, HTTPException
from typing import Optional
from back.content.safety_info.service import safety_info_service
from back.content.safety_info.repository import safety_info_repo

router = APIRouter()

@router.get("/")
async def list_safety_info(category: Optional[str] = None):
    data = await safety_info_repo.get_all(category)
    return {"success": True, "data": data}

@router.post("/sync-kosha")
async def sync_kosha(page: int = 1, rows: int = 10):
    """
    [Admin] KOSHA 데이터를 실시간으로 동기화합니다.
    """
    try:
        results = await safety_info_service.sync_with_kosha(page, rows)
        return {"success": True, "count": len(results), "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
