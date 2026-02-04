from back.database import fetch_one, fetch_all
from datetime import datetime


def _to_date(value):
    """str 'YYYY-MM-DD' 또는 date -> date. PostgreSQL DATE 컬럼용."""
    if value is None:
        return None
    if hasattr(value, "year"):  # already date
        return value
    if isinstance(value, str):
        return datetime.strptime(value, "%Y-%m-%d").date()
    return value


def _to_date_str(value):
    """date 또는 str -> str. VARCHAR date 컬럼(daily_safety_info)용."""
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


async def get_worker_with_info(user_id: int) -> dict | None:
    # 1. 사용자의 회사 정보는 무조건 가져옴
    # 2. 회사가 참여 중인 프로젝트 정보를 가져옴
    # 3. 그 프로젝트에 사용자가 정식 멤버(pm.id 존재)인지 확인하여 승인 여부 판단
    sql = """
        SELECT 
            u.id, u.username, u.full_name, u.role, u.phone,
            c.name as company_name,
            p.name as project_name,
            p.id as project_id,
            CASE WHEN pm.id IS NOT NULL THEN true ELSE false END as is_approved
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        -- 업체가 참여 중인 프로젝트 확인
        LEFT JOIN project_participants pp ON u.company_id = pp.company_id
        LEFT JOIN projects p ON pp.project_id = p.id
        -- 해당 프로젝트에 사용자가 직접 등록되었는지(승인) 확인
        LEFT JOIN project_members pm ON u.id = pm.user_id AND pm.project_id = p.id AND pm.status = 'ACTIVE'
        WHERE u.id = :user_id
        ORDER BY is_approved DESC, p.created_at DESC
        LIMIT 1
    """
    return await fetch_one(sql, {"user_id": user_id})




async def get_worker_by_user_id(user_id: int) -> dict | None:
    sql = "SELECT * FROM users WHERE id = :user_id"
    return await fetch_one(sql, {"user_id": user_id})

async def get_daily_work_plan(worker_id: int, date: str) -> dict | None:
    sql = """
        SELECT 
            p.id as plan_id, 
            p.zone_id,
            p.description, 
            p.calculated_risk_score, 
            p.daily_hazards,
            z.name as zone_name, 
            z.default_hazards as zone_hazards,
            t.work_type, 
            t.required_ppe, 
            t.checklist_items,
            a.role as my_role
        FROM worker_allocations a
        JOIN daily_work_plans p ON a.plan_id = p.id
        JOIN zones z ON p.zone_id = z.id
        JOIN work_templates t ON p.template_id = t.id
        WHERE a.worker_id = :worker_id AND p.date = :date
    """
    return await fetch_one(sql, {"worker_id": worker_id, "date": _to_date(date)})

async def get_assigned_zones(worker_id: int, date: str) -> list[dict]:
    sql = """
        SELECT z.*
        FROM zones z
        JOIN daily_work_plans p ON z.id = p.zone_id
        JOIN worker_allocations a ON p.id = a.plan_id
        WHERE a.worker_id = :worker_id AND p.date = :date
    """
    return await fetch_all(sql, {"worker_id": worker_id, "date": _to_date(date)})

async def get_weather_by_date(date: str) -> dict | None:
    sql = "SELECT * FROM weather WHERE date = :date"
    return await fetch_one(sql, {"date": _to_date(date)})

async def get_active_emergency_alert() -> dict | None:
    sql = """
        SELECT * FROM emergency_alerts 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1
    """
    return await fetch_one(sql)

async def get_daily_safety_infos(date: str) -> list[dict]:
    sql = "SELECT * FROM daily_safety_info WHERE date = :date"
    return await fetch_all(sql, {"date": _to_date_str(date)})

async def get_daily_danger_zones(zone_id: int, date: str) -> list[dict]:
    sql = "SELECT * FROM daily_danger_zones WHERE zone_id = :zone_id AND date = :date"
    return await fetch_all(sql, {"zone_id": zone_id, "date": _to_date(date)})

async def get_attendance(user_id: int, date: str) -> dict | None:
    sql = """
        SELECT * FROM attendance 
        WHERE user_id = :user_id AND date = :date
    """
    return await fetch_one(sql, {"user_id": user_id, "date": _to_date(date)})

async def get_safety_violations_count(worker_id: int) -> int:
    sql = """
        SELECT COUNT(*) as count FROM safety_violations 
        WHERE worker_id = :worker_id
    """
    res = await fetch_one(sql, {"worker_id": worker_id})
    return res["count"] if res else 0

async def get_recent_notices(limit: int = 3) -> list[dict]:
    sql = """
        SELECT id, title, content, is_important as priority, created_at 
        FROM notices 
        ORDER BY is_important DESC, created_at DESC 
        LIMIT :limit
    """
    return await fetch_all(sql, {"limit": limit})
