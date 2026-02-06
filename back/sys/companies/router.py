
from fastapi import APIRouter
from back.sys.companies.service import companies_service

router = APIRouter()

@router.get("")
async def list_companies():
    return await companies_service.get_all_companies()

@router.get("/{company_id}")
async def get_company(company_id: int):
    return await companies_service.get_company_by_id(company_id)

@router.post("")
async def create_company(data: dict):
    return await companies_service.create_company(data)
