from back.database import fetch_one, fetch_all

async def get_worker_by_user_id(user_id: int) -> dict | None:
    sql = """
        SELECT * FROM workers WHERE user_id = :user_id
    """
    return await fetch_one(sql, {"user_id": user_id})

async def get_daily_work_plan(worker_id: int, date: str) -> dict | None:
    sql = """
        SELECT 
            p.id as plan_id, 
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
    return await fetch_one(sql, {"worker_id": worker_id, "date": date})

async def get_assigned_zones(worker_id: int, date: str) -> list[dict]:
    sql = """
        SELECT z.*
        FROM zones z
        JOIN daily_work_plans p ON z.id = p.zone_id
        JOIN worker_allocations a ON p.id = a.plan_id
        WHERE a.worker_id = :worker_id AND p.date = :date
    """
    return await fetch_all(sql, {"worker_id": worker_id, "date": date})

async def get_weather_by_date(date: str) -> dict | None:
    sql = "SELECT * FROM weather WHERE date = :date"
    return await fetch_one(sql, {"date": date})

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
    return await fetch_all(sql, {"date": date})

async def get_attendance(worker_id: int, date: str) -> dict | None:
    sql = """
        SELECT * FROM attendance 
        WHERE worker_id = :worker_id AND date = :date
    """
    return await fetch_one(sql, {"worker_id": worker_id, "date": date})

async def get_safety_violations_count(worker_id: int) -> int:
    sql = """
        SELECT COUNT(*) as count FROM safety_violations 
        WHERE worker_id = :worker_id
    """
    res = await fetch_one(sql, {"worker_id": worker_id})
    return res["count"] if res else 0

async def get_recent_notices(limit: int = 3) -> list[dict]:
    sql = """
        SELECT * FROM notices 
        ORDER BY created_at DESC 
        LIMIT :limit
    """
    return await fetch_all(sql, {"limit": limit})
