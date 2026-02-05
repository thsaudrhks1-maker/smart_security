from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import json
from dotenv import load_dotenv

# .env 로드
load_dotenv()

# DB URL 가져오기
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:0000@localhost:5432/smart_security")

# JSON Serializer 설정 (한글 깨짐 방지)
def json_serializer(obj):
    return json.dumps(obj, ensure_ascii=False)

def json_deserializer(s):
    return json.loads(s)

# Async Engine 생성 (원격 DB 연결 안정성을 위해 커넥션 풀 최적화)
engine = create_async_engine(
    DATABASE_URL,
    echo=True, # 쿼리 로깅
    json_serializer=json_serializer,
    json_deserializer=json_deserializer,
    pool_size=20,       # 기본 5개에서 20개로 확장
    max_overflow=10,    # 초과 시 최대 10개까지 추가 허용
    pool_timeout=30,    # 연결 대기 시간 30초 설정
    pool_recycle=1800   # 30분마다 연결 재확인
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
# Raw SQL도 위의 engine을 사용하므로 커넥션 풀은 ORM과 동일하게 SQLAlchemy가 관리한다.
# 단, get_db() 세션(ORM)과는 매 호출마다 풀에서 새 연결을 쓰므로, 같은 트랜잭션으로는 묶이지 않는다.
from sqlalchemy import text

async def execute(query: str, params: dict = None):
    """INSERT, UPDATE, DELETE 등 실행용 (JSON 자동 직렬화)"""
    try:
        # JSON 타입 파라미터 자동 직렬화 (list, dict → JSON 문자열)
        if params:
            params = {
                k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                for k, v in params.items()
            }
        
        async with engine.begin() as conn:
            result = await conn.execute(text(query), params or {})
            return result
    except Exception as e:
        print(f"❌ execute 실패: {e}")
        raise e

async def fetch_one(query: str, params: dict = None) -> dict | None:
    """단건 조회 (JSON 자동 직렬화)"""
    try:
        # JSON 타입 파라미터 자동 직렬화 (list, dict → JSON 문자열)
        if params:
            params = {
                k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                for k, v in params.items()
            }
        
        async with engine.connect() as conn:
            result = await conn.execute(text(query), params or {})
            row = result.mappings().first()
            return dict(row) if row else None
    except Exception as e:
        print(f"❌ fetch_one 실패: {e}")
        raise e

async def fetch_all(query: str, params: dict = None) -> list[dict]:
    """다건 조회 (JSON 자동 직렬화)"""
    try:
        # JSON 타입 파라미터 자동 직렬화 (list, dict → JSON 문자열)
        if params:
            params = {
                k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                for k, v in params.items()
            }
        
        async with engine.connect() as conn:
            result = await conn.execute(text(query), params or {})
            rows = result.mappings().all()
            return [dict(row) for row in rows]
    except Exception as e:
        print(f"❌ fetch_all 실패: {e}")
        raise e

async def insert_and_return(query: str, params: dict = None) -> dict | None:
    """INSERT/UPDATE ... RETURNING * 쿼리 실행 후 결과 반환 (JSON 자동 직렬화)"""
    try:
        # JSON 타입 파라미터 자동 직렬화 (list, dict → JSON 문자열)
        if params:
            params = {
                k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                for k, v in params.items()
            }
        
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
from back.auth.model import User
from back.project.model import Project, ProjectMember
from back.company.model import Company, Site, ProjectParticipant
from back.safety.model import Zone, DailyDangerZone, SafetyLog, EmergencyAlert, SafetyViolation
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation, Weather
from back.board.model import Notice
from back.attendance.model import Attendance
from back.info.model import DailySafetyInfo
