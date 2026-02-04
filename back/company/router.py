from fastapi import APIRouter, HTTPException, Depends
from back.company.schema import WorkerRead, CompanyRead, CompanyCreate
from back.company.service import CompanyService
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/company", tags=["company"])

class SimpleUserRead(BaseModel):
    id: int
    full_name: str
    role: str
    position: str | None = None

@router.get("/workers", response_model=List[WorkerRead])
async def get_workers(company_id: int = None):
    """업체 소속 근로자 조회"""
    return await CompanyService.get_workers(company_id)

@router.get("", response_model=List[CompanyRead])
async def get_companies():
    """모든 업체 목록 조회"""
    return await CompanyService.get_all_companies()

@router.post("", response_model=CompanyRead, status_code=201)
async def create_company(company: CompanyCreate):
    """신규 업체 등록"""
    return await CompanyService.create_company(company)

@router.get("/{company_id}/users", response_model=List[SimpleUserRead])
async def get_company_users(company_id: int, role: str = None):
    """특정 회사의 직원 조회 (Manager/Safety 선택용)"""
    return await CompanyService.get_company_users(company_id, role)
