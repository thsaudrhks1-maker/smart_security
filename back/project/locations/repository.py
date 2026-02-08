
from back.database import fetch_all, fetch_one
from datetime import date as date_type

class locations_repository:
    """[PROJECT_LOCATIONS] 프로젝트·구역 데이터 접근 (project_sites 미사용, project_master + project_zones만 사용)"""
    @staticmethod
    async def get_project(pid: int):
        return await fetch_one("SELECT id, name FROM project_master WHERE id = :pid", {"pid": pid})

    @staticmethod
    async def get_zones_by_project(pid: int):
        return await fetch_all(
            "SELECT * FROM project_zones WHERE project_id = :pid ORDER BY level, name",
            {"pid": pid}
        )
    
    @staticmethod
    async def get_zones_with_details(pid: int, target_date):
        """구역별 작업, 작업자, 위험요소 통합 조회"""
        if isinstance(target_date, str):
            target_date = date_type.fromisoformat(target_date)
        
        # 1. 모든 구역 조회
        zones = await fetch_all(
            "SELECT * FROM project_zones WHERE project_id = :pid ORDER BY level, row_index, col_index",
            {"pid": pid}
        )
        
        # 2. 오늘의 작업 계획 조회 (JSON aggregation)
        tasks_sql = """
            SELECT 
                dwt.id as task_id,
                dwt.zone_id, 
                dwt.description, 
                dwt.calculated_risk_score, 
                dwt.status,
                wi.work_type,
                wi.checklist_items,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', u.id,
                            'full_name', u.full_name,
                            'job_title', u.job_title,
                            'company_name', c.name
                        )
                    ) FILTER (WHERE u.id IS NOT NULL),
                    '[]'::json
                ) as workers
            FROM daily_work_plans dwt
            LEFT JOIN content_work_info wi ON dwt.work_info_id = wi.id
            LEFT JOIN daily_worker_users dwu ON dwt.id = dwu.plan_id
            LEFT JOIN sys_users u ON dwu.worker_id = u.id
            LEFT JOIN sys_companies c ON u.company_id = c.id
            WHERE dwt.project_id = :pid AND dwt.date = :date
            GROUP BY dwt.id, dwt.zone_id, dwt.description, dwt.calculated_risk_score, dwt.status, wi.work_type, wi.checklist_items
        """
        tasks = await fetch_all(tasks_sql, {"pid": pid, "date": target_date})
        
        # 3. 오늘의 위험 구역 조회
        dangers_sql = """
            SELECT 
                ddz.id as danger_id,
                ddz.zone_id, 
                ddz.description,
                COALESCE(di.danger_type, ddz.risk_type) as danger_type,
                di.icon, 
                di.color, 
                di.risk_level
            FROM daily_danger_zones ddz
            LEFT JOIN content_danger_info di ON ddz.danger_info_id = di.id
            WHERE ddz.zone_id IN (SELECT id FROM project_zones WHERE project_id = :pid)
            AND ddz.date = :date
        """
        dangers = await fetch_all(dangers_sql, {"pid": pid, "date": target_date})
        
        # 4. 구역별로 데이터 매핑
        tasks_by_zone = {}
        for task in tasks:
            zone_id = task['zone_id']
            if zone_id not in tasks_by_zone:
                tasks_by_zone[zone_id] = []
            tasks_by_zone[zone_id].append(task)
        
        dangers_by_zone = {}
        for danger in dangers:
            zone_id = danger['zone_id']
            if zone_id not in dangers_by_zone:
                dangers_by_zone[zone_id] = []
            dangers_by_zone[zone_id].append(danger)
        
        # 5. 구역에 데이터 추가
        for zone in zones:
            zone['tasks'] = tasks_by_zone.get(zone['id'], [])
            zone['dangers'] = dangers_by_zone.get(zone['id'], [])
        
        return zones
