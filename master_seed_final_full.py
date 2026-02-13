
import os
import asyncio
import bcrypt
import random
from datetime import date, datetime, timedelta
from back.database import fetch_one, fetch_all, execute, insert_and_return

# =================================================================
# [GOLDEN SEED] 통합 마스터 시드 (v9 - Complete Full Version)
# - 가산디지털(P1) 및 잠실스마트타워(P2)의 모든 시나리오 통합
# - 총 2개 프로젝트, 수십 명의 인원, 실제와 같은 데이터 생성
# =================================================================

async def master_seed_full():
    print("🧹 Phase 0: Fresh Start (Cleaning all tables)...")
    await execute("""
        TRUNCATE sys_companies, sys_users, project_master, project_zones, 
                 project_companies, project_users, daily_work_plans, 
                 daily_worker_users, daily_attendance, daily_notices, daily_safety_logs,
                 daily_danger_zones, daily_danger_images, content_work_info, content_danger_info, 
                 daily_notice_reads, content_safety_gear, content_work_gear_map,
                 daily_violations, daily_weather
        RESTART IDENTITY CASCADE
    """)

    hashed_pw = bcrypt.hashpw("0000".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    today = date.today()

    # --- PHASE 1: 업체 (Companies) ---
    print("🚀 PHASE 1: Seeding Companies for both projects...")
    # P1용 (가산)
    c_p1_client = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('서울도시공사', 'CLIENT', '공공기관/발주처') RETURNING id"))['id']
    c_p1_const = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('스마트종합건설', 'CONSTRUCTOR', '종합건설') RETURNING id"))['id']
    c_p1_partner1 = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('강철토공', 'PARTNER', '토공/철근콘크리트') RETURNING id"))['id']
    c_p1_partner2 = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('번개전기', 'PARTNER', '전기/소방') RETURNING id"))['id']
    
    # P2용 (잠실)
    c_p2_client = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('잠실도시공사', 'CLIENT', '공공기관/발주처') RETURNING id"))['id']
    c_p2_const = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('롯데건설', 'CONSTRUCTOR', '종합건설') RETURNING id"))['id']
    c_p2_partner1 = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('잠실철강', 'PARTNER', '철근콘크리트') RETURNING id"))['id']

    # --- PHASE 2: 사용자 (Users) ---
    print("🚀 PHASE 2: Seeding Users (Comprehensive List)...")
    
    # 2.1 가산 프로젝트 관리 및 테스트 계정
    admins = [
        ("a", "관리자", "admin", c_p1_const, "시스템관리자"),
        ("m", "이소장", "manager", c_p1_const, "현장소장"),
        ("sm", "김안전", "safety_manager", c_p1_const, "안전관리자"),
        ("client_user", "박발주", "client", c_p1_client, "감독관"),
    ]
    for un, fn, r, cid, jt in admins:
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES (:u, :p, :f, :r, :c, :jt)",
                      {"u": un, "p": hashed_pw, "f": fn, "r": r, "c": cid, "jt": jt})

    # 2.2 가산 프로젝트 워커들 루프 (생략 없이 생성)
    # 강철토공 워커 (15명)
    for i in range(1, 16):
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES (:u, :p, :f, 'worker', :c, '형틀공')",
                      {"u": f"p1_w_{i}", "p": hashed_pw, "f": f"강철_{i}", "c": c_p1_partner1})
    # 번개전기 워커 (12명)
    for i in range(1, 13):
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES (:u, :p, :f, 'worker', :c, '전기공')",
                      {"u": f"p2_w_{i}", "p": hashed_pw, "f": f"번개_{i}", "c": c_p1_partner2})
    # 박팀장(w)
    await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES ('w', :p, '박팀장', 'worker', :c, '팀장')",
                  {"p": hashed_pw, "c": c_p1_partner1})

    # 2.3 잠실 프로젝트 전용 계정
    m1_id = (await insert_and_return("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES ('m1', :p, '잠실 이소장', 'manager', :c, '현장소장') RETURNING id", {"p": hashed_pw, "c": c_p2_const}))['id']
    w1_id = (await insert_and_return("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES ('w1', :p, '잠실 박팀장', 'worker', :c, '팀장') RETURNING id", {"p": hashed_pw, "c": c_p2_partner1}))['id']
    sys_user_id = (await insert_and_return("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES ('sys_user', :p, '시스템사용자', 'worker', :c, '기능공') RETURNING id", {"p": hashed_pw, "c": c_p2_partner1}))['id']

    # --- PHASE 3: 프로젝트 1 (가산 - 5x5, 0deg) ---
    print("🚀 PHASE 3: Creating Project 1 (Gasan 5x5)...")
    proj1 = await insert_and_return("""
        INSERT INTO project_master (name, status, grid_cols, grid_rows, grid_spacing, grid_angle, lat, lng, floors_above, floors_below)
        VALUES ('건설안전 가산디지털 현장', 'ACTIVE', 5, 5, 10.0, 0.0, 37.4772, 126.8841, 3, 1) RETURNING id
    """, {})
    pid1 = proj1['id']
    for lv in ["B1", "1F", "2F", "3F"]:
        for r in range(5):
            for c in range(5):
                name = f"{lv}-{chr(65+r)}{c+1}"
                await execute("INSERT INTO project_zones (project_id, name, level, row_index, col_index) VALUES (:p, :n, :l, :ri, :ci)",
                              {"p": pid1, "n": name, "l": lv, "ri": r, "ci": c})

    # --- PHASE 4: 프로젝트 2 (잠실 - 3x3, 15deg) ---
    print("🚀 PHASE 4: Creating Project 2 (Jamsil 3x3, 15deg)...")
    proj2 = await insert_and_return("""
        INSERT INTO project_master (name, status, grid_cols, grid_rows, grid_spacing, grid_angle, lat, lng, floors_above, floors_below)
        VALUES ('잠실 스마트 시큐리티 타워', 'ACTIVE', 3, 3, 10.0, 15.0, 37.5133, 127.1001, 2, 1) RETURNING id
    """, {})
    pid2 = proj2['id']
    for lv in ["B1", "1F", "2F"]:
        for r in range(3):
            for c in range(3):
                name = f"{lv}-{chr(65+r)}{c+1}"
                await execute("INSERT INTO project_zones (project_id, name, level, row_index, col_index) VALUES (:p, :n, :l, :ri, :ci)",
                              {"p": pid2, "n": name, "l": lv, "ri": r, "ci": c})

    # --- PHASE 5: 멤버십 (Membership) ---
    print("🚀 PHASE 5: Connecting Companies & Users...")
    # 프로젝트 1 멤버십
    for cid, role in [(c_p1_client, 'CLIENT'), (c_p1_const, 'CONSTRUCTOR'), (c_p1_partner1, 'PARTNER'), (c_p1_partner2, 'PARTNER')]:
        await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:p, :c, :r)", {"p": pid1, "c": cid, "r": role})
    # 사용자 투입 (가산)
    await execute("""
        INSERT INTO project_users (project_id, user_id, role_name, status) 
        SELECT :p, id, role, 'ACTIVE' FROM sys_users WHERE username IN ('a', 'm', 'sm', 'client_user', 'w') OR username LIKE 'p1_w_%' OR username LIKE 'p2_w_%'
    """, {"p": pid1})

    # 프로젝트 2 멤버십
    for cid, role in [(c_p2_client, 'CLIENT'), (c_p2_const, 'CONSTRUCTOR'), (c_p2_partner1, 'PARTNER')]:
        await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:p, :c, :r)", {"p": pid2, "c": cid, "r": role})
    for uid, rname in [(m1_id, 'manager'), (w1_id, 'worker'), (sys_user_id, 'worker')]:
        await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (:p, :u, :r, 'ACTIVE')", {"p": pid2, "u": uid, "r": rname})

    # --- PHASE 6: 마스터 콘텐츠 (Work/Danger Types) ---
    print("🚀 PHASE 6: Seeding Work Templates...")
    work_templates = [
        {"wt": "철근조립", "brs": 30, "ci": '["안전모", "발판", "결속"]'},
        {"wt": "거푸집 설치", "brs": 40, "ci": '["동바리", "수평", "추락방지망"]'},
        {"wt": "전기 배선", "brs": 20, "ci": '["절연장갑", "차단기"]'}
    ]
    template_ids = {}
    for t in work_templates:
        res = await insert_and_return("INSERT INTO content_work_info (work_type, base_risk_score, checklist_items) VALUES (:wt, :brs, :ci) RETURNING id", t)
        template_ids[t['wt']] = res['id']

    d_info_id = (await insert_and_return("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('굴착', 'AlertTriangle', '#FF0000', '추락 위험', 4) RETURNING id"))['id']

    # --- PHASE 7: 가산 액티비티 (Real-world scenario) ---
    print("🚀 PHASE 7: Seeding Gasan Daily Activity...")
    z1 = (await fetch_one("SELECT id FROM project_zones WHERE project_id = :p AND name = '1F-A1'", {"p": pid1}))['id']
    plan1 = (await insert_and_return("INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, status) VALUES (:p, :z, :w, :d, '가산 철근 기둥 작업', 'IN_PROGRESS') RETURNING id",
                                     {"p": pid1, "z": z1, "w": template_ids["철근조립"], "d": today}))['id']
    w_id = (await fetch_one("SELECT id FROM sys_users WHERE username = 'w'"))['id']
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (:pl, :u)", {"pl": plan1, "u": w_id})

    # 가산 인원 랜덤 출석
    p1_active_workers = await fetch_all("SELECT user_id FROM project_users WHERE project_id = :p AND role_name = 'worker'", {"p": pid1})
    for w_row in p1_active_workers:
        if random.random() < 0.8:
            in_t = datetime.combine(today, datetime.min.time()).replace(hour=7, minute=random.randint(0,50))
            await execute("INSERT INTO daily_attendance (user_id, project_id, date, check_in_time, status) VALUES (:u, :p, :d, :it, 'PRESENT')",
                          {"u": w_row['user_id'], "p": pid1, "d": today, "it": in_t})
            if random.random() < 0.7:
                 await execute("INSERT INTO daily_safety_logs (user_id, project_id, log_type, note, created_at) VALUES (:u, :p, 'TBM', '안전체크완료', :t)",
                               {"u": w_row['user_id'], "p": pid1, "t": in_t + timedelta(minutes=10)})

    # --- PHASE 8: 잠실 액티비티 ---
    print("🚀 PHASE 8: Seeding Jamsil Daily Activity...")
    z2 = (await fetch_one("SELECT id FROM project_zones WHERE project_id = :p AND name = '1F-A1'", {"p": pid2}))['id']
    plan2 = (await insert_and_return("INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, status) VALUES (:p, :z, :w, :d, '잠실 A1 구획 정리', 'IN_PROGRESS') RETURNING id",
                                     {"p": pid2, "z": z2, "w": template_ids["철근조립"], "d": today}))['id']
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (:pl, :u)", {"pl": plan2, "u": w1_id})

    print("-" * 50)
    print("✨ [FULL GOLDEN SEED COMPLETED]")
    print(f"📊 Project 1 (Gasan): m/w/sm 계정 중심")
    print(f"📊 Project 2 (Jamsil): m1/w1/sys_user 계정 중심 (15도 회전)")
    print("-" * 50)

if __name__ == "__main__":
    asyncio.run(master_seed_full())
