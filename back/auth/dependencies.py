"""
인증 의존성 함수들
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from back.database import get_db
from back.auth.model import UserModel
from back.auth.service import AuthService

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> UserModel:
    """
    현재 로그인한 사용자 조회 (JWT 기반)
    """
    token = credentials.credentials
    
    # JWT 토큰 검증
    auth_service = AuthService(db)
    username = auth_service.verify_token(token)
    
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰입니다"
        )
    
    # 사용자 조회
    result = await db.execute(
        select(UserModel).filter(UserModel.username == username)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증되지 않은 사용자입니다"
        )
    
    return user


async def require_admin(
    current_user: UserModel = Depends(get_current_user)
) -> UserModel:
    """
    관리자 권한 필요
    """
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다"
        )
    
    return current_user

