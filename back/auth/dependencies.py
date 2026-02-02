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
    현재 로그인한 사용자 조회
    """
    token = credentials.credentials
    
    # 임시: 개발 편의성을 위해 admin 사용자 반환
    result = await db.execute(
        select(UserModel).filter(UserModel.username == "admin")
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

