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
    
    # 1. 해당 날짜에 작업 계획이 있거나 실제 출결 기록이 있는 작업자 조회 (날짜별 관리)
    # 1. 대상 작업자 및 오늘 작업 계획 포함 여부 조회
    sql_workers = """
        SELECT 
            u.id as user_id,
            u.full_name,
            u.phone,
            u.job_title as position,
            c.name as company_name,
            c.trade_type,
            EXISTS (
                SELECT 1 FROM daily_worker_users dwu
                JOIN daily_work_plans dwp ON dwu.plan_id = dwp.id
                WHERE dwu.worker_id = u.id AND dwp.project_id = :pid AND dwp.date = :d
            ) as is_planned
        FROM sys_users u
        JOIN project_users pu ON u.id = pu.user_id
        LEFT JOIN sys_companies c ON u.company_id = c.id
        WHERE pu.project_id = :pid AND pu.status = 'ACTIVE'
    """
    workers = await fetch_all(sql_workers, {"pid": project_id, "d": target_date})
    
    # 2. 각 작업자의 출퇴근 기록 조회
    sql_attendance = """
        SELECT user_id, check_in_time, check_out_time, status
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
    
    # 4. 데이터 병합 및 정렬 로직
    result = []
    for worker in workers:
        uid = worker['user_id']
        att = attendance_map.get(uid, {})
        safety_checked = safety_map.get(uid, 0) > 0
        
        # 정렬 점수 계산 (출근 중: 3, 퇴근: 2, 미출근: 1)
        sort_score = 1
        if att.get('check_in_time'):
            sort_score = 3 if not att.get('check_out_time') else 2
        
        result.append({
            "user_id": uid,
            "full_name": worker['full_name'],
            "phone": worker['phone'],
            "position": worker['position'],
            "company_name": worker['company_name'],
            "trade_type": worker['trade_type'],
            "is_planned": worker['is_planned'],
            "check_in_time": att.get('check_in_time'),
            "check_out_time": att.get('check_out_time'),
            "safety_checked": safety_checked,
            "sort_score": sort_score
        })
    
    # 정렬: 1순위 상태(점수), 2순위 업체명, 3순위 이름
    result.sort(key=lambda x: (-x['sort_score'], x['company_name'], x['full_name']))
    
    return {"success": True, "data": result}

