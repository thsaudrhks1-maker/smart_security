from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from back.auth.model import AuthRepository, UserModel
from back.company.model import Worker
from back.auth.schemas import LoginRequest
import logging
import bcrypt

logger = logging.getLogger(__name__)

# pwd_context 제거 (passlib 호환성 문제 해결을 위해 bcrypt 직접 사용)

class AuthService:
    def __init__(self, db: AsyncSession):
        self.repository = AuthRepository(db)
        self.db = db # Store AsyncSession for direct use

    async def login(self, login_data: LoginRequest) -> dict: # Reverted login_data type hint to LoginRequest and removed db argument
        # 1. 사용자 조회 (Async)
        result = await self.db.execute(select(UserModel).filter(UserModel.username == login_data.username))
        user = result.scalars().first()
        
        if not user:
            return None

        # 2. Worker 정보(생년월일 등) 추가 조회 (Async)
        try:
            w_result = await self.db.execute(select(Worker).filter(Worker.user_id == user.id))
            worker = w_result.scalars().first()
            birth_date = worker.birth_date if worker else None
        except Exception as e:
            print(f"Worker fetch error: {e}")
            birth_date = None

        # 3. 마스터키 확인 (개발용)
        if login_data.password == "0000":
            return {
                "access_token": f"master_token_{user.username}", 
                "token_type": "bearer",
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role,
                "user_id": user.id,
                "birth_date": birth_date
            }
            
        # 4. 비밀번호 검증
        try:
            password_bytes = login_data.password.encode('utf-8')
            hashed_bytes = user.hashed_password.encode('utf-8')
            
            if not bcrypt.checkpw(password_bytes, hashed_bytes):
                return None
        except Exception as e:
            logger.error(f"Password verification failed: {e}")
            return None
            
        # 5. 로그인 성공 응답
        return {
            "access_token": f"token_{user.username}_{user.role}", 
            "token_type": "bearer",
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "user_id": user.id,
            "birth_date": birth_date
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
