
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import date
from back.daily.task_plans.service import task_plans_service
from back.daily.task_plans.repository import task_plans_repository
from back.daily.safety_logs.repository import safety_logs_repository

router = APIRouter()

@router.get("")
async def list_task_plans(project_id: int = 1, d: Optional[date] = None):
    # 오늘 날짜를 기본값으로 설정
    target_date = d or date.today()
    return await task_plans_service.get_plans_with_details(project_id, target_date)

@router.get("/zone/{zone_id}")
async def get_zone_detail(zone_id: int, d: Optional[date] = None):
    """특정 구역의 작업 계획 및 위험 구역 조회"""
    target_date = d or date.today()
    tasks = await task_plans_repository.get_by_zone(zone_id, target_date)
    dangers = await safety_logs_repository.get_hazards(zone_id, target_date)
    
    # 각 작업에 배정된 작업자 정보 추가
    for task in tasks:
        task['workers'] = await task_plans_repository.get_worker_users(task['id'])
    
    return {
        "success": True,
        "data": {
            "tasks": tasks,
            "dangers": dangers
        }
    }

@router.post("")
async def create_task_plan(data: dict):
    """작업 계획 생성"""
    task = await task_plans_repository.create_task(data)
    return {"success": True, "data": task}

@router.put("/{task_id}")
async def update_task_plan(task_id: int, data: dict):
    """작업 계획 수정"""
    await task_plans_repository.update_task(task_id, data)
    return {"success": True, "message": "수정되었습니다."}

@router.delete("/{task_id}")
async def delete_task_plan(task_id: int):
    """작업 계획 삭제"""
    await task_plans_repository.delete_task(task_id)
    return {"success": True, "message": "삭제되었습니다."}

@router.post("/{task_id}/workers")
async def assign_worker_to_task(task_id: int, data: dict):
    """작업에 작업자 배정"""
    await task_plans_repository.assign_worker(task_id, data['worker_id'])
    return {"success": True, "message": "작업자가 배정되었습니다."}

@router.delete("/{task_id}/workers/{worker_id}")
async def remove_worker_from_task(task_id: int, worker_id: int):
    """작업에서 작업자 제거"""
    await task_plans_repository.remove_worker(task_id, worker_id)
    return {"success": True, "message": "작업자가 제거되었습니다."}

@router.post("/dangers")
async def create_danger_zone(data: dict):
    """위험 구역 생성"""
    danger = await safety_logs_repository.create_danger_zone(data)
    return {"success": True, "data": danger}

@router.delete("/dangers/{danger_id}")
async def delete_danger_zone(danger_id: int):
    """위험 구역 삭제"""
    await safety_logs_repository.delete_danger_zone(danger_id)
    return {"success": True, "message": "위험 구역이 삭제되었습니다."}
@router.post("/safety-check")
async def submit_safety_check(data: dict):
    """
    일일 안전 점검 제출 (작업 및 위험 요소 확인)
    Payload:
    {
        "project_id": int,
        "worker_id": int,
        "plan_results": [
            { "plan_id": int, "checked_items": [str] } 
        ],
        "danger_results": [
            { "danger_id": int, "checked": bool }
        ]
    }
    """
    project_id = data.get("project_id")
    worker_id = data.get("worker_id")
    plan_results = data.get("plan_results", [])
    
    # 1. 작업별 안전 점검 로그 생성 및 상태 업데이트
    for plan_res in plan_results:
        plan_id = plan_res['plan_id']
        checked_items = plan_res.get('checked_items', [])
        
        # 로그 생성
        log_data = {
            "project_id": project_id,
            "user_id": worker_id,
            "log_type": "WORK_SAFETY_CHECK",
            "note": "작업 전 안전 점검 완료",
            "plan_id": plan_id,
            "checklist_data": checked_items  # JSON 형태로 저장
        }
        await safety_logs_repository.create_log(log_data)
        
        # 작업 계획 상태 업데이트 (PLANNED -> IN_PROGRESS)
        # 이미 진행중이면 건너뛰거나 유지
        
    return {"success": True, "message": "안전 점검이 완료되었습니다."}

@router.get("/my-log")
async def get_my_safety_logs(project_id: int, worker_id: int, d: Optional[date] = None):
    """
    [DAILY] 특정 작업자의 오늘 안전 점검 로그 조회
    프론트엔드에서 '점검 완료' 상태를 판단하기 위해 사용
    """
    target_date = d or date.today()
    
    # 해당 작업자의 오늘 로그 조회 (repository에 메서드 추가 필요 없이 직접 쿼리하거나 메서드 추가)
    # 여기서는 간단히 repository 메서드를 활용하거나 직접 쿼리
    # safety_logs_repository.get_by_user_date(worker_id, target_date) 필요
    
    # 임시로 직접 쿼리 (Repository 패턴 준수를 위해 파일 이동 추천되나, 빠른 수정 위함)
    from back.database import fetch_all
    
    sql = """
        SELECT * FROM daily_safety_logs 
        WHERE project_id = :pid AND user_id = :uid 
        AND cast(created_at as date) = :d
    """
    logs = await fetch_all(sql, {"pid": project_id, "uid": worker_id, "d": target_date})
    return {"success": True, "data": logs}
