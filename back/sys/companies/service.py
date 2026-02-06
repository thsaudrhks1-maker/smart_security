
from back.sys.companies.repository import companies_repository

class companies_service:
    """[SYS_COMPANIES] 비즈니스 로직"""
    @staticmethod
    async def get_all_companies():
        data = await companies_repository.get_all()
        return {"success": True, "data": data}

    @staticmethod
    async def get_company_by_id(company_id: int):
        data = await companies_repository.get_by_id(company_id)
        return {"success": True, "data": data}

    @staticmethod
    async def create_company(data: dict):
        new_id = await companies_repository.create(data)
        return {"success": True, "data": {"id": new_id}, "message": "업체가 등록되었습니다."}
