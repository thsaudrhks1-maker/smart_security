"""
기존 DB 데이터 보존하면서 작업자만 추가하는 스크립트
- 박작업, 강공남, 김철근 등 작업자 추가
- 회사에 연결하고 프로젝트에 배정
"""
import asyncio
from datetime import date, datetime
import bcrypt
from sqlalchemy import text

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

from back.database import engine

async def add_workers():
    print("[START] 작업자 추가 시작...")
    
    now = datetime.now()
    today = date.today()
    pwd = hash_password("0000")

    async with engine.begin() as conn:
        # 0. 시퀀스 리셋 (ID 충돌 방지)
        print("[INFO] 시퀀스 리셋 중...")
        await conn.execute(text("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false)"))
        await conn.execute(text("SELECT setval('daily_work_plans_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM daily_work_plans), false)"))
        print("[OK] 시퀀스 리셋 완료")
        
        # 1. 기존 회사 및 프로젝트 확인
        companies = await conn.execute(text("SELECT id, name FROM companies"))
        company_list = companies.fetchall()
        print(f"[INFO] 기존 회사: {[(c.id, c.name) for c in company_list]}")
        
        projects = await conn.execute(text("SELECT id, name FROM projects"))
        project_list = projects.fetchall()
        print(f"[INFO] 기존 프로젝트: {[(p.id, p.name) for p in project_list]}")
        
        if not company_list or not project_list:
            print("[ERROR] 회사 또는 프로젝트가 없습니다. 먼저 회사와 프로젝트를 생성해주세요.")
            return
        
        # 기본 회사 ID (첫 번째 회사 사용)
        company1_id = company_list[0].id if len(company_list) > 0 else 1
        company2_id = company_list[1].id if len(company_list) > 1 else company1_id
        project_id = project_list[0].id
        
        print(f"[INFO] 작업자를 추가할 회사: {company1_id}, {company2_id}")
        print(f"[INFO] 작업자를 배정할 프로젝트: {project_id}")
        
        # 2. 기존 작업자 확인 (중복 방지)
        existing_users = await conn.execute(text("SELECT username FROM users WHERE role='worker'"))
        existing_usernames = {u.username for u in existing_users.fetchall()}
        print(f"[INFO] 기존 작업자: {existing_usernames}")
        
        # 3. 작업자 추가 (중복 체크)
        workers_to_add = [
            ("worker1", "박작업", company2_id, "배관공", "반장", "010-2222-2222"),
            ("worker2", "강공남", company2_id, "배관공", "작업자", "010-3333-3333"),
            ("worker3", "김철근", company1_id, "철근공", "작업자", "010-4444-4444"),
            ("worker4", "이전기", company1_id, "전기공", "작업자", "010-5555-5555"),
            ("worker5", "정미장", company2_id, "미장공", "작업자", "010-6666-6666"),
        ]
        
        added_workers = []
        for username, full_name, company_id, job_type, title, phone in workers_to_add:
            if username not in existing_usernames:
                result = await conn.execute(text("""
                    INSERT INTO users (username, hashed_password, full_name, role, company_id, job_type, title, phone, created_at)
                    VALUES (:username, :pwd, :full_name, 'worker', :company_id, :job_type, :title, :phone, :now)
                    RETURNING id
                """), {
                    "username": username, "pwd": pwd, "full_name": full_name,
                    "company_id": company_id, "job_type": job_type, "title": title,
                    "phone": phone, "now": now
                })
                user_id = result.scalar()
                added_workers.append((user_id, username, full_name, job_type))
                print(f"[OK] 작업자 추가: {username} ({full_name}, {job_type})")
            else:
                print(f"[SKIP] 이미 존재하는 작업자: {username}")
        
        if not added_workers:
            print("[INFO] 추가할 새로운 작업자가 없습니다.")
            return
        
        # 4. 프로젝트 멤버로 등록
        for user_id, username, full_name, job_type in added_workers:
            # 기존에 등록되어 있는지 확인
            existing = await conn.execute(text("""
                SELECT id FROM project_members WHERE project_id = :project_id AND user_id = :user_id
            """), {"project_id": project_id, "user_id": user_id})
            
            if not existing.scalar():
                await conn.execute(text("""
                    INSERT INTO project_members (project_id, user_id, role_name, status, joined_at)
                    VALUES (:project_id, :user_id, :role_name, 'ACTIVE', :now)
                """), {"project_id": project_id, "user_id": user_id, "role_name": job_type, "now": now})
                print(f"[OK] 프로젝트 멤버 등록: {full_name}")
        
        # 5. 작업 계획 및 배정 추가 (선택적)
        # 기존 zones 확인
        zones = await conn.execute(text("SELECT id, name, level FROM zones LIMIT 5"))
        zone_list = zones.fetchall()
        
        if zone_list and added_workers:
            print(f"[INFO] 작업 계획 생성 중...")
            
            # 작업 템플릿 확인
            templates = await conn.execute(text("SELECT id, work_type FROM work_templates LIMIT 3"))
            template_list = templates.fetchall()
            
            if template_list:
                # 첫 번째 작업자(박작업)에게 첫 번째 작업 배정
                worker1_id = added_workers[0][0]
                zone1_id = zone_list[0].id
                template1_id = template_list[0].id
                
                plan_result = await conn.execute(text("""
                    INSERT INTO daily_work_plans (
                        site_id, zone_id, template_id, date, description, status, calculated_risk_score,
                        equipment_flags, daily_hazards, created_at
                    ) VALUES (
                        1, :zone_id, :template_id, :today, :description, 'IN_PROGRESS', 40,
                        '[]', '[]', :now
                    ) RETURNING id
                """), {
                    "zone_id": zone1_id, "template_id": template1_id, "today": today,
                    "description": f"{zone_list[0].name} {template_list[0].work_type} 작업",
                    "now": now
                })
                plan_id = plan_result.scalar()
                
                await conn.execute(text("""
                    INSERT INTO worker_allocations (plan_id, worker_id, role)
                    VALUES (:plan_id, :worker_id, '반장')
                """), {"plan_id": plan_id, "worker_id": worker1_id})
                print(f"[OK] 작업 계획 생성 및 배정: {added_workers[0][2]} -> {zone_list[0].name}")
        
        # 6. 출석 데이터 추가
        for user_id, username, full_name, job_type in added_workers:
            existing_attendance = await conn.execute(text("""
                SELECT id FROM attendance WHERE user_id = :user_id AND date = :today
            """), {"user_id": user_id, "today": today})
            
            if not existing_attendance.scalar():
                await conn.execute(text("""
                    INSERT INTO attendance (user_id, project_id, date, check_in_time, status, check_in_method)
                    VALUES (:user_id, :project_id, :today, '07:30:00', 'PRESENT', 'APP')
                """), {"user_id": user_id, "project_id": project_id, "today": today})
                print(f"[OK] 출석 데이터 생성: {full_name}")
    
    print("\n[DONE] 작업자 추가 완료!")
    print("--------------------------------------------------")
    print("추가된 작업자 (비밀번호: 0000):")
    for user_id, username, full_name, job_type in added_workers:
        print(f"  - {username} / {full_name} ({job_type})")
    print("--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(add_workers())
