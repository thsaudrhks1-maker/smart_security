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

@router.get("/project-status")
async def get_project_worker_status(project_id: int, d: Optional[str] = None):
    """
    [MANAGER] 프로젝트 투입 인원의 출퇴근 및 안전점검 현황 조회
    - project_id: 프로젝트 ID
    - d: 날짜 (YYYY-MM-DD), 미지정 시 오늘
    """
    from datetime import date as dt_date
    from back.database import fetch_all
    
    target_date = dt_date.fromisoformat(d) if d else dt_date.today()
    
    # 1. 해당 프로젝트의 오늘 작업 계획에 배정된 모든 작업자 조회
    sql_workers = """
        SELECT DISTINCT 
            u.id as user_id,
            u.full_name,
            u.phone,
            c.name as company_name
        FROM daily_worker_users dwu
        JOIN daily_work_plans dwp ON dwu.plan_id = dwp.id
        JOIN sys_users u ON dwu.user_id = u.id
        LEFT JOIN sys_companies c ON u.company_id = c.id
        WHERE dwp.project_id = :pid AND dwp.date = :d
        ORDER BY u.full_name
    """
    workers = await fetch_all(sql_workers, {"pid": project_id, "d": target_date})
    
    # 2. 각 작업자의 출퇴근 기록 조회
    sql_attendance = """
        SELECT user_id, check_in_time, check_out_time
        FROM daily_attendance
        WHERE project_id = :pid AND date = :d
    """
    attendance_records = await fetch_all(sql_attendance, {"pid": project_id, "d": target_date})
    attendance_map = {r['user_id']: r for r in attendance_records}
    
    # 3. 각 작업자의 안전 점검 로그 조회
    sql_safety = """
        SELECT user_id, COUNT(*) as check_count
        FROM daily_safety_logs
        WHERE project_id = :pid AND cast(created_at as date) = :d
        GROUP BY user_id
    """
    safety_records = await fetch_all(sql_safety, {"pid": project_id, "d": target_date})
    safety_map = {r['user_id']: r['check_count'] for r in safety_records}
    
    # 4. 데이터 병합
    result = []
    for worker in workers:
        uid = worker['user_id']
        att = attendance_map.get(uid, {})
        safety_checked = safety_map.get(uid, 0) > 0
        
        result.append({
            "user_id": uid,
            "full_name": worker['full_name'],
            "phone": worker['phone'],
            "company_name": worker['company_name'],
            "check_in_time": att.get('check_in_time'),
            "check_out_time": att.get('check_out_time'),
            "safety_checked": safety_checked
        })
    
    return {"success": True, "data": result}

