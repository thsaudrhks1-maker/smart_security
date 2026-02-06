
from fastapi import APIRouter
from back.sys.companies.service import companies_service

router = APIRouter()

@router.get("/")
async def list_companies():
    return await companies_service.get_all_companies()
