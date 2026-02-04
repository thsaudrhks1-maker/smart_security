import asyncio
import random
import sys
import os
from datetime import date, datetime, timedelta
from sqlalchemy import select
import bcrypt

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import AsyncSessionLocal
from back.auth.model import User
from back.company.model import Company, ProjectParticipant
from back.project.model import Project, ProjectMember
from back.attendance.model import Attendance

async def seed_extended_data():
    async with AsyncSessionLocal() as db:
        print("🔍 [Step 1] 기존 프로젝트 및 회사 확인 중...")
        
        # 1. 1번 프로젝트 가져오기
        res_project = await db.execute(select(Project).where(Project.code == "PJ-2026-001"))
        project = res_project.scalar_one_or_none()
        if not project:
            print("❌ 프로젝트 PJ-2026-001이 존재하지 않습니다. reset_scenario.py를 먼저 실행하세요.")
            return

        # 2. 신규 협력사 추가 (Idempotent: 존재하면 가져오기)
        new_company_name = "대성기계(주)"
        res_comp = await db.execute(select(Company).where(Company.name == new_company_name))
        new_company = res_comp.scalar_one_or_none()
        if not new_company:
            new_company = Company(name=new_company_name, type="SPECIALTY", trade_type="기계설비")
            db.add(new_company)
            await db.flush()
            print(f"🏢 신규 협력사 생성: {new_company_name}")
        else:
            print(f"🏢 기존 협력사 사용: {new_company_name}")

        # 3. 추가 작업자 10명 생성
        print("👤 [Step 2] 신규 작업자 10명 생성 및 배정 중...")
        pw_bytes = "0000".encode('utf-8')
        hashed_pw = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode('utf-8')
        
        job_types = ["용접", "배관", "목공", "타일", "미장"]
        worker_data = []
        
        for i in range(1, 11):
            username = f"ext_worker_{i}"
            res_user = await db.execute(select(User).where(User.username == username))
            if res_user.scalar_one_or_none():
                continue
            
            job = random.choice(job_types)
            worker = User(
                username=username,
                hashed_password=hashed_pw,
                full_name=f"작업원_{i:02d}",
                role="worker",
                job_type=job,
                title="일반",
                phone=f"010-9000-{i:04d}",
                company_id=new_company.id,
                birth_date=date(1975 + random.randint(0, 25), random.randint(1, 12), random.randint(1, 28))
            )
            db.add(worker)
            worker_data.append(worker)
        
        await db.flush() # ID 확보
        
        # 4. 프로젝트 멤버 배정 (일부는 PENDING, 일부는 ACTIVE)
        print("🔗 [Step 3] 프로젝트 멤버 상태 설정 중 (PENDING/ACTIVE 혼합)...")
        for idx, w in enumerate(worker_data):
            # 짝수는 ACTIVE, 홀수는 PENDING
            status = "ACTIVE" if idx % 2 == 0 else "PENDING"
            pm = ProjectMember(
                project_id=project.id,
                user_id=w.id,
                role_name=w.job_type,
                status=status
            )
            db.add(pm)
            print(f" -> {w.full_name}: {status}")

        # 협력사 참여 정보 (없을 경우에만)
        res_pp = await db.execute(select(ProjectParticipant).where(
            ProjectParticipant.project_id == project.id,
            ProjectParticipant.company_id == new_company.id
        ))
        if not res_pp.scalar_one_or_none():
            db.add(ProjectParticipant(project_id=project.id, company_id=new_company.id, role="PARTNER"))

        await db.commit()

        # 5. 과거 출역 데이터 생성 (1월 한 달간)
        print("📅 [Step 4] 1월(과거) 출역 데이터 생성 중...")
        # 승인된(ACTIVE) 인원들만 과거 출역이 가능함
        active_members_res = await db.execute(
            select(User).join(ProjectMember).where(
                ProjectMember.project_id == project.id,
                ProjectMember.status == "ACTIVE",
                User.role == "worker"
            )
        )
        active_workers = active_members_res.scalars().all()
        
        attendance_records = []
        # 1월 1일부터 1월 31일까지
        start_date = date(2026, 1, 1)
        for d_idx in range(31):
            curr_date = start_date + timedelta(days=d_idx)
            # 일요일은 쉼
            if curr_date.weekday() == 6:
                continue
                
            # 매일 랜덤하게 70% 정도가 출근함
            daily_workers = random.sample(active_workers, int(len(active_workers) * 0.7))
            
            for w in daily_workers:
                # 8시 전후 출근
                check_in = datetime.combine(curr_date, datetime.min.time()).replace(
                    hour=7, minute=random.randint(40, 59), second=random.randint(0, 59)
                )
                # 17시 전후 퇴근 (일부만 퇴근 기록 있음)
                check_out = None
                if random.random() > 0.1:
                    check_out = datetime.combine(curr_date, datetime.min.time()).replace(
                        hour=17, minute=random.randint(0, 30), second=random.randint(0, 59)
                    )
                
                att = Attendance(
                    user_id=w.id,
                    project_id=project.id,
                    date=curr_date,
                    check_in_time=check_in,
                    check_out_time=check_out,
                    status="PRESENT",
                    check_in_method="APP"
                )
                attendance_records.append(att)
        
        db.add_all(attendance_records)
        await db.commit()
        print(f"✅ 총 {len(attendance_records)}건의 과거 출역 기록 생성 완료.")

if __name__ == "__main__":
    asyncio.run(seed_extended_data())
