from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any
from datetime import date, datetime

class WorkRepository:
    """작업 관리 데이터 접근 계층 (SQL Repository Pattern)"""
    
    @staticmethod
    async def get_templates() -> List[Dict[str, Any]]:
        sql = "SELECT * FROM work_templates ORDER BY id"
        return await fetch_all(sql)

    @staticmethod
    async def get_template_by_id(template_id: int) -> Dict[str, Any] | None:
        sql = "SELECT * FROM work_templates WHERE id = :template_id"
        return await fetch_one(sql, {"template_id": template_id})

    @staticmethod
    async def get_templates_with_resources() -> List[Dict[str, Any]]:
        """템플릿 + 연결된 리소스 목록 (2-step 쿼리로 깔끔하게)"""
        # 1. 모든 템플릿 조회
        templates = await fetch_all("SELECT * FROM work_templates ORDER BY id")
        
        if not templates:
            return []
        
        # 2. 모든 템플릿-리소스 매핑 한 번에 조회
        template_ids = [t["id"] for t in templates]
        template_ids_str = ",".join(map(str, template_ids))
        mappings_sql = f"""
            SELECT trm.template_id, r.*
            FROM template_resource_map trm
            JOIN safety_resources r ON trm.resource_id = r.id
            WHERE trm.template_id IN ({template_ids_str})
            ORDER BY trm.template_id, r.type, r.name
        """
        mappings = await fetch_all(mappings_sql)
        
        # 3. Python에서 그룹핑 (훨씬 읽기 쉽고, 디버깅도 편함)
        resource_map = {}
        for m in mappings:
            tid = m["template_id"]
            if tid not in resource_map:
                resource_map[tid] = []
            resource_map[tid].append({
                "id": m["id"],
                "name": m["name"],
                "type": m["type"],
                "icon": m["icon"],
                "description": m["description"],
                "safety_rules": m["safety_rules"]
            })
        
        # 4. 템플릿에 리소스 병합
        for t in templates:
            t["required_resources"] = resource_map.get(t["id"], [])
        
        return templates

    @staticmethod
    async def get_all_safety_resources() -> List[Dict[str, Any]]:
        sql = "SELECT * FROM safety_resources ORDER BY type, name"
        return await fetch_all(sql)

    @staticmethod
    async def get_resources_by_ids(resource_ids: List[int]) -> List[Dict[str, Any]]:
        if not resource_ids:
            return []
        sql = "SELECT * FROM safety_resources WHERE id = ANY(:resource_ids)"
        return await fetch_all(sql, {"resource_ids": resource_ids})

    @staticmethod
    async def get_daily_plans(target_date: date = None, site_id: int = None) -> List[Dict[str, Any]]:
        params = {}
        filters = []
        if target_date:
            filters.append("p.date = :target_date")
            params["target_date"] = target_date
        if site_id:
            filters.append("p.site_id = :site_id")
            params["site_id"] = site_id
            
        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        
        sql = f"""
            SELECT p.*, z.name as zone_name, t.work_type,
                   t.required_ppe, t.checklist_items,
                   (SELECT json_agg(json_build_object(
                       'id', wa.id, 'worker_id', wa.worker_id, 
                       'role', wa.role, 'worker_name', u.full_name
                   )) FROM worker_allocations wa
                   JOIN users u ON wa.worker_id = u.id
                   WHERE wa.plan_id = p.id) as allocations,
                   t.base_risk_score,
                   z.lat as zone_lat, z.lng as zone_lng
            FROM daily_work_plans p
            JOIN zones z ON p.zone_id = z.id
            JOIN work_templates t ON p.template_id = t.id
            {where_clause}
            ORDER BY p.date DESC, p.id DESC
        """
        return await fetch_all(sql, params)

    @staticmethod
    async def get_plan_by_id(plan_id: int) -> Dict[str, Any] | None:
        sql = """
            SELECT p.*, z.name as zone_name, t.work_type,
                   t.required_ppe, t.checklist_items,
                   (SELECT json_agg(json_build_object(
                       'id', wa.id, 'worker_id', wa.worker_id, 
                       'role', wa.role, 'worker_name', u.full_name
                   )) FROM worker_allocations wa
                   JOIN users u ON wa.worker_id = u.id
                   WHERE wa.plan_id = p.id) as allocations
            FROM daily_work_plans p
            JOIN zones z ON p.zone_id = z.id
            JOIN work_templates t ON p.template_id = t.id
            WHERE p.id = :plan_id
        """
        return await fetch_one(sql, {"plan_id": plan_id})

    @staticmethod
    async def create_plan(data: Dict[str, Any]) -> Dict[str, Any]:
        sql = """
            INSERT INTO daily_work_plans (
                site_id, zone_id, template_id, date, description, 
                equipment_flags, daily_hazards, status, calculated_risk_score, created_at
            ) VALUES (
                :site_id, :zone_id, :template_id, :date, :description, 
                :equipment_flags, :daily_hazards, :status, :calculated_risk_score, :created_at
            ) RETURNING *
        """
        data["created_at"] = datetime.now()
        return await insert_and_return(sql, data)

    @staticmethod
    async def update_plan(plan_id: int, data: Dict[str, Any]) -> Dict[str, Any] | None:
        set_clause = ", ".join([f"{k} = :{k}" for k in data.keys()])
        data["plan_id"] = plan_id
        sql = f"UPDATE daily_work_plans SET {set_clause} WHERE id = :plan_id RETURNING *"
        return await insert_and_return(sql, data)

    @staticmethod
    async def delete_plan(plan_id: int):
        await execute("DELETE FROM worker_allocations WHERE plan_id = :plan_id", {"plan_id": plan_id})
        result = await execute("DELETE FROM daily_work_plans WHERE id = :plan_id", {"plan_id": plan_id})
        return result.rowcount > 0

    @staticmethod
    async def create_allocation(plan_id: int, worker_id: int, role: str):
        sql = "INSERT INTO worker_allocations (plan_id, worker_id, role) VALUES (:plan_id, :worker_id, :role)"
        await execute(sql, {"plan_id": plan_id, "worker_id": worker_id, "role": role})

    @staticmethod
    async def delete_allocations_by_plan(plan_id: int):
        await execute("DELETE FROM worker_allocations WHERE plan_id = :plan_id", {"plan_id": plan_id})

    @staticmethod
    async def get_my_plans(worker_id: int, target_date: date) -> List[Dict[str, Any]]:
        sql = """
            SELECT p.*, z.name as zone_name, z.lat as zone_lat, z.lng as zone_lng,
                   t.work_type, t.required_ppe, t.checklist_items,
                   (SELECT json_agg(json_build_object(
                       'id', wa.id, 'worker_id', wa.worker_id, 
                       'role', wa.role, 'worker_name', u.full_name
                   )) FROM worker_allocations wa
                   JOIN users u ON wa.worker_id = u.id
                   WHERE wa.plan_id = p.id) as allocations
            FROM daily_work_plans p
            JOIN worker_allocations wa2 ON p.id = wa2.plan_id
            JOIN zones z ON p.zone_id = z.id
            JOIN work_templates t ON p.template_id = t.id
            WHERE wa2.worker_id = :worker_id AND p.date = :target_date
            ORDER BY p.id DESC
        """
        return await fetch_all(sql, {"worker_id": worker_id, "target_date": target_date})
    @staticmethod
    async def get_template_resources(template_id: int) -> List[Dict[str, Any]]:
        sql = """
            SELECT r.* FROM template_resource_map trm
            JOIN safety_resources r ON trm.resource_id = r.id
            WHERE trm.template_id = :template_id
        """
        return await fetch_all(sql, {"template_id": template_id})
