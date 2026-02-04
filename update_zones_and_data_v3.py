import asyncio
import sys
import os
from datetime import datetime, date

# 프로젝트 루트 경로를 파이썬 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from back.database import execute, fetch_one, insert_and_return, fetch_all

async def update_zones_and_data_v3():
    print("🚀 풍성한 더미 데이터 시딩 시작 (v3)...")
    
    # 1. Site ID 조회
    site = await fetch_one("SELECT id FROM sites ORDER BY id DESC LIMIT 1")
    if not site:
        print("❌ 현장(Site) 데이터가 없습니다. 먼저 reset_scenario.py를 실행하세요.")
        return
    site_id = site['id']

    # 2. 관련 데이터 초기화
    print("🗑️ 기존 데이터 청소 중...")
    await execute("DELETE FROM daily_danger_zones WHERE zone_id IN (SELECT id FROM zones WHERE site_id = :site_id)", {"site_id": site_id})
    await execute("DELETE FROM worker_allocations WHERE plan_id IN (SELECT id FROM daily_work_plans WHERE site_id = :site_id)", {"site_id": site_id})
    await execute("DELETE FROM daily_work_plans WHERE site_id = :site_id", {"site_id": site_id})
    await execute("DELETE FROM zones WHERE site_id = :site_id", {"site_id": site_id})
    
    # 3. 모든 사용자 정보 확인
    users = await fetch_all("SELECT id, full_name, role FROM users ORDER BY id")
    
    # 모든 근로자(worker) ID 가져오기
    all_workers = [u['id'] for u in users if u['role'] == 'worker']
    if not all_workers:
        print("❌ 근로자(worker) 데이터가 없습니다.")
        return
        
    if len(all_workers) < 6:
        # 부족하면 있는 사람이라도 돌려막기
        worker_ids = (all_workers * 2)[:6]
    else:
        worker_ids = all_workers[:6]
    
    print(f"👷 사용 가능한 근로자 ID: {worker_ids}")

    # 4. 현실적인 이름 맵 (재사용)
    grid_names = [
        ["북측 발코니", "북측 복도A", "북측 복도B", "EV홀 상부", "탕비실(북)"],
        ["임원실A", "사무공간A", "회의실(대)", "중앙 복도A", "전산실"],
        ["E/V 1호기", "계단실(A)", "메인 로비", "안내데스크", "라운지"],
        ["사무공간B", "회의실(소)", "창고A", "자재보관실", "공용 화장실"],
        ["남측 복도", "메인 출입구", "기계 설비실", "전기실", "주차램프입구"]
    ]

    # 5. 구역 생성
    center_lat, center_lng = 37.56600, 126.97800
    step = 0.00025
    new_zone_map = {} # {(r,c): id}
    
    for r in range(5):
        for c in range(5):
            lat = round(center_lat + (2 - r) * step, 6)
            lng = round(center_lng + (c - 2) * step, 6)
            name = grid_names[r][c]
            
            zone_type = "INDOOR"
            if "발코니" in name or "출입구" in name: zone_type = "OUTDOOR"
            elif "전기" in name or "기계" in name: zone_type = "DANGER"

            sql = "INSERT INTO zones (site_id, name, level, type, lat, lng) VALUES (:site_id, :name, '1F', :type, :lat, :lng) RETURNING id"
            res = await insert_and_return(sql, {"site_id": site_id, "name": name, "type": zone_type, "lat": lat, "lng": lng})
            new_zone_map[(r, c)] = res['id']

    # 6. 템플릿 로드
    templates = await fetch_all("SELECT id, work_type FROM work_templates")
    def get_tid(keyword):
        for t in templates:
            if keyword in t['work_type']: return t['id']
        return templates[0]['id']

    today = date.today()

    # ---------------------------------------------------------
    # 🧪 시나리오 데이터 (작업 + 위험 연동 및 단독 현황)
    # ---------------------------------------------------------
    scenarios = [
        # 1. 전기실 (작업 + 위험 중복)
        {"pos": (4, 3), "tid": get_tid("전기"), "workers": [0], "hazards": "FIRE", "h_desc": "활선 작업 중 화재 및 감전 위험", "w_desc": "고압반 설치", "risk": 85},
        # 2. 메인 출입구 (작업 + 위험 중복)
        {"pos": (4, 1), "tid": get_tid("철골"), "workers": [1, 2], "hazards": "FALL", "h_desc": "자재 반입 크레인 낙하 주의", "w_desc": "입구 캐노피 설치", "risk": 45},
        # 3. 사무공간A (작업 단독)
        {"pos": (1, 1), "tid": get_tid("미장"), "workers": [3], "hazards": None, "w_desc": "벽체 면고르기 작업", "risk": 30},
        # 4. 회의실(대) (작업 단독)
        {"pos": (1, 2), "tid": get_tid("목공"), "workers": [2], "hazards": None, "w_desc": "천장 텍스 마감", "risk": 55},
        # 5. 기계 설비실 (위험 단독)
        {"pos": (4, 2), "tid": None, "workers": [], "hazards": "ETC", "h_desc": "방수 공사 후 유해가스 농도 측정 중 (진입주의)", "risk": 0},
        # 6. 공용 화장실 (위험 단독)
        {"pos": (3, 4), "tid": None, "workers": [], "hazards": "FALL", "h_desc": "상부 천장 배관 점검구 노출", "risk": 0}
    ]

    for s in scenarios:
        zone_id = new_zone_map[s['pos']]
        
        # 작업 등록
        if s['tid']:
            plan = await insert_and_return("""
                INSERT INTO daily_work_plans (site_id, zone_id, template_id, date, description, status, calculated_risk_score, created_at)
                VALUES (:site_id, :zone_id, :template_id, :date, :desc, 'IN_PROGRESS', :risk, NOW())
                RETURNING id
            """, {"site_id": site_id, "zone_id": zone_id, "template_id": s['tid'], "date": today, "desc": s['w_desc'], "risk": s['risk']})
            
            # 인원 할당
            for idx in s['workers']:
                await execute("INSERT INTO worker_allocations (plan_id, worker_id, role) VALUES (:p_id, :w_id, '작업자')", 
                              {"p_id": plan['id'], "w_id": worker_ids[idx]})

        # 위험 지역 등록
        if s['hazards']:
            await execute("""
                INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
                VALUES (:z_id, :date, :type, :desc)
            """, {"z_id": zone_id, "date": today, "type": s['hazards'], "desc": s['h_desc']})

    print("🎉 v3 시딩 완료: 작업 4건 / 위험 4건 (중첩 2건)이 등록되었습니다.")

if __name__ == "__main__":
    asyncio.run(update_zones_and_data_v3())
