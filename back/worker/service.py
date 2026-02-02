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
    get_recent_notices,
    get_daily_danger_zones # 추가됨
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
    # JSON 필드가 자동으로 파싱되었다고 가정 (SQLAlchemy + asyncpg)
    zone_hazards = plan.get("zone_hazards") or []
    # daily_hazards는 list여야 append 가능. None이면 빈 리스트로 초기화
    daily_hazards = plan.get("daily_hazards") or []
    if not isinstance(daily_hazards, list):
        daily_hazards = []

    # [NEW] 일일 변동 위험(DailyDangerZone) 조회 및 추가
    # 금일 내 작업 구역(zone_id)에 해당하는 일일 위험 요소를 조회
    if plan.get("zone_id"):
        danger_zones = await get_daily_danger_zones(plan["zone_id"], today)
        for dz in danger_zones:
            # 예: "HEAVY_EQUIPMENT: ⚠️ 이동식 크레인 인양 작업 중 (접근 금지)"
            # 프론트엔드에서 더 예쁘게 보여주려면 별도 필드로 내려주는 게 좋지만,
            # 현재 구조상 hazards 리스트에 텍스트로 추가하는 것이 가장 빠름.
            msg = f"🚧 {dz['risk_type']}: {dz['description']}"
            daily_hazards.append(msg)
    
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
    
    # [NEW] 각 구역별 일일 변동 위험 체크
    # 원래는 Zone 정보만 줬지만, 일일 위험(DailyDangerZone)이 있으면 description 업그레이드
    result = []
    for z in zones:
        danger_zones = await get_daily_danger_zones(z["id"], today)
        
        # 기본 description
        desc = f"{z['level']} - 기본 위험 구역"
        
        # 일일 위험이 있으면 모든 위험 요소를 합쳐서 표시
        if danger_zones:
            descriptions = []
            for dz in danger_zones:
                # [오늘의 위험] 문구 제거, 원본 설명만 사용
                descriptions.append(dz['description'])
            
            # 위험 요소가 여러 개일 경우 줄바꿈으로 연결하여 가독성 확보
            desc = "\n".join(descriptions)
            
        result.append({
            "id": z["id"],
            "name": z["name"],
            "type": z["type"],
            "level": z["level"],
            "lat": z["lat"],
            "lng": z["lng"],
            "description": desc
        })
    
    return result


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
