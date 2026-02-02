"""
작업자 전용 API 엔드포인트
- 본인의 작업 정보만 조회
- 본인의 위험지역 정보만 조회
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import date
from typing import List

from back.database import get_db
from back.auth.dependencies import get_current_user
from back.auth.model import UserModel
from back.company.model import Worker
from back.work.model import DailyWorkPlan, WorkerAllocation
from back.safety.model import Zone

router = APIRouter(prefix="/worker", tags=["worker"])


@router.get("/my-work/today")
async def get_my_work_today(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    금일 나의 작업 조회
    """
    # 현재 사용자의 worker_id 조회
    worker_result = await db.execute(
        select(Worker).filter(Worker.user_id == current_user.id)
    )
    worker = worker_result.scalar_one_or_none()
    
    # 작업자 정보가 없으면 (admin 등) None 반환
    if not worker:
        return None
    
    # 금일 작업 배정 조회 (WorkTemplate도 함께 조인)
    from back.work.model import WorkTemplate
    
    today = date.today()
    allocation_result = await db.execute(
        select(WorkerAllocation, DailyWorkPlan, Zone, WorkTemplate)
        .join(DailyWorkPlan, WorkerAllocation.plan_id == DailyWorkPlan.id)
        .join(Zone, DailyWorkPlan.zone_id == Zone.id)
        .join(WorkTemplate, DailyWorkPlan.template_id == WorkTemplate.id)
        .filter(
            and_(
                WorkerAllocation.worker_id == worker.id,
                DailyWorkPlan.date == str(today)
            )
        )
    )
    result = allocation_result.first()
    
    if not result:
        return None
    
    allocation, plan, zone, template = result
    
    # 위험 요소 합산 (구역 고정 위험 + 일일 작업 위험)
    all_hazards = []
    if zone.default_hazards:
        all_hazards.extend(zone.default_hazards)
    if plan.daily_hazards:
        all_hazards.extend(plan.daily_hazards)
    
    return {
        "id": plan.id,
        "description": plan.description,
        "zone_name": zone.name,
        "work_type": template.work_type,
        "calculated_risk_score": plan.calculated_risk_score,
        "required_ppe": template.required_ppe or [],
        "checklist_items": template.checklist_items or [],
        "my_role": allocation.role,
        "hazards": all_hazards,  # 합산된 위험 요소
        "zone_hazards": zone.default_hazards or [],  # 구역 고정 위험
        "daily_hazards": plan.daily_hazards or []  # 일일 작업 위험
    }


@router.get("/my-risks/today")
async def get_my_risks_today(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    금일 나의 위험지역 조회
    """
    # 현재 사용자의 worker_id 조회
    worker_result = await db.execute(
        select(Worker).filter(Worker.user_id == current_user.id)
    )
    worker = worker_result.scalar_one_or_none()
    
    if not worker:
        return []
    
    # 금일 작업 배정된 구역의 위험지역 조회
    today = date.today()
    risk_result = await db.execute(
        select(Zone)
        .join(DailyWorkPlan, Zone.id == DailyWorkPlan.zone_id)
        .join(WorkerAllocation, DailyWorkPlan.id == WorkerAllocation.plan_id)
        .filter(
            and_(
                WorkerAllocation.worker_id == worker.id,
                DailyWorkPlan.date == str(today),
                Zone.type == 'DANGER'
            )
        )
    )
    risks = risk_result.scalars().all()
    
    return [
        {
            "id": risk.id,
            "name": risk.name,
            "type": risk.type,
            "level": risk.level,
            "lat": risk.lat,
            "lng": risk.lng,
            "description": f"{risk.level} - 위험 구역"
        }
        for risk in risks
    ]


@router.get("/dashboard-info")
async def get_dashboard_info(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    작업자 대시보드 추가 정보 조회
    - 날씨, 긴급알림, 일일 안전정보, 출역현황, 안전위반, 공지사항
    """
    from back.info.model import (
        Weather, EmergencyAlert, DailySafetyInfo,
        Attendance, SafetyViolation, Notice
    )
    
    today = str(date.today())
    
    # 작업자 정보 조회
    worker_result = await db.execute(
        select(Worker).filter(Worker.user_id == current_user.id)
    )
    worker = worker_result.scalar_one_or_none()
    
    # 1. 날씨
    weather_result = await db.execute(
        select(Weather).filter(Weather.date == today)
    )
    weather = weather_result.scalar_one_or_none()
    
    # 2. 긴급알림
    alert_result = await db.execute(
        select(EmergencyAlert)
        .filter(EmergencyAlert.is_active == True)
        .order_by(EmergencyAlert.created_at.desc())
        .limit(1)
    )
    alert = alert_result.scalar_one_or_none()
    
    # 3. 일일 안전정보 (읽음/안 읽음)
    safety_info_result = await db.execute(
        select(DailySafetyInfo).filter(DailySafetyInfo.date == today)
    )
    safety_infos = safety_info_result.scalars().all()
    
    read_count = 0
    unread_count = 0
    if worker:
        for info in safety_infos:
            if str(worker.id) in (info.is_read_by_worker or ""):
                read_count += 1
            else:
                unread_count += 1
    else:
        unread_count = len(safety_infos)
    
    # 4. 금일 출역현황
    attendance = None
    if worker:
        attendance_result = await db.execute(
            select(Attendance).filter(
                and_(
                    Attendance.worker_id == worker.id,
                    Attendance.date == today
                )
            )
        )
        attendance = attendance_result.scalar_one_or_none()
    
    # 5. 안전위반
    violations_count = 0
    if worker:
        violations_result = await db.execute(
            select(SafetyViolation).filter(SafetyViolation.worker_id == worker.id)
        )
        violations_count = len(violations_result.scalars().all())
    
    # 6. 공지사항
    notice_result = await db.execute(
        select(Notice)
        .order_by(Notice.created_at.desc())
        .limit(3)
    )
    notices = notice_result.scalars().all()
    
    return {
        "weather": {
            "temperature": weather.temperature if weather else "N/A",
            "condition": weather.condition if weather else "정보 없음"
        } if weather else None,
        "emergency_alert": {
            "title": alert.title,
            "message": alert.message,
            "severity": alert.severity
        } if alert else None,
        "safety_info": {
            "read_count": read_count,
            "unread_count": unread_count
        },
        "attendance": {
            "check_in_time": attendance.check_in_time if attendance else None,
            "check_out_time": attendance.check_out_time if attendance else None,
            "status": attendance.status if attendance else "ABSENT"
        } if attendance else None,
        "safety_violations_count": violations_count,
        "notices": [
            {
                "id": n.id,
                "title": n.title,
                "priority": n.priority
            }
            for n in notices
        ],
        "incident_free_days": 25  # 임시 하드코딩 (추후 계산 로직 추가)
    }
