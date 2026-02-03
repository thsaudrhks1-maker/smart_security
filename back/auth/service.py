from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from back.auth.model import User
from back.auth.schemas import LoginRequest, UserCreate
import logging
import bcrypt

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def verify_token(self, token: str) -> str | None:
        try:
            if token.startswith("master_token_"):
                # master_token_worker_worker -> worker
                parts = token.split("_")
                return parts[2] if len(parts) >= 3 else parts[2] # 안전하게 3번째 요소(username) 반환
            elif token.startswith("token_"):
                # token_worker_worker -> worker
                parts = token.split("_")
                if len(parts) >= 3:
                    return parts[1] # token[0], username[1], role[2]
                elif len(parts) == 2:
                    return parts[1]
            return None
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return None

    async def login(self, login_data: LoginRequest) -> dict:
        print(f"🔑 [Login Attempt] {login_data.username}")
        result = await self.db.execute(select(User).filter(User.username == login_data.username))
        user = result.scalars().first()
        
        if not user:
            print(f"❌ User Not Found: {login_data.username}")
            return None

        # 마스터키 확인 (개발용)
        if login_data.password == "0000":
            print(f"✅ Master Key Login: {user.username}")
            return self._make_login_response(user, is_master=True)

            
        # 비밀번호 검증
        try:
            password_bytes = login_data.password.encode('utf-8')
            hashed_bytes = user.hashed_password.encode('utf-8')
            
            if not bcrypt.checkpw(password_bytes, hashed_bytes):
                return None
        except Exception as e:
            logger.error(f"Password verification failed: {e}")
            return None
            
        return self._make_login_response(user)

    def _make_login_response(self, user: User, is_master=False) -> dict:
        token_prefix = "master_token" if is_master else "token"
        return {
            "access_token": f"{token_prefix}_{user.username}_{user.role}", 
            "token_type": "bearer",
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "user_id": user.id,
            "birth_date": str(user.birth_date) if user.birth_date else None
        }

    async def register_user(self, user_data: UserCreate) -> User:
        # 사용자 존재 여부 확인
        result = await self.db.execute(select(User).filter(User.username == user_data.username))
        if result.scalars().first():
            return None
        
        # 비밀번호 해싱
        hashed = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 유저 생성
        new_user = User(
            username=user_data.username,
            hashed_password=hashed,
            full_name=user_data.full_name or user_data.username,
            role=user_data.role or "worker",
            company_id=user_data.company_id,
            job_type=user_data.job_type,
            title=user_data.title,
            phone=user_data.phone,
            birth_date=user_data.birth_date # Date 객체는 ORM이 처리
        )
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        return new_user
