import asyncio
from sqlalchemy import text
import bcrypt
from back.database import engine, Base
# Import all models
from back.auth.model import User
from back.project.model import Project, ProjectMember
from back.company.model import Site, Company, ProjectParticipant
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.safety.model import Zone, SafetyLog, DailyDangerZone
from back.info.model import Notice, DailySafetyInfo, EmergencyAlert, Attendance, SafetyViolation, Weather

async def reset_db():
    async with engine.begin() as conn:
        print("🔥 FORCE Dropping tables with CASCADE...")
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        
        print("🏗️ Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        
        print("🌱 Seeding initial data (Admin/Manager/Worker)...")
        
        # 0. 비밀번호 해시 (bcrypt 직접 사용)
        hashed_pw = bcrypt.hashpw("0000".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 1. 기본 회사 생성 (매니저/워커 소속용)
        # 1-1. 발주처/원청 (General)
        conn.execute(text(f"""
            INSERT INTO companies (name, type, trade_type, user_id) 
            VALUES ('스마트건설AndCo', 'GENERAL', '종합건설', 9999) 
        """)) # user_id 9999는 임시 (FK 제약이 있다면 user 먼저 만들어야 함. 아래 순서 조정)
        
        # 순서 변경: 유저 먼저 만들고 회사 만들어야 함? 
        # UserModel에 company_id FK가 있고, Company에 user_id(대표자) FK가 있을 수 있음.
        # 서로 맞물리면 골치 아픈데, Company.user_id는 nullable일 수도 있고 뺄 수도 있음.
        # 현재 Company model에는 user_id가 없음 (삭제했었음). 확인 필요.

    # 세션 열어서 ORM으로 넣는게 안전함 (순서/FK 자동 처리 등)
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.asyncio import AsyncSession
    
    AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. 회사 생성
            company_general = Company(name="대한건설(주)", type="GENERAL", trade_type="종합")
            company_specialty = Company(name="번개전기(주)", type="SPECIALTY", trade_type="전기")
            db.add_all([company_general, company_specialty])
            await db.flush() # ID 발급
            
            # 2. 유저 생성 (a, m, w)
            users = [
                User(
                    username="a", 
                    hashed_password=hashed_pw, 
                    full_name="시스템관리자", 
                    role="admin"
                ),
                User(
                    username="m", 
                    hashed_password=hashed_pw, 
                    full_name="김소장", 
                    role="manager",
                    company_id=company_general.id,
                    title="현장소장"
                ),
                User(
                    username="w", 
                    hashed_password=hashed_pw, 
                    full_name="이반장", 
                    role="worker",
                    company_id=company_specialty.id,
                    job_type="전기공",
                    title="반장"
                )
            ]
            db.add_all(users)
            await db.commit()
            print("✅ Created Users: a(admin), m(manager), w(worker) / PW: 0000")
            
        except Exception as e:
            print(f"❌ Seed Failed: {e}")
            await db.rollback()

    print("Done!")

if __name__ == "__main__":
    asyncio.run(reset_db())
