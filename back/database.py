from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# .env 로드
load_dotenv()

# DB URL 가져오기 (없으면 기본값 설정)
# 주의: Async 엔진을 위해 스키마는 'postgresql+asyncpg'여야 함
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:0000@localhost:5432/smart_security")

# Async Engine 생성
engine = create_async_engine(
    DATABASE_URL,
    echo=True, # 쿼리 로깅 (개발 중에만 True)
)

# Async Session Factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

# Dependency Injection (비동기)
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# ==========================================
# 모든 모델 Import (Alembic 자동 감지용)
# ==========================================
# 이 파일(back.database)만 임포트해도 Base.metadata에 모든 테이블이 등록됨
from back.login.model import UserModel
from back.company.model import Company, Worker, Attendance
from back.work.model import DailyJob, JobAllocation, Equipment
from back.board.model import Notice
from back.safety.model import SafetyRule, DangerZone
