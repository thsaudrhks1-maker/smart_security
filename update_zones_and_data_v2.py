import asyncio
import sys
import os
from datetime import datetime, date

# 프로젝트 루트 경로를 파이썬 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from back.database import execute, fetch_one, insert_and_return, fetch_all

async def update_zones_and_data_v2():
    print("🚀 현실적인 5x5 그리드 및 데이터 시딩 시작...")
    
    # 1. Site ID 조회
    site = await fetch_one("SELECT id FROM sites ORDER BY id DESC LIMIT 1")
    if not site:
        print("❌ 현장(Site) 데이터가 없습니다. 먼저 reset_scenario.py를 실행하세요.")
        return
    site_id = site['id']

    # 2. 관련 데이터 초기화 (이번엔 해당 Site에 대해서만)
    print("🗑️ 기존 데이터 청소 중...")
    await execute("DELETE FROM daily_danger_zones WHERE zone_id IN (SELECT id FROM zones WHERE site_id = :site_id)", {"site_id": site_id})
    await execute("DELETE FROM worker_allocations WHERE plan_id IN (SELECT id FROM daily_work_plans WHERE site_id = :site_id)", {"site_id": site_id})
    await execute("DELETE FROM daily_work_plans WHERE site_id = :site_id", {"site_id": site_id})
    await execute("DELETE FROM zones WHERE site_id = :site_id", {"site_id": site_id})
    
    # 3. 사용자 정보 확인 (박작업: worker)
    user_park = await fetch_one("SELECT id FROM users WHERE full_name = '박작업' LIMIT 1")
    if not user_park:
        print("⚠️ '박작업' 사용자를 찾을 수 없습니다. 기본 worker ID(4)를 시도합니다.")
        worker_id = 4
    else:
        worker_id = user_park['id']

    # 4. 🔗 5x5 현실적인 이름 맵 정의
    grid_names = [
        ["북측 발코니", "북측 복도A", "북측 복도B", "EV홀 상부", "탕비실(북)"],
        ["임원실A", "사무공간A", "회의실(대)", "중앙 복도A", "전산실"],
        ["E/V 1호기", "계단실(A)", "메인 로비", "안내데스크", "라운지"],
        ["사무공간B", "회의실(소)", "창고A", "자재보관실", "공용 화장실"],
        ["남측 복도", "메인 출입구", "기계 설비실", "전기실", "주차램프입구"]
    ]

    # 5. 그리드 생성 및 삽입
    center_lat, center_lng = 37.56600, 126.97800
    step = 0.00025
    
    new_zone_map = {} # {(r,c): id}
    
    for r in range(5):
        for c in range(5):
            lat = round(center_lat + (2 - r) * step, 6)
            lng = round(center_lng + (c - 2) * step, 6)
            name = grid_names[r][c]
            
            zone_type = "INDOOR"
            if "발코니" in name or "출입구" in name or "외부" in name:
                zone_type = "OUTDOOR"
            elif "화장실" in name or "기계" in name or "전기" in name:
                zone_type = "DANGER"

            sql = """
                INSERT INTO zones (site_id, name, level, type, lat, lng)
                VALUES (:site_id, :name, '1F', :type, :lat, :lng)
                RETURNING id
            """
            res = await insert_and_return(sql, {
                "site_id": site_id, "name": name, "type": zone_type, "lat": lat, "lng": lng
            })
            new_zone_map[(r, c)] = res['id']
            # print(f"✅ Zone 생성: {name} (ID: {res['id']})")

    print(f"✅ 25개 구역 생성 완료 (Site ID: {site_id})")

    # 6. 작업 템플릿 및 오늘 날짜
    template = await fetch_one("SELECT id FROM work_templates WHERE work_type LIKE '%전기%' LIMIT 1")
    if not template:
        template = await fetch_one("SELECT id FROM work_templates LIMIT 1")
    
    today = date.today()

    # 7. 🧪 시나리오 데이터 생성
    # 시나리오 A: 박작업 - 전기실에서 전기 배선 작업
    elec_zone_id = new_zone_map[(4, 3)] # 전기실
    plan_park = await insert_and_return("""
        INSERT INTO daily_work_plans (site_id, zone_id, template_id, date, description, status, calculated_risk_score, created_at)
        VALUES (:site_id, :zone_id, :template_id, :date, :desc, 'IN_PROGRESS', 80, NOW())
        RETURNING id
    """, {
        "site_id": site_id, "zone_id": elec_zone_id, "template_id": template['id'],
        "date": today, "desc": "전기실 고압반 부스바 설치 및 결선"
    })
    
    # 박작업 할당
    await execute("INSERT INTO worker_allocations (plan_id, worker_id, role) VALUES (:p_id, :w_id, '전기반장')", 
                  {"p_id": plan_park['id'], "w_id": worker_id})
    
    # 해당 구역에 위험 요소 등록 (Danger Zone)
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
        VALUES (:z_id, :date, 'FIRE', '활선 작업 중 화재 및 감전 위험 (절연 장구 필수)')
    """, {"z_id": elec_zone_id, "date": today})

    # 시나리오 B: 다른 작업자들 (김철근, 이배관) - 메인 출입구 조적 작업
    entrance_zone_id = new_zone_map[(4, 1)] # 메인 출입구
    plan_others = await insert_and_return("""
        INSERT INTO daily_work_plans (site_id, zone_id, template_id, date, description, status, calculated_risk_score, created_at)
        VALUES (:site_id, :zone_id, :template_id, :date, :desc, 'IN_PROGRESS', 40, NOW())
        RETURNING id
    """, {
        "site_id": site_id, "zone_id": entrance_zone_id, "template_id": template['id'],
        "date": today, "desc": "메인 출입구 보안 셔터 가이드 설치"
    })
    
    # 김철근(6), 이배관(7) 할당
    await execute("INSERT INTO worker_allocations (plan_id, worker_id, role) VALUES (:p_id, 6, '작업자')", {"p_id": plan_others['id']})
    await execute("INSERT INTO worker_allocations (plan_id, worker_id, role) VALUES (:p_id, 7, '작업자')", {"p_id": plan_others['id']})

    # 메인 출입구 위험 추가
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
        VALUES (:z_id, :date, 'FALL', '자재 반입용 크레인 인접 구역 낙하물 주의')
    """, {"z_id": entrance_zone_id, "date": today})

    print("🎉 모든 시나리오 데이터가 성공적으로 시딩되었습니다!")
    print(f"👉 '박작업'님은 현재 [1층 - {grid_names[4][3]}]에 배정되었습니다.")

if __name__ == "__main__":
    asyncio.run(update_zones_and_data_v2())
