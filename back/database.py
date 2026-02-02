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
# Raw SQL 헬퍼 함수 (간소화)
# ==========================================
from sqlalchemy import text

async def execute(query: str, params: dict = None):
    """
    INSERT, UPDATE, DELETE 쿼리 실행 (비동기)
    """
    try:
        async with engine.begin() as conn:  # 비동기 트랜잭션 (성공 시 자동 Commit)
            result = await conn.execute(text(query), params or {})
            return result
    except Exception as e:
        print(f"❌ execute 실패: {e}")
        raise e

async def fetch_one(query: str, params: dict = None) -> dict | None:
    """
    SELECT 단건 조회 (비동기, Dict 반환)
    """
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text(query), params or {})
            row = result.mappings().first()
            return dict(row) if row else None
    except Exception as e:
        print(f"❌ fetch_one 실패: {e}")
        raise e

async def fetch_all(query: str, params: dict = None) -> list[dict]:
    """
    SELECT 다건 조회 (비동기, List[Dict] 반환)
    """
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text(query), params or {})
            rows = result.mappings().all()
            return [dict(row) for row in rows]
    except Exception as e:
        print(f"❌ fetch_all 실패: {e}")
        raise e

async def insert_and_return(query: str, params: dict = None) -> dict | None:
    """
    INSERT/UPDATE 후 결과 반환 (비동기, Transaction Commit 포함)
    """
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text(query), params or {})
            row = result.mappings().first()
            return dict(row) if row else None
    except Exception as e:
        print(f"❌ insert_and_return 실패: {e}")
        raise e

# ==========================================
# 모든 모델 Import (Alembic 자동 감지용)
# ==========================================
# 이 파일(back.database)만 임포트해도 Base.metadata에 모든 테이블이 등록됨
from back.auth.model import UserModel
from back.company.model import Site, Company, Worker
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.safety.model import Zone, SafetyLog, DailyDangerZone
from back.info.model import Notice, DailySafetyInfo, EmergencyAlert, Attendance, SafetyViolation, Weather
