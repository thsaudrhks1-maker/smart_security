from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from back.database import get_db
from back.auth.schemas import LoginRequest, Token, UserCreate, User
from back.auth.service import AuthService

# 기능 단위 라우터 생성
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    token = await service.login(request)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
        )
    return token

@router.post("/register", response_model=User)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    new_user = await service.register_user(user)
    if not new_user:
        raise HTTPException(
            status_code=400,
            detail="이미 존재하는 사용자입니다."
        )
    return User(username=new_user.username, full_name=new_user.full_name, role=new_user.role)
