
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import json
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try: yield session
        finally: await session.close()

# --- Raw SQL Helpers ---
async def execute(query: str, params: dict = None):
    async with engine.begin() as conn: return await conn.execute(text(query), params or {})

async def fetch_one(query: str, params: dict = None):
    async with engine.connect() as conn:
        res = await conn.execute(text(query), params or {})
        row = res.mappings().first()
        return dict(row) if row else None

async def fetch_all(query: str, params: dict = None):
    async with engine.connect() as conn:
        res = await conn.execute(text(query), params or {})
        return [dict(r) for r in res.mappings().all()]

async def insert_and_return(query: str, params: dict = None):
    async with engine.begin() as conn:
        res = await conn.execute(text(query), params or {})
        row = res.mappings().first()
        return dict(row) if row else None

# ==========================================
# [MASTER TABLE MAPPING] - 유실 방지 최종 전수 임포트
# ==========================================

# 1. [SYS]
from back.sys.users.model import sys_users
from back.sys.companies.model import sys_companies
from back.sys.alerts.model import sys_emergency_alerts

# 2. [PROJECT]
from back.project.master.model import project_master
from back.project.locations.model import project_sites, project_zones
from back.project.membership.model import project_members, project_companies

# 3. [CONTENT]
from back.content.work_manuals.model import content_work_templates
from back.content.safety_gear.model import content_safety_gear, content_work_gear_map

# 4. [DAILY]
from back.daily.attendance.model import daily_attendance
from back.daily.environment.model import daily_weather
from back.daily.notices.model import daily_notices, daily_safety_info
from back.daily.task_plans.model import daily_work_tasks, daily_worker_allocations
from back.daily.safety_logs.model import daily_safety_logs, daily_danger_zones, daily_danger_images
from back.daily.violations.model import daily_violations
