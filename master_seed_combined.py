
import os
import asyncio
import bcrypt
import random
import subprocess
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from back.database import fetch_one, fetch_all, execute, insert_and_return
from local_db_backup import run_backup

# =================================================================
# [GOLDEN SEED] 통합 마스터 시드 (v6 - Comprehensive Version)
# - 이전 v1, v3, v4, v5 버전의 모든 시나리오와 리얼리티 데이터를 통합함.
# - 프로젝트의 '진실의 원천' 시드 데이터 파일로 관리됨.
# =================================================================

async def master_seed_combined():
    # 0. 시딩 전 자동 백업 실행
    print("💾 Seeding start: Running automatic backup...")
    success, backup_path = run_backup()
    if success:
        print(f"✅ Pre-seed backup created at: {backup_path}")
    else:
        print("⚠️ Pre-seed backup failed. Proceeding with caution...")
    
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
    print("🚀 PHASE 1: Seeding Companies...")
    c_client = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('서울도시공사', 'CLIENT', '공공기관/발주처') RETURNING id"))['id']
    c_const = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('스마트종합건설', 'CONSTRUCTOR', '종합건설') RETURNING id"))['id']
    c_partner1 = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('강철토공', 'PARTNER', '토공/철근콘크리트') RETURNING id"))['id']
    c_partner2 = (await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('번개전기', 'PARTNER', '전기/소방') RETURNING id"))['id']

    # --- PHASE 2: 사용자 (Users) ---
    print("🚀 PHASE 2: Seeding Users (Admin, Staff, Workers)...")
    
    # 2.1 관리 계정
    admins = [
        ("a", "관리자", "admin", c_const, "시스템관리자"),
        ("m", "이소장", "manager", c_const, "현장소장"),
        ("sm", "김안전", "safety_manager", c_const, "안전관리자"),
        ("client_user", "박발주", "client", c_client, "감독관"),
    ]
    for un, fn, r, cid, jt in admins:
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES (:u, :p, :f, :r, :c, :jt)",
                      {"u": un, "p": hashed_pw, "f": fn, "r": r, "c": cid, "jt": jt})

    # 2.2 강철토공 워커 (15명)
    for i in range(1, 16):
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES (:u, :p, :f, 'worker', :c, '형틀공')",
                      {"u": f"p1_w_{i}", "p": hashed_pw, "f": f"강철_{i}", "c": c_partner1})
    
    # 2.3 번개전기 워커 (12명)
    for i in range(1, 13):
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES (:u, :p, :f, 'worker', :c, '전기공')",
                      {"u": f"p2_w_{i}", "p": hashed_pw, "f": f"번개_{i}", "c": c_partner2})
    
    # 2.4 특수 인물 (w - 박팀장)
    await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES ('w', :p, '박팀장', 'worker', :c, '팀장')",
                  {"p": hashed_pw, "c": c_partner1})

    # 2.5 대기자 (5명)
    for i in range(1, 6):
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, job_title) VALUES (:u, :p, :f, 'worker', :c, '미지정')",
                      {"u": f"pending_{i}", "p": hashed_pw, "f": f"대기자_{i}", "c": c_partner1})

    # --- PHASE 3: 프로젝트 및 구역 (Project & Zones) ---
    print("🚀 PHASE 3: Creating Project & Grid (B1-3F, 5x5)...")
    proj = await insert_and_return("""
        INSERT INTO project_master (name, status, grid_cols, grid_rows, grid_spacing, grid_angle, lat, lng, floors_above, floors_below)
        VALUES ('건설안전 가산디지털 현장', 'ACTIVE', 5, 5, 10.0, 0.0, 37.4772, 126.8841, 3, 1) RETURNING id
    """, {})
    pid = proj['id']

    for lv in ["B1", "1F", "2F", "3F"]:
        for r in range(5):
            for c in range(5):
                name = f"{lv}-{chr(65+r)}{c+1}"
                await execute("INSERT INTO project_zones (project_id, name, level, row_index, col_index) VALUES (:p, :n, :l, :ri, :ci)",
                              {"p": pid, "n": name, "l": lv, "ri": r, "ci": c})

    # --- PHASE 4: 멤버십 (Membership/Project Users) ---
    print("🚀 PHASE 4: Connecting Companies & Active Users to Project...")
    # 업체 연결
    for cid, role in [(c_client, 'CLIENT'), (c_const, 'CONSTRUCTOR'), (c_partner1, 'PARTNER'), (c_partner2, 'PARTNER')]:
        await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:p, :c, :r)", {"p": pid, "c": cid, "r": role})

    # 관리자 전원 투입
    await execute("""
        INSERT INTO project_users (project_id, user_id, role_name, status) 
        SELECT :p, id, role, 'ACTIVE' FROM sys_users WHERE role IN ('admin', 'manager', 'safety_manager', 'client')
    """, {"p": pid})

    # 협력사 현장 투입 인원 (강철 1~10번 + 팀장w , 번개 1~8번)
    await execute("""
        INSERT INTO project_users (project_id, user_id, role_name, status) 
        SELECT :p, id, 'worker', 'ACTIVE' FROM sys_users 
        WHERE (username LIKE 'p1_w_%' AND CAST(SUBSTRING(username, 6) AS INTEGER) <= 10) OR username = 'w'
    """, {"p": pid})
    await execute("""
        INSERT INTO project_users (project_id, user_id, role_name, status) 
        SELECT :p, id, 'worker', 'ACTIVE' FROM sys_users 
        WHERE username LIKE 'p2_w_%' AND CAST(SUBSTRING(username, 6) AS INTEGER) <= 8
    """, {"p": pid})

    # 대기자/미투입 인원은 PENDING 상태로 (시나리오상 승인 대기 기능 테스트용)
    await execute("""
        INSERT INTO project_users (project_id, user_id, role_name, status) 
        SELECT :p, id, 'worker', 'PENDING' FROM sys_users 
        WHERE (username LIKE 'p1_w_%' AND CAST(SUBSTRING(username, 6) AS INTEGER) > 10) 
           OR (username LIKE 'p2_w_%' AND CAST(SUBSTRING(username, 6) AS INTEGER) > 8)
           OR username LIKE 'pending_%'
    """, {"p": pid})

    # --- PHASE 5: 마스터 콘텐츠 (Content Master) ---
    print("🚀 PHASE 5: Seeding Work Templates & Danger Types...")
    work_templates = [
        {"wt": "철근조립", "brs": 30, "ci": '["안전모", "발판", "결속"]'},
        {"wt": "거푸집 설치", "brs": 40, "ci": '["동바리", "수평", "추락방지망"]'},
        {"wt": "비계 설치", "brs": 50, "ci": '["결속력", "난간", "바닥고정"]'},
        {"wt": "전기 배선", "brs": 20, "ci": '["절연장갑", "차단기", "전선정리"]'},
    ]
    template_ids = {}
    for t in work_templates:
        res = await insert_and_return("INSERT INTO content_work_info (work_type, base_risk_score, checklist_items) VALUES (:wt, :brs, :ci) RETURNING id", t)
        template_ids[t['wt']] = res['id']

    dangers = [
        {"type": "굴착 (Excavation)", "icon": "AlertTriangle", "color": "#FF0000", "desc": "깊은 굴착부 추락 위험"},
        {"type": "개구부 (Opening)", "icon": "Skull", "color": "#FF4D4D", "desc": "슬래브 개구부 추락 위험"},
        {"type": "화기 (Fire)", "icon": "Flame", "color": "#FFA500", "desc": "용접 작업 중 화재 위험"}
    ]
    danger_map = {}
    for d in dangers:
        res_d = await insert_and_return("""
            INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) 
            VALUES (:t, :i, :c, :d, 4) RETURNING id
        """, {"t": d['type'], "i": d['icon'], "c": d['color'], "d": d['desc']})
        danger_map[d['type']] = res_d['id']

    # --- PHASE 6: 작업 계획 (Today's Work Plans) ---
    print("🚀 PHASE 6: Creating Daily Work Plans...")
    p_scenarios = [
        {"z": "1F-A1", "t": "철근조립", "desc": "1F-A1 구역 기둥 철근 배근"},
        {"z": "1F-B2", "t": "거푸집 설치", "desc": "1F-B2 구역 보 거푸집 조립"},
        {"z": "1F-C3", "t": "전기 배선", "desc": "1F-C3 구역 1층 메인 배선"},
    ]
    plan_ids = []
    for p in p_scenarios:
        zone = await fetch_one("SELECT id FROM project_zones WHERE name = :n", {"n": p['z']})
        res_p = await insert_and_return("""
            INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, status) 
            VALUES (:pid, :zid, :wid, :d, :desc, 'IN_PROGRESS') RETURNING id
        """, {"pid": pid, "zid": zone['id'], "wid": template_ids[p['t']], "d": today, "desc": p['desc']})
        plan_ids.append(res_p['id'])
        
        # 특정 작업자 배정 (박팀장 - A1)
        if p['z'] == '1F-A1':
            worker_w = await fetch_one("SELECT id FROM sys_users WHERE username = 'w'")
            await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (:pl, :u)", {"pl": res_p['id'], "u": worker_w['id']})

    # --- PHASE 7: 리얼리티 액티비티 (Reality Activity - v5 통합) ---
    print("🚀 PHASE 7: Generating Realistic Attendance & Safety Logs (Daily Reality)...")
    active_project_workers = await fetch_all("""
        SELECT u.id, u.username FROM sys_users u
        JOIN project_users pu ON u.id = pu.user_id
        WHERE pu.project_id = :pid AND pu.status = 'ACTIVE' AND u.role = 'worker'
    """, {"pid": pid})
    
    stats = {"present": 0, "safety": 0}
    for w in active_project_workers:
        uid = w['id']
        # 85% 출근 확률
        if random.random() < 0.85 or w['username'] == 'w':
            stats["present"] += 1
            h = random.randint(6, 8)
            m = random.randint(0, 59)
            in_time = datetime.combine(today, datetime.min.time()).replace(hour=h, minute=m)
            
            # 출근 기록
            await execute("INSERT INTO daily_attendance (user_id, project_id, date, check_in_time, status) VALUES (:u, :p, :d, :in_t, 'PRESENT')",
                          {"u": uid, "p": pid, "d": today, "in_t": in_time})
            
            # 75% 안전 점검 확률
            if random.random() < 0.75 or w['username'] == 'w':
                stats["safety"] += 1
                await execute("""
                    INSERT INTO daily_safety_logs (user_id, project_id, log_type, note, created_at)
                    VALUES (:uid, :pid, 'TBM', '작업 전 안전점검 완료', :t)
                """, {"uid": uid, "pid": pid, "t": in_time + timedelta(minutes=random.randint(5, 20))})

    # --- PHASE 8: 위험 구역 및 공지사항 (Dangers & Reality Samples) ---
    print("🚀 PHASE 8: Seeding Comprehensive Dangers & Notices...")
    admin_u = await fetch_one("SELECT id FROM sys_users WHERE username = 'a'")
    
    # 8.1 위험 구역 1: 1F-B2 굴착부 (이미지 2장 연동)
    zone_b2 = await fetch_one("SELECT id FROM project_zones WHERE name = '1F-B2'")
    dz1 = await insert_and_return("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description, status, reporter_id)
        VALUES (:zid, :did, :d, 'A동 방면 터파기 굴착부 - 추락 주의 및 접근 금지', 'APPROVED', :uid) RETURNING id
    """, {"zid": zone_b2['id'], "did": danger_map["굴착 (Excavation)"], "d": today, "uid": admin_u['id']})
    
    # v1_backup의 이미지 전수 복원
    images1 = [
        ("63_47953b434dcb434a97251c5f5709847d.jpg", "굴착 현장 전경"),
        ("64_de9e241c775042648face74266581eaf.jpg", "굴착 하부 작업구역")
    ]
    for img, note in images1:
        await execute("INSERT INTO daily_danger_images (danger_zone_id, image_url, note) VALUES (:dzid, :url, :note)", 
                      {"dzid": dz1['id'], "url": img, "note": note})

    # 8.2 위험 구역 2: 1F-C3 개구부 (이미지 2장 연동)
    zone_c3 = await fetch_one("SELECT id FROM project_zones WHERE name = '1F-C3'")
    dz2 = await insert_and_return("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description, status, reporter_id)
        VALUES (:zid, :did, :d, '슬래브 중합 개구부 덮개 불량 및 탈락 위험', 'APPROVED', :uid) RETURNING id
    """, {"zid": zone_c3['id'], "did": danger_map["개구부 (Opening)"], "d": today, "uid": admin_u['id']})
    
    images2 = [
        ("66_6fa95652fcec454495e9ed669dbbe9fe.png", "개구부 미조치 방치 현장"),
        ("67_39772e2930bf4fb5bca8497b9a3b44b3.jpg", "개구부 주변 안전띠 미설치")
    ]
    for img, note in images2:
        await execute("INSERT INTO daily_danger_images (danger_zone_id, image_url, note) VALUES (:dzid, :url, :note)", 
                      {"dzid": dz2['id'], "url": img, "note": note})

    # 8.3 공지사항 (v1-v4 통합 시나리오 반영)
    notices = [
        {"t": "오후 강풍 주의보 발생", "c": "오후 2시부터 강풍이 예상됩니다. 고소 작업 시 안전고리 체결을 철저히 하고 자재 비산에 주의하십시오.", "nt": "EMERGENCY"},
        {"t": "현장 정리정돈 및 통로 확보", "c": "금일 작업 종료 후 통로 내 적재된 자재를 정리하여 안전 통로를 확보해주시기 바랍니다.", "nt": "NORMAL"},
    ]
    for n in notices:
        await execute("INSERT INTO daily_notices (project_id, date, title, content, notice_type, created_by) VALUES (:p, :d, :t, :c, :nt, :u)",
                      {"p": pid, "d": today, "t": n['t'], "c": n['c'], "nt": n['nt'], "u": admin_u['id']})

    print("-" * 50)
    print("✨ [GOLDEN SEED COMPLETED - FULL RECOVERY]")
    print(f"📊 Summary: DANGERS {2} | IMAGES {4} | NOTICES {2} | WORKERS {len(active_project_workers)}")
    print(f"🔗 Manager Dashboard: http://localhost:3500/manager/attendance")
    print("-" * 50)

if __name__ == "__main__":
    asyncio.run(master_seed_combined())
