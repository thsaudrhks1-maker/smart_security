import asyncio
import os
import sys

# 프로젝트 루트 경로를 파이썬 경로에 추가 (back 패키지 인식을 위해)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
from sqlalchemy import text
from back.database import AsyncSessionLocal, engine, Base

# Models
from back.login.model import UserModel
from back.company.model import Company, Worker, Attendance
from back.work.model import DailyJob, JobAllocation, Equipment
from back.board.model import Notice
from back.safety.model import SafetyRule, DangerZone

# Password Hasher
def hash_password(password: str) -> str:
    # bcrypt는 bytes를 받음
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("🧹 Cleaning up existing data...")
        # 역순 삭제 (FK 제약조건 때문)
        await db.execute(text("TRUNCATE TABLE workers, job_allocations, daily_jobs, danger_zones, notices, users, companies RESTART IDENTITY CASCADE"))
        await db.commit()
        print("✨ Cleaned up!")
        
        print("🌱 Seeding data started...")

        # 1. Company 생성
        company = Company(
            name="지구방위 건설(주)",
            # site_name, address 등은 모델에 없으므로 제외하거나 모델 확장이 필요함.
            # 현재 모델 필드: license_no, contact
            license_no="123-45-67890",
            contact="010-1234-5678 (김반장)"
        )
        db.add(company)
        await db.commit()
        await db.refresh(company)
        print(f"✅ Company created: {company.name}")

        # 2. Users (Admin & Workers) 생성
        # Password: "TestPassword123!"
        hashed_pw = hash_password("TestPassword123!")

        # 2-1. 관리자 (Admin)
        admin_user = UserModel(
            username="admin",
            # email 필드 제거
            hashed_password=hashed_pw,
            full_name="최고관리자",
            role="admin",
            # is_active 필드 제거
        )
        db.add(admin_user)

        # 2-2. 근로자 (Users + Workers)
        worker_names = ["김철수", "이영희", "박민수", "정태수", "홍길동"]
        roles = ["용접공", "신호수", "배관공", "전기공", "잡부"]
        
        created_workers = []

        for i, name in enumerate(worker_names):
            # User 계정 생성
            user = UserModel(
                username=f"worker{i+1}",
                # email 필드 제거
                hashed_password=hashed_pw,
                full_name=name,
                role="worker",
                # is_active 필드 제거
            )
            db.add(user)
            await db.flush() # ID 생성을 위해 flush

            # Worker 프로필 생성
            worker = Worker(
                user_id=user.id,
                company_id=company.id,
                name=name,
                job_type=roles[i], # model.py: job_type
                # phone 필드는 모델에 없음 -> 제거
                blood_type="A" if i % 2 == 0 else "B",
                years_of_experience=3
            )
            db.add(worker)
            created_workers.append(worker)
        
        await db.commit()
        print(f"✅ Users & Workers created: 1 Admin + {len(created_workers)} Workers")

        # 3. Danger Zones (위험 구역)
        # Model: name, description, risk_level, latitude, longitude, radius, is_active
        zones = [
            DangerZone(name="Zone A (추락주의)", description="개구부 덮개 미설치 구간", risk_level="HIGH", latitude=37.5663, longitude=126.9784, radius=30.0),
            DangerZone(name="Zone B (화기작업)", description="용접 불꽃 비산 주의", risk_level="MID", latitude=37.5668, longitude=126.9775, radius=25.0),
            DangerZone(name="Zone C (고압전류)", description="지하 전력실", risk_level="CRITICAL", latitude=37.5660, longitude=126.9780, radius=15.0),
        ]
        db.add_all(zones)
        print(f"✅ Danger Zones created: {len(zones)}")

        # 4. Daily Jobs (금일 작업)
        # Model: date, title, description, location, risk_level
        jobs = [
            DailyJob(title="A구역 배관 용접", description="소방 배관 용접 작업", location="Zone B", risk_level="HIGH"),
            DailyJob(title="B구역 자재 양중", description="타워크레인 이용 철근 인양", location="Zone A", risk_level="MID"),
            DailyJob(title="지하 1층 전기 배선", description="트레이 설치 및 입선", location="Zone C", risk_level="LOW"),
        ]
        db.add_all(jobs)
        await db.commit()
        await db.refresh(jobs[0]) # ID 참조를 위해 refresh
        await db.refresh(jobs[1])
        print(f"✅ Daily Jobs created: {len(jobs)}")

        # 5. Job Allocation (작업 할당)
        # Model: job_id, worker_id, role
        allocations = [
            JobAllocation(job_id=jobs[0].id, worker_id=created_workers[0].id, role="작업반장"),
            JobAllocation(job_id=jobs[0].id, worker_id=created_workers[1].id, role="용접보조"),
            JobAllocation(job_id=jobs[1].id, worker_id=created_workers[2].id, role="신호수"),
        ]
        db.add_all(allocations)
        
        # 6. Notices (공지사항)
        # Model: title, content, author_id, is_important
        notices = [
            Notice(title="[필독] 동절기 한랭질환 예방", content="따뜻한 물 자주 마시기, 핫팩 지급", author_id=admin_user.id, is_important=True),
            Notice(title="내일 전체 안전교육 실시", content="오전 7시 TBM 장소 집결", author_id=admin_user.id, is_important=False),
        ]
        db.add_all(notices)

        await db.commit()
        print("🌱 Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
