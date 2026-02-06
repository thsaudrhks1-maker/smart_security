from fastapi import APIRouter, HTTPException
from back.daily.attendance.service import attendance_service
from typing import List, Optional

router = APIRouter()

@router.get("")
async def list_attendance(project_id: int):
    data = await attendance_service.get_today_list(project_id)
    return {"success": True, "data": data}

@router.get("/me")
async def get_my_attendance(user_id: Optional[int] = None): 
    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    try:
        data = await attendance_service.get_my_status(user_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-in")
async def check_in(data: dict):
    # data: { user_id, project_id }
    uid = data.get("user_id")
    pid = data.get("project_id")
    
    if not uid or not pid:
        raise HTTPException(status_code=400, detail="user_id and project_id are required")
        
    try:
        await attendance_service.do_check_in(uid, pid)
        return {"success": True, "message": "출근 처리되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


