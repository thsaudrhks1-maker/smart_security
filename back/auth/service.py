from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from back.auth.model import AuthRepository, User
from back.auth.schemas import LoginRequest, UserCreate
import logging
import bcrypt

logger = logging.getLogger(__name__)

# pwd_context 제거 (passlib 호환성 문제 해결을 위해 bcrypt 직접 사용)

class AuthService:
    def __init__(self, db: AsyncSession):
        self.repository = AuthRepository(db)
        self.db = db # Store AsyncSession for direct use

    def verify_token(self, token: str) -> str | None:
        """
        토큰에서 사용자명 추출
        현재는 간단한 토큰 형식: master_token_{username} 또는 token_{username}_{role}
        """
        try:
            if token.startswith("master_token_"):
                return token.replace("master_token_", "")
            elif token.startswith("token_"):
                parts = token.split("_")
                if len(parts) >= 2:
                    return parts[1]  # token_{username}_{role}
            return None
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return None

    async def login(self, login_data: LoginRequest) -> dict: # Reverted login_data type hint to LoginRequest and removed db argument
        # 1. 사용자 조회 (Async)
        result = await self.db.execute(select(User).filter(User.username == login_data.username))
        user = result.scalars().first()
        
        if not user:
            return None

        # 2. 통합된 User 모델에서 정보 조회
        birth_date = user.birth_date # Worker 테이블 조인 불필요 (User 테이블로 통합됨)

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

    async def register_user(self, user_data: UserCreate) -> User:
        # 사용자 존재 여부 확인
        existing_user = await self.repository.get_user_by_username(user_data.username)
        if existing_user:
            return None # 이미 존재
        
        # 비밀번호 해싱 (bcrypt 직접 사용)
        hashed = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 유저 생성
        new_user = User(
            username=user_data.username,
            hashed_password=hashed,
            full_name=user_data.full_name or user_data.username,
            role=user_data.role or "worker",
            
            # [신규] 상세 정보 매핑
            company_id=user_data.company_id,
            job_type=user_data.job_type,
            title=user_data.title,
            phone=user_data.phone,
            birth_date=user_data.birth_date
        )
        return await self.repository.create_user(new_user)
