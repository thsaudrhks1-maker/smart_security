
from fastapi import APIRouter, HTTPException
from back.sys.users.schema import UserLogin
from back.sys.users.service import users_service

from back.sys.users.repository import users_repository

router = APIRouter()

@router.get("")
async def list_users():
    users = await users_repository.get_all()
    return {"success": True, "data": users}

@router.get("/company/{company_id}")
async def list_users_by_company(company_id: int):
    users = await users_repository.get_by_company(company_id)
    return {"success": True, "data": users}

@router.post("/login")
async def login(req: UserLogin):
    user = await users_service.authenticate(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="인증 실패")
    
    # 사용자의 프로젝트 정보 조회
    project_id = await users_repository.get_user_project(user["id"])
    
    # 프론트엔드가 기대하는 평면 구조(Flat UI structure)로 반환
    return {
        "success": True,
        "access_token": "fake-jwt-token", # 현재 세션 방식
        "user_id": user["id"],
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"],
        "company_id": user["company_id"],
        "project_id": project_id
    }
