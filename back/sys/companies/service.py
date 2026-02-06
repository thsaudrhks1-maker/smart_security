
from back.sys.companies.repository import companies_repository

class companies_service:
    """[SYS_COMPANIES] 비즈니스 로직"""
    @staticmethod
    async def get_all_companies():
        return await companies_repository.get_all()
