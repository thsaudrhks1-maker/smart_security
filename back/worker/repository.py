from back.database import fetch_one, fetch_all

async def get_worker_with_info(user_id: int) -> dict | None:
    # 1. 사용자의 회사명과 소속 회사가 참여 중인 최신 프로젝트명을 가져옴
    # project_members에 직접 등록된 건이 있으면 최우선, 없으면 소속 회사 참여 현장 매칭
    # 1. 사용자의 회사명과 소속 회사가 참여 중인 최신 프로젝트 정보를 가져옴
    # project_members에 직접 등록된 건이 있으면 최우선, 없으면 소속 회사 참여 현장 매칭
    sql = """
        SELECT 
            u.*, 
            c.name as company_name,
            COALESCE(p1.name, p2.name) as project_name,
            COALESCE(p1.id, p2.id) as project_id
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        -- 1. 개인 직접 투입 (ProjectMember)
        LEFT JOIN project_members pm ON u.id = pm.user_id AND pm.status = 'ACTIVE'
        LEFT JOIN projects p1 ON pm.project_id = p1.id
        -- 2. 업체 투입 (ProjectParticipant)
        LEFT JOIN project_participants pp ON u.company_id = pp.company_id
        LEFT JOIN projects p2 ON pp.project_id = p2.id
        WHERE u.id = :user_id
        ORDER BY p1.created_at DESC NULLS LAST, p2.created_at DESC
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
    return await fetch_one(sql, {"worker_id": worker_id, "date": str(date)})

async def get_assigned_zones(worker_id: int, date: str) -> list[dict]:
    sql = """
        SELECT z.*
        FROM zones z
        JOIN daily_work_plans p ON z.id = p.zone_id
        JOIN worker_allocations a ON p.id = a.plan_id
        WHERE a.worker_id = :worker_id AND p.date = :date
    """
    return await fetch_all(sql, {"worker_id": worker_id, "date": str(date)})

async def get_weather_by_date(date: str) -> dict | None:
    sql = "SELECT * FROM weather WHERE date = :date"
    return await fetch_one(sql, {"date": str(date)})

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
    return await fetch_all(sql, {"date": str(date)})

async def get_daily_danger_zones(zone_id: int, date: str) -> list[dict]:
    sql = "SELECT * FROM daily_danger_zones WHERE zone_id = :zone_id AND date = :date"
    return await fetch_all(sql, {"zone_id": zone_id, "date": str(date)})

async def get_attendance(user_id: int, date: str) -> dict | None:
    sql = """
        SELECT * FROM attendance 
        WHERE user_id = :user_id AND date = :date
    """
    return await fetch_one(sql, {"user_id": user_id, "date": str(date)})

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
