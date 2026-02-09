
from fastapi import APIRouter, Depends
from back.database import fetch_all

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_summary():
    """매니저 대시보드 요약 (임시)"""
    return {"success": True, "data": {}}

@router.get("/workers")
async def get_workers():
    """현장 작업자 목록 (임시 - sys_users에서 조회 가능하도록 확장 필요)"""
    # 임시로 전체 작업자 반환
    workers = await fetch_all("SELECT id, full_name, phone, company_id FROM sys_users WHERE role = 'worker'")
    return {"success": True, "data": workers}

@router.get("/companies")
async def get_companies():
    """협력사 목록 (임시)"""
    companies = await fetch_all("SELECT id, name, business_no FROM sys_companies")
    return {"success": True, "data": companies}
