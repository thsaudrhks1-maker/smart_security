from sqlalchemy.ext.asyncio import AsyncSession
from back.auth.model import AuthRepository, UserModel
from back.auth.schemas import LoginRequest
import logging
import bcrypt

logger = logging.getLogger(__name__)

# pwd_context 제거 (passlib 호환성 문제 해결을 위해 bcrypt 직접 사용)

class AuthService:
    def __init__(self, db: AsyncSession):
        self.repository = AuthRepository(db)

    async def login(self, login_data: LoginRequest) -> dict:
        # DB에서 유저 조회
        user = await self.repository.get_user_by_username(login_data.username)
        
        # [마스터키] 개발 편의 기능: 0000 입력 시 무조건 로그인 성공
        if login_data.password == "0000":
            return {
                "access_token": f"master_token_{user.username}", 
                "token_type": "bearer",
                "username": user.username,
                "full_name": user.full_name, # 실명 추가
                "role": user.role,
                "user_id": user.id 
            }
            
        # 비밀번호 검증 (Safe-On Lite v1.0)
        # DB의 해시는 str이므로 bytes로 변환 필요
        try:
            # 입력받은 비번을 bytes로
            password_bytes = login_data.password.encode('utf-8')
            # DB에 저장된 해시를 bytes로
            hashed_bytes = user.hashed_password.encode('utf-8')
            
            if not bcrypt.checkpw(password_bytes, hashed_bytes):
                return None
        except Exception as e:
            logger.error(f"Password verification failed: {e}")
            return None
            
        # 로그인 성공
        return {
            "access_token": f"token_{user.username}_{user.role}", 
            "token_type": "bearer",
            "username": user.username,
            "full_name": user.full_name, # 실명 추가
            "role": user.role 
        }

    async def register_user(self, user_data: LoginRequest) -> UserModel:
        # 사용자 존재 여부 확인
        existing_user = await self.repository.get_user_by_username(user_data.username)
        if existing_user:
            return None # 이미 존재
        
        # 비밀번호 해싱
        hashed = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 유저 생성
        new_user = UserModel(
            username=user_data.username,
            hashed_password=hashed,
            full_name=user_data.full_name if hasattr(user_data, 'full_name') else user_data.username,
            role=user_data.role if hasattr(user_data, 'role') else "worker"
        )
        return await self.repository.create_user(new_user)
