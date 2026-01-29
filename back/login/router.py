from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from back.database import get_db
from back.login.schemas import LoginRequest, Token
from back.login.service import AuthService

# 기능 단위 라우터 생성
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    token = service.login(request)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
        )
    return token
