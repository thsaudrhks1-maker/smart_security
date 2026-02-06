
from fastapi import APIRouter, Depends, HTTPException, status
from back.sys.repository import sys_repository
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(req: LoginRequest):
    user = await sys_repository.get_user_by_username(req.username)
    if not user:
        raise HTTPException(status_code=401, detail="아이디를 확인해주세요.")
    # 단순화된 비밀번호 체크 (추후 bcrypt 연동)
    return {"token": "dummy-token", "user": user}

@router.get("/companies")
async def list_companies():
    return await sys_repository.get_all_companies()
