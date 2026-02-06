
import asyncio
import os
import sys
import bcrypt
from sqlalchemy import text
from datetime import date, datetime

# 프로젝트 루트를 path에 추가 (back 모듈 찾기 위함)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

    # 1. 업체 (발주처 1, 시공사 1, 협력업체 5개)
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('서울특별시청', 'CLIENT', '공공기관')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)대한건설', 'CONSTRUCTOR', '종합건설')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)삼보목공', 'PARTNER', '목공/창호')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('대진경량', 'PARTNER', '내장/수납')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('현대토건', 'PARTNER', '토목골조')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('한국전기', 'PARTNER', '전기/통신')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('세종설비', 'PARTNER', '설비/배관')")

    # 1.1 작업 템플릿 (다양한 공종)
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('거푸집 설치 및 해체', 60)")
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('고소작업 (3m 이상)', 75)")
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('용접 및 절단작업', 65)")
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('중장비 운용', 70)")
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('전기배선 작업', 55)")
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('배관 설치', 50)")
    await execute("INSERT INTO content_work_templates (work_type, base_risk_score) VALUES ('내장 마감', 40)")

    # 2. 프로젝트
    await execute("""
        INSERT INTO project_master (name, status, location_address, lat, lng, grid_cols, grid_rows, grid_spacing, floors_above, floors_below)
        VALUES ('세종대로 스마트 신축현장', 'ACTIVE', '서울특별시 중구 세종대로 110 (태평로1가)', 37.5665, 126.9780, 5, 5, 20.0, 2, 1)
    """)

    # 3. 프로젝트-업체 관계 (발주처 1, 시공사 1, 협력업체 5개 모두 배정)
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 1, 'CLIENT')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 2, 'CONSTRUCTOR')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 3, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 4, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 5, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 6, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 7, 'PARTNER')")

    # 4. 시공사 관리자 및 안전관리자 (프로젝트 자동 승인)
    await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, company_id) VALUES ('admin', :p, 'admin', '시스템 관리자', 2)", {"p": hashed_pw})
    await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, company_id) VALUES ('manager1', :p, 'manager', '김소장 (대한건설)', 2)", {"p": hashed_pw})
    await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, company_id) VALUES ('safety1', :p, 'manager', '박안전 (대한건설)', 2)", {"p": hashed_pw})
    
    # 관리자는 자동 승인 (project_users에 바로 추가)
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, 1, 'admin', 'ACTIVE')")
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, 2, 'manager', 'ACTIVE')")
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, 3, 'safety_manager', 'ACTIVE')")

    # 5. 협력업체 소속 작업자들 (sys_users에만 등록, project_users 승인 대기)
    workers = [
        ("worker_mok1", "이목수", 3),  # 삼보목공
        ("worker_mok2", "최창호", 3),
        ("worker_mok3", "강기초", 3),
        ("worker_gyung1", "박내장", 4),  # 대진경량
        ("worker_gyung2", "정마감", 4),
        ("worker_to1", "김토목", 5),  # 현대토건
        ("worker_to2", "이골조", 5),
        ("worker_to3", "박철근", 5),
        ("worker_elec1", "최전기", 6),  # 한국전기
        ("worker_elec2", "정배선", 6),
        ("worker_pipe1", "한배관", 7),  # 세종설비
        ("worker_pipe2", "송설비", 7),
    ]
    
    uid_counter = 4  # admin(1), manager1(2), safety1(3) 다음부터
    for username, full_name, company_id in workers:
        await execute(
            "INSERT INTO sys_users (username, hashed_password, role, full_name, company_id) VALUES (:u, :p, 'worker', :f, :cid)",
            {"u": username, "p": hashed_pw, "f": full_name, "cid": company_id}
        )
        uid_counter += 1
    
    # 6. 일부 작업자만 관리자 승인 (project_users에 추가)
    # 삼보목공 3명 중 2명 승인, 대진경량 2명 중 1명 승인, 현대토건 3명 모두 승인
    approved_workers = [4, 5, 7, 9, 10, 11]  # user_id
    for uid in approved_workers:
        await execute(
            "INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, :uid, 'worker', 'ACTIVE')",
            {"uid": uid}
        )

    # 7. 구역 생성
    for level in ["B1", "1F", "2F"]:
        for r in range(5):
            for c in range(5):
                zone_name = f"{level}-{chr(65+c)}{r+1}"
                await execute("INSERT INTO project_zones (project_id, level, name, row_index, col_index) VALUES (1, :l, :n, :r, :c)", {"l": level, "n": zone_name, "r": r, "c": c})

    # 8. 작업 계획 및 인원 (승인된 작업자만 배정 가능)
    today = date.today()
    await execute("INSERT INTO daily_work_tasks (project_id, zone_id, template_id, date, description, calculated_risk_score, status) VALUES (1, 38, 1, :d, '1층 로비 거푸집 설치', 55, 'IN_PROGRESS')", {"d": today})
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id, role) VALUES (1, 9, 'GENERAL')")  # 김토목 (현대토건, 승인됨)

    print("\n=== System Reset Complete! ===")
    print("[OK] Client: 1 (Seoul City)")
    print("[OK] Constructor: 1 (Daehan Construction) - 2 managers auto-approved")
    print("[OK] Partners: 5 (Sambo Wood, Daejin Interior, Hyundai Civil, Korea Electric, Sejong Facility)")
    print("[OK] Work Templates: 7 (Formwork, High-altitude, Welding, Heavy Equipment, Electric, Piping, Finishing)")
    print("[OK] Partner Workers: 12 registered")
    print("   - Approved (project_users): 6 workers -> Can be assigned to tasks")
    print("   - Pending Approval: 6 workers -> Manager approval required")
    print("\n[Login Info]")
    print("   - admin / 0000 (System Admin)")
    print("   - manager1 / 0000 (Manager Kim)")
    print("   - safety1 / 0000 (Safety Manager Park)")
    print("   - worker_mok1 / 0000 (Lee Carpenter - Approved)")
    print("   - worker_to1 / 0000 (Kim Civil - Approved)")
    print("   - worker_elec1 / 0000 (Choi Electric - Pending)")

if __name__ == "__main__":
    asyncio.run(full_reset())
