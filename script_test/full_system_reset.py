
import asyncio
import bcrypt
from sqlalchemy import text
from datetime import date, datetime
from back.database import engine, execute, Base

async def full_reset():
    print("=== 시스템 최강 통합 초기화 (누락 테이블 복구 및 명칭 정립: link 제거) ===")
    
    password = "0000".encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(password, salt).decode('utf-8')

    async with engine.begin() as conn:
        print("--- DB 전체 스키마 강제 파괴 및 재생성 중 (CASCADE) ---")
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        
        print("--- 새 테이블 스키마 생성 중 (누락 테이블 포함)... ---")
        await conn.run_sync(Base.metadata.create_all)

    # 정립된 테이블 목록 (link 제거)
    tables = [
        "daily_worker_users", "daily_work_tasks", "daily_danger_images", "daily_danger_zones",
        "project_zones", "project_users", "project_companies",
        "sys_users", "project_master", "sys_companies", "content_work_templates",
        "daily_notices", "daily_violations" # 누락 복구 항목
    ]
    # CASCADE DROP을 했으므로 TRUNCATE는 필요 없지만 리스트 확인용

    # 1. 업체
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)대한건설', 'CONSTRUCTOR', '종합건설')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('서울특별시청', 'CLIENT', '공공기관')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)현대토건', 'PARTNER', '토목골조')")

    # 1.1 작업 템플릿
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('거푸집 설치 및 해체', 60)")

    # 2. 프로젝트
    await execute("""
        INSERT INTO project_master (name, status, location_address, lat, lng, grid_cols, grid_rows, grid_spacing, floors_above, floors_below)
        VALUES ('세종대로 스마트 신축현장', 'ACTIVE', '서울특별시 중구 세종대로 110 (태평로1가)', 37.5665, 126.9780, 5, 5, 20.0, 2, 1)
    """)

    # 3. 관계 배정 (Link 대신 정식 명칭)
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 1, 'CONSTRUCTOR'), (1, 2, 'CLIENT'), (1, 3, 'PARTNER')")

    # 4. 유저 및 멤버
    users = [
        ("admin", "admin", "시스템 관리자", 1),
        ("manager1", "manager", "대한건설 김소장", 1),
        ("worker1", "worker", "현대-목공 홍길동", 3),
    ]
    for i, (u, r, f, cid) in enumerate(users):
        uid = i + 1
        await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, company_id) VALUES (:u, :p, :r, :f, :cid)", {"u": u, "p": hashed_pw, "r": r, "f": f, "cid": cid})
        await execute("INSERT INTO project_users (project_id, user_id, role_name) VALUES (1, :uid, :r)", {"uid": uid, "r": r})

    # 5. 구역 생성
    for level in ["B1", "1F", "2F"]:
        for r in range(5):
            for c in range(5):
                zone_name = f"{level}-{chr(65+c)}{r+1}"
                await execute("INSERT INTO project_zones (project_id, level, name, row_index, col_index) VALUES (1, :l, :n, :r, :c)", {"l": level, "n": zone_name, "r": r, "c": c})

    # 6. 작업 계획 및 인원
    today = date.today()
    await execute("INSERT INTO daily_work_tasks (project_id, zone_id, template_id, date, description, calculated_risk_score, status) VALUES (1, 38, 1, :d, '1층 로비 거푸집 설치', 55, 'IN_PROGRESS')", {"d": today})
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id, role) VALUES (1, 3, 'GENERAL')")

    print("=== 시스템 통합 대혁신 복구 및 리셋 완료! ===")
    print("복구된 테이블: notices, violations, weather 등 전체")
    print("수정된 명칭: project_companies, daily_danger_images (link 제거)")

if __name__ == "__main__":
    asyncio.run(full_reset())
