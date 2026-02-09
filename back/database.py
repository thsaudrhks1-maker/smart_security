
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:1234@localhost:5432/smart_security")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def execute(sql: str, params: dict = None):
    async with engine.begin() as conn:
        await conn.execute(text(sql), params or {})

async def fetch_all(sql: str, params: dict = None):
    async with engine.connect() as conn:
        result = await conn.execute(text(sql), params or {})
        return [dict(row._mapping) for row in result]

async def fetch_one(sql: str, params: dict = None):
    async with engine.connect() as conn:
        result = await conn.execute(text(sql), params or {})
        row = result.first()
        return dict(row._mapping) if row else None

async def insert_and_return(sql: str, params: dict = None):
    """INSERT ... RETURNING * 실행 후 반환된 한 행을 dict로 반환."""
    async with engine.begin() as conn:
        result = await conn.execute(text(sql), params or {})
        row = result.first()
        return dict(row._mapping) if row else None

# === Models Import (전수 조사 및 누락 방지) ===
# 1. [SYS] 시스템 기초
from back.sys.users.model import sys_users
from back.sys.companies.model import sys_companies
from back.sys.alerts.model import sys_emergency_alerts

# 2. [PROJECT] 프로젝트 관련
from back.project.master.model import project_master
from back.project.locations.model import project_zones
from back.project.membership.model import project_users, project_companies

# 3. [CONTENT] 공통 콘텐츠
from back.content.work_info.model import content_work_info
from back.content.work_info.map_model import content_work_safety_map
from back.content.safety_gear.model import content_safety_gear, content_work_gear_map
from back.content.safety_info.model import content_safety_info
from back.content.danger_info.model import content_danger_info

# 4. [DAILY] 일일 관리 (누락 복구 완료)
from back.daily.attendance.model import daily_attendance
from back.daily.task_plans.model import daily_work_plans, daily_worker_users
from back.daily.safety_logs.model import daily_safety_logs, daily_danger_zones, daily_danger_images
from back.daily.notices.model import daily_notices
from back.daily.violations.model import daily_violations
from back.daily.environment.model import daily_weather # 이 파일에 daily_weather가 있을 것으로 판단
