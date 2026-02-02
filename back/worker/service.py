from datetime import date
from typing import Dict, List, Any
from back.worker.repository import (
    get_worker_by_user_id,
    get_daily_work_plan,
    get_assigned_zones,
    get_weather_by_date,
    get_active_emergency_alert,
    get_daily_safety_infos,
    get_attendance,
    get_safety_violations_count,
    get_recent_notices
)

async def get_my_work_today(user_id: int) -> Dict[str, Any] | None:
    # 1. 작업자 조회
    worker = await get_worker_by_user_id(user_id)
    if not worker:
        return None
    
    today = str(date.today())
    
    # 2. 작업 계획 조회
    plan = await get_daily_work_plan(worker["id"], today)
    if not plan:
        return None
        
    # 3. 위험 요소 합산
    zone_hazards = plan.get("zone_hazards") or []
    daily_hazards = plan.get("daily_hazards") or []
    
    all_hazards = list(set(zone_hazards + daily_hazards))
    
    return {
        "id": plan["plan_id"],
        "description": plan["description"],
        "zone_name": plan["zone_name"],
        "work_type": plan["work_type"],
        "calculated_risk_score": plan["calculated_risk_score"],
        "required_ppe": plan["required_ppe"] or [],
        "checklist_items": plan["checklist_items"] or [],
        "my_role": plan["my_role"],
        "hazards": all_hazards,
        "zone_hazards": zone_hazards,
        "daily_hazards": daily_hazards
    }


async def get_my_risks_today(user_id: int) -> List[Dict[str, Any]]:
    worker = await get_worker_by_user_id(user_id)
    if not worker:
        return []
        
    today = str(date.today())
    
    # 배정된 구역 조회 (잠재적 위험 구역)
    zones = await get_assigned_zones(worker["id"], today)
    
    return [
        {
            "id": z["id"],
            "name": z["name"],
            "type": z["type"],
            "level": z["level"],
            "lat": z["lat"],
            "lng": z["lng"],
            "description": f"{z['level']} - 위험 구역"
        }
        for z in zones
    ]


async def get_dashboard_info(user_id: int) -> Dict[str, Any]:
    result = {
        "weather": None,
        "emergency_alert": None,
        "safety_infos": [],
        "attendance": None,
        "safety_violations_count": 0,
        "notices": [],
        "incident_free_days": 25 # 하드코딩 유지
    }

    # 1. 작업자 조회
    worker = await get_worker_by_user_id(user_id)
    
    today = str(date.today())
    
    # 2. 날씨
    weather = await get_weather_by_date(today)
    if weather:
        result["weather"] = {
            "temperature": weather["temperature"],
            "condition": weather["condition"]
        }
        
    # 3. 긴급알림
    alert = await get_active_emergency_alert()
    if alert:
        result["emergency_alert"] = {
            "title": alert["title"],
            "message": alert["message"],
            "severity": alert["severity"]
        }
        
    # 4. 안전정보 (작업자별 필터링)
    if worker:
        infos = await get_daily_safety_infos(today)
        my_infos = []
        worker_id_str = str(worker["id"])
        for info in infos:
            target_workers = info.get("is_read_by_worker") or ""
            if worker_id_str in target_workers:
                my_infos.append({
                    "id": info["id"],
                    "title": info["title"],
                    "content": info["content"],
                    "date": info["date"]
                })
        result["safety_infos"] = my_infos

    # 5. 출역 현황
    if worker:
        att = await get_attendance(worker["id"], today)
        if att:
            result["attendance"] = {
                "check_in_time": att["check_in_time"],
                "check_out_time": att["check_out_time"],
                "status": att["status"]
            }
        else:
            result["attendance"] = {"status": "ABSENT"}

    # 6. 안전위반 건수
    if worker:
        result["safety_violations_count"] = await get_safety_violations_count(worker["id"])
        
    # 7. 공지사항
    notices = await get_recent_notices(3)
    result["notices"] = [
        {
            "id": n["id"],
            "title": n["title"],
            "content": n["content"],
            "priority": n["priority"]
        }
        for n in notices
    ]
    
    return result
