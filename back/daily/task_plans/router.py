
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
