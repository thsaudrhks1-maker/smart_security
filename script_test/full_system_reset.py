
import asyncio
import bcrypt
from datetime import date, datetime
from back.database import engine, execute, Base

async def full_reset():
    print("=== 시스템 최강 초기화 및 시딩 시작 ===")
    
    # 1. 패스워드 해싱 (0000)
    password = "0000".encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(password, salt).decode('utf-8')

    # 2. 테이블 초기화
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    tables = [
        "daily_worker_allocations", "daily_work_tasks", "daily_danger_images", "daily_danger_zones",
        "project_zones", "project_members", "project_companies", "project_sites",
        "sys_users", "project_master", "sys_companies", "content_work_templates"
    ]
    for table in tables:
        try: await execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE")
        except: pass

    # 3. 기초 데이터
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)안전건설', 'GENERAL', '종합건설')")
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('건축작업', 40), ('토목작업', 80), ('전기작업', 20)")

    # 4. 프로젝트 생성 (B1, 1F, 2F)
    await execute("""
        INSERT INTO project_master (name, status, lat, lng, grid_cols, grid_rows, grid_spacing, floors_above, floors_below)
        VALUES ('세종대로 스마트 신축현장', 'ACTIVE', 37.5665, 126.9780, 5, 5, 10.0, 2, 1)
    """)
    await execute("INSERT INTO project_sites (project_id, name, address) VALUES (1, '세종대로 1공구', '서울특별시 중구 세종대로 110')")

    # 5. 계정 생성 (sys_users + project_members)
    users = [
        ("admin", "admin", "현장 총괄 관리자"),
        ("manager1", "manager", "안전 관리자 A"),
        ("worker1", "worker", "건축공 홍길동"),
        ("worker2", "worker", "건축공 김철수"),
        ("worker3", "worker", "건축공 이영희"),
        ("worker4", "worker", "토목공 박민수"),
        ("worker5", "worker", "토목공 정광호"),
    ]
    for i, (username, role, full_name) in enumerate(users):
        uid = i + 1
        await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, company_id) VALUES (:u, :p, :r, :f, 1)", 
                   {"u": username, "p": hashed_pw, "r": role, "f": full_name})
        await execute("INSERT INTO project_members (project_id, user_id, role_name) VALUES (1, :uid, :role)", {"uid": uid, "role": role})

    # 6. 구역 생성 (B1, 1F, 2F) - 필드명: row_index, col_index
    for level in ["B1", "1F", "2F"]:
        for r in range(5):
            for c in range(5):
                zone_name = f"{level}-{chr(65+c)}{r+1}"
                await execute("""
                    INSERT INTO project_zones (project_id, site_id, level, name, row_index, col_index)
                    VALUES (1, 1, :l, :n, :r, :c)
                """, {"l": level, "n": zone_name, "r": r, "c": c})

    # 7. 일일 시나리오 (오늘)
    today = date.today()
    # 1F-C3 (ID 38) 건축
    await execute("INSERT INTO daily_work_tasks (site_id, zone_id, template_id, date, description, calculated_risk_score, status) VALUES (1, 38, 1, :d, '1층 로비 골조 포설', 45, 'IN_PROGRESS')", {"d": today})
    # B1-A1 (ID 1) 토목
    await execute("INSERT INTO daily_work_tasks (site_id, zone_id, template_id, date, description, calculated_risk_score, status) VALUES (1, 1, 2, :d, '지하 1층 옹벽 터파기', 75, 'IN_PROGRESS')", {"d": today})
    # 2F-E5 (ID 75) 위험
    await execute("INSERT INTO daily_danger_zones (zone_id, date, risk_type, description) VALUES (75, :d, 'DANGER', '상부 자재 반입구 - 낙하 주의')", {"d": today})

    # 8. 인원 할당
    for uid in [3, 4, 5]: await execute("INSERT INTO daily_worker_allocations (plan_id, worker_id, role) VALUES (1, :uid, 'GENERAL')", {"uid": uid})
    for uid in [6, 7]: await execute("INSERT INTO daily_worker_allocations (plan_id, worker_id, role) VALUES (2, :uid, 'GENERAL')", {"uid": uid})

    print("=== 시스템 최강 시딩 완료! 비번 0000 ===")

if __name__ == "__main__":
    asyncio.run(full_reset())
