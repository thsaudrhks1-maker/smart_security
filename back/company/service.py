from back.company.repository import CompanyRepository
from back.company.schema import CompanyCreate
from typing import List, Dict, Any

class CompanyService:
    @staticmethod
    async def get_all_companies():
        return await CompanyRepository.get_all_companies()

    @staticmethod
    async def create_company(data: CompanyCreate):
        existing = await CompanyRepository.get_company_by_name(data.name)
        if existing:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="이미 등록된 업체명입니다.")
        return await CompanyRepository.create_company(data.name, data.trade_type)

    @staticmethod
    async def get_workers(company_id: int = None):
        workers = await CompanyRepository.get_company_workers(company_id)
        # FE에서 기대하는 status 필드 보완 (임시)
        for w in workers:
            w["status"] = "OFF_SITE"
            w["qualification_tags"] = None
        return workers

    @staticmethod
    async def get_company_users(company_id: int, role_str: str = None):
        roles = role_str.split(',') if role_str else ["manager", "safety_manager", "admin"]
        return await CompanyRepository.get_company_users_by_roles(company_id, roles)
