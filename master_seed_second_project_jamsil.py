
import asyncio
import bcrypt
import random
from datetime import date, datetime, timedelta
from back.database import fetch_one, execute, insert_and_return

async def seed_jamsil_project():
    print("🚀 Seeding PHASE: Jamsil Smart Tower (Second Project)...")
    
    hashed_pw = bcrypt.hashpw("0000".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    today = date.today()

    # --- PHASE 1: 업체 (Companies for Jamsil) ---
    print("🏢 Creating Jamsil Companies...")
    c_client = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('잠실도시공사', 'CLIENT', '공공기관/발주처') RETURNING id"))['id']
    c_const = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('롯데건설', 'CONSTRUCTOR', '종합건설') RETURNING id"))['id']
    c_partner1 = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('잠실철강', 'PARTNER', '철근콘크리트') RETURNING id"))['id']

    # --- PHASE 2: 사용자 (Users for Jamsil) ---
    print("👥 Creating Jamsil Project Users (m1, w1, sys_user)...")
    
    # 2.1 m1 (잠실 현장소장)
    m1_id = (await insert_and_return("""
        INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) 
        VALUES ('m1', :p, '잠실 이소장', 'manager', :c, '현장소장') RETURNING id
    """, {"p": hashed_pw, "c": c_const}))['id']

    # 2.2 w1 (잠실 워커)
    w1_id = (await insert_and_return("""
        INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) 
        VALUES ('w1', :p, '잠실 박팀장', 'worker', :c, '팀장') RETURNING id
    """, {"p": hashed_pw, "c": c_partner1}))['id']

    # 2.3 sys_user (시스템 사용자 테스트용)
    sys_user_id = (await insert_and_return("""
        INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) 
        VALUES ('sys_user', :p, '시스템사용자', 'worker', :c, '기능공') RETURNING id
    """, {"p": hashed_pw, "c": c_partner1}))['id']

    # --- PHASE 3: 프로젝트 및 구역 (Project & Zones) ---
    print("🏗️ Creating Jamsil Project & Grid (B1-2F, 3x3, Angle 15deg)...")
    # 잠실 롯데월드타워 부근: 37.5133, 127.1001
    proj = await insert_and_return("""
        INSERT INTO project_master (name, status, grid_cols, grid_rows, grid_spacing, grid_angle, lat, lng, floors_above, floors_below)
        VALUES ('잠실 스마트 시큐리티 타워', 'ACTIVE', 3, 3, 10.0, 15.0, 37.5133, 127.1001, 2, 1) RETURNING id
    """, {})
    pid = proj['id']

    # 3x3 구역 생성 (B1, 1F, 2F)
    for lv in ["B1", "1F", "2F"]:
        for r in range(3):
            for c in range(3):
                name = f"{lv}-{chr(65+r)}{c+1}"
                await execute("INSERT INTO project_zones (project_id, name, level, row_index, col_index) VALUES (:p, :n, :l, :ri, :ci)",
                              {"p": pid, "n": name, "l": lv, "ri": r, "ci": c})

    # --- PHASE 4: 멤버십 연동 (Project Associations) ---
    print("🔗 Linking Companies and Users to Jamsil Project...")
    
    # 업체 연결
    for cid, role in [(c_client, 'CLIENT'), (c_const, 'CONSTRUCTOR'), (c_partner1, 'PARTNER')]:
        await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:p, :c, :r)", {"p": pid, "c": cid, "r": role})

    # 사용자 투입 (m1, w1, sys_user)
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (:p, :u, 'manager', 'ACTIVE')", {"p": pid, "u": m1_id})
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (:p, :u, 'worker', 'ACTIVE')", {"p": pid, "u": w1_id})
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (:p, :u, 'worker', 'ACTIVE')", {"p": pid, "u": sys_user_id})

    # --- PHASE 5: 작업 계획 (Today's Work Plans for Testing) ---
    print("📝 Assigning Work Plans to Jamsil Workers...")
    
    # 작업자들에게 구역 하나씩 할당 (보라색 박스 확인용)
    zone_1f_a1 = (await fetch_one("SELECT id FROM project_zones WHERE project_id = :pid AND name = '1F-A1'", {"pid": pid}))['id']
    zone_1f_b2 = (await fetch_one("SELECT id FROM project_zones WHERE project_id = :pid AND name = '1F-B2'", {"pid": pid}))['id']
    
    # content_work_info가 있는지 확인 (없으면 기본값 사용)
    work_info = await fetch_one("SELECT id FROM content_work_info LIMIT 1")
    wid = work_info['id'] if work_info else 1 # 대충 1번 소환

    # w1에게 A1 할당
    plan_w1 = (await insert_and_return("""
        INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, status) 
        VALUES (:pid, :zid, :wid, :d, '잠실 1층 A1 철근 작업', 'IN_PROGRESS') RETURNING id
    """, {"pid": pid, "zid": zone_1f_a1, "wid": wid, "d": today}))['id']
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (:pl, :u)", {"pl": plan_w1, "u": w1_id})

    # sys_user에게 B2 할당
    plan_sys = (await insert_and_return("""
        INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, status) 
        VALUES (:pid, :zid, :wid, :d, '잠실 1층 B2 거푸집 작업', 'IN_PROGRESS') RETURNING id
    """, {"pid": pid, "zid": zone_1f_b2, "wid": wid, "d": today}))['id']
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (:pl, :u)", {"pl": plan_sys, "u": sys_user_id})

    print("-" * 50)
    print("✅ Jamsil Project Seeding Completed!")
    print(f"📍 Location: Jamsil (37.5133, 127.1001)")
    print(f"🏢 Manager: m1 | PW: 0000")
    print(f"👷 Workers: w1, sys_user | PW: 0000")
    print("-" * 50)

if __name__ == "__main__":
    asyncio.run(seed_jamsil_project())
