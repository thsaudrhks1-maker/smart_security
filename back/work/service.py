from back.work.repository import WorkRepository
from back.work.schema import DailyWorkPlanCreate, DailyWorkPlanUpdate
from back.safety.repository import SafetyRepository
from datetime import datetime, date
from typing import List, Dict, Any

class WorkService:
    @staticmethod
    async def get_templates_contents():
        return await WorkRepository.get_templates_with_resources()

    @staticmethod
    async def get_all_resources():
        return await WorkRepository.get_all_safety_resources()

    @staticmethod
    async def get_daily_plans(date_str: str = None, site_id: int = None):
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else None
        plans = await WorkRepository.get_daily_plans(target_date, site_id)
        
        # 추가 리소스 계산 로직 필요 시 추가
        for p in plans:
            p["required_resources"] = await WorkService._calculate_required_resources(p)
            
        return plans

    @staticmethod
    async def get_plan_by_id(plan_id: int):
        plan = await WorkRepository.get_plan_by_id(plan_id)
        if plan:
            plan["required_resources"] = await WorkService._calculate_required_resources(plan)
        return plan

    @staticmethod
    async def create_plan(body: DailyWorkPlanCreate):
        # 1. 템플릿 및 구역 정보 조회 (위험도 계산용)
        template = await WorkRepository.get_template_by_id(body.template_id)
        zone = await SafetyRepository.get_zone_by_id(body.zone_id)
        
        # 2. 위험도 계산
        risk = template["base_risk_score"] if template else 50
        if zone:
            if zone["type"] == "ROOF": risk += 15
            elif zone["type"] == "PIT": risk += 20
            elif zone["type"] == "OUTDOOR": risk += 5
            
        for eq in body.equipment_flags:
            if eq in ["CRANE", "EXCAVATOR"]: risk += 15
            elif eq in ["LIFT", "WELDING_MACHINE"]: risk += 10
            
        risk = min(risk, 100)
        
        # 3. 계획 생성
        plan_data = {
            "site_id": body.site_id,
            "zone_id": body.zone_id,
            "template_id": body.template_id,
            "date": datetime.strptime(body.date, "%Y-%m-%d").date(),
            "description": body.description,
            "equipment_flags": body.equipment_flags,
            "daily_hazards": getattr(body, "daily_hazards", []),
            "status": body.status,
            "calculated_risk_score": risk
        }
        new_plan = await WorkRepository.create_plan(plan_data)
        
        # 4. 배정 정보 생성
        for alloc in body.allocations:
            await WorkRepository.create_allocation(new_plan["id"], alloc.worker_id, alloc.role)
            
        return await WorkService.get_plan_by_id(new_plan["id"])

    @staticmethod
    async def update_plan(plan_id: int, body: DailyWorkPlanUpdate):
        update_data = body.dict(exclude={"allocations"}, exclude_unset=True)
        if update_data:
            await WorkRepository.update_plan(plan_id, update_data)
            
        if body.allocations is not None:
            await WorkRepository.delete_allocations_by_plan(plan_id)
            for alloc in body.allocations:
                await WorkRepository.create_allocation(plan_id, alloc.worker_id, alloc.role or "작업자")
                
        return await WorkService.get_plan_by_id(plan_id)

    @staticmethod
    async def delete_plan(plan_id: int):
        return await WorkRepository.delete_plan(plan_id)

    @staticmethod
    async def get_my_plans(worker_id: int, date_str: str = None):
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else date.today()
        plans = await WorkRepository.get_my_plans(worker_id, target_date)
        
        for p in plans:
            # 데일리 위험 정보 병합
            danger_zones = await SafetyRepository.get_daily_danger_zones(target_date, p["zone_id"])
            p["daily_hazards"] = list(p["daily_hazards"] or [])
            for dz in danger_zones:
                p["daily_hazards"].append(f"🚧 {dz['risk_type']}: {dz['description']}")
                
        return plans

    @staticmethod
    async def _calculate_required_resources(plan: Dict[str, Any]):
        """일정별 적용 안전공구: (템플릿 기본 - 제외) + 추가"""
        template_resources = await WorkRepository.get_template_resources(plan["template_id"])
        
        excluded = set(plan.get("excluded_resource_ids") or [])
        additional_ids = plan.get("additional_resource_ids") or []
        
        from_template = [r for r in template_resources if r["id"] not in excluded]
        additional = await WorkRepository.get_resources_by_ids(additional_ids)
        
        seen = {r["id"] for r in from_template}
        for r in additional:
            if r["id"] not in seen:
                from_template.append(r)
                seen.add(r["id"])
                
        return from_template
