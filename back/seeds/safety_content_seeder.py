
import asyncio
import os
import sys
import json

# 프로젝트 루트를 path에 추가하여 back 모듈을 찾을 수 있게 함
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from back.database import execute, fetch_all

async def seed_safety_content():
    print("=== [CONTENT] 산업안전보건 표준 데이터 시딩 시작 (KOSHA 가이드 기반) ===")

    # 1. 기존 데이터 정리 (충돌 방지)
    # await execute("TRUNCATE content_work_safety_map CASCADE;")
    # await execute("DELETE FROM content_safety_info;")
    # await execute("DELETE FROM content_work_info;")
    
    # 2. 안전 표준 정보 (content_safety_info)
    safety_infos = [
        {
            "category": "추락예방",
            "title": "고소작업 추락 방지 안전표준",
            "description": "비계, 사다리, 작업발판 등 고소작업 시 추락 사고 예방을 위한 기준",
            "checklist": ["안전대 부착설비 설치 및 체결 여부", "안전난간 및 끝부부 개구부 덮개 설치", "작업발판 고정 상태", "근로자 보호구 착용"],
            "risk_factors": ["발판 미고정으로 인한 추락", "안전난간 미설치 구역 실족", "안전대 미체결"],
            "safety_measures": ["추락방지망 설치", "안전대 걸이용 로프 설치", "2인 1조 작업"],
            "required_ppe": ["안전모", "안전대(풀바디 하네스)", "안전화"]
        },
        {
            "category": "낙하/비래",
            "title": "낙하물 재해예방 안전표준",
            "description": "상부 작업 시 공구, 자재 하부 낙하로 인한 인명 피해 예방",
            "checklist": ["낙하물 방지망 설치 상태", "자재 결속 상태 점검", "하부 통제구역 설정", "안전모 턱끈 조임"],
            "risk_factors": ["자재 인양 중 결속 풀림", "발판 위 공구 방치", "강풍에 의한 자재 비산"],
            "safety_measures": ["낙하물 방지망(10m 이내마다)", "방호 선반 설치", "자재 정리정돈"],
            "required_ppe": ["안전모", "안전화"]
        },
        {
            "category": "감전예방",
            "title": "전기작업 및 가설전기 안전표준",
            "description": "분전반, 가설배선, 전동공구 사용 시 감전 사고 예방",
            "checklist": ["접지 실시 여부", "누전차단기 정상 작동", "외함 파손 및 노출 충전부", "절연장갑 착용"],
            "risk_factors": ["피복 손상된 전선방치", "습기 있는 곳에서 전동기구 사용", "누전차단기 미설치"],
            "safety_measures": ["이동형 전동기구 이중절연구조 사용", "가설배선 공중 가설", "전기 작업 전 전원 차단"],
            "required_ppe": ["절연화", "절연장갑", "안전모"]
        },
        {
            "category": "질식/중독",
            "title": "밀폐공간 및 환기 불량 구역 안전표준",
            "description": "맨홀, 탱크, 지하실 등 산소결핍 및 유해가스 중독 예방",
            "checklist": ["산소 및 유해가스 농도 측정", "환기팬 가동 상태", "감시인 배치", "비상 구조구 비치"],
            "risk_factors": ["산소결핍(18% 미만)", "황화수소/일산화탄소 중독", "환기 부족 시 가스 체류"],
            "safety_measures": ["작업 전/중 지속적 환기", "입출입 확인 대장 작성", "가스 측정기 휴대"],
            "required_ppe": ["송기마스크", "공기호흡기", "안전모", "안전대"]
        },
        {
            "category": "붕괴예방",
            "title": "굴착 및 가설구조물 붕괴예방 표준",
            "description": "토사 붕괴, 거푸집 동바리 무너짐 사고 예방",
            "checklist": ["흙막이 지보공 변형 확인", "동바리 수평연결재 설치", "지반 침하 및 균열 발생", "과적재 금지"],
            "risk_factors": ["옹벽 배면 수압 증가", "동바리 설계 하중 초과", "굴착면 기울기 미준수"],
            "safety_measures": ["계측기 모니터링", "지반 보강공법 실시", "우천 시 배수 처리"],
            "required_ppe": ["안전모", "안전화"]
        }
    ]

    # 3. 데이터 삽입 및 ID 맵핑 준비
    safety_id_map = {}
    for info in safety_infos:
        sql = """
            INSERT INTO content_safety_info (category, title, description, checklist, risk_factors, safety_measures, required_ppe)
            VALUES (:category, :title, :description, :checklist, :risk_factors, :safety_measures, :required_ppe)
            ON CONFLICT DO NOTHING
            RETURNING id, category;
        """
        # JSON 변환
        params = {
            "category": info["category"],
            "title": info["title"],
            "description": info["description"],
            "checklist": json.dumps(info["checklist"], ensure_ascii=False),
            "risk_factors": json.dumps(info["risk_factors"], ensure_ascii=False),
            "safety_measures": json.dumps(info["safety_measures"], ensure_ascii=False),
            "required_ppe": json.dumps(info["required_ppe"], ensure_ascii=False)
        }
        
        try:
            # 겹치는 제목이 있을 수 있으니 SELECT 먼저 하거나 INSERT RETURNING 처리
            from back.database import insert_and_return
            res = await insert_and_return(sql, params)
            if res:
                safety_id_map[info["category"]] = res["id"]
                print(f"  [OK] 안전정보 등록: {info['title']}")
            else:
                # 이미 존재한다면 ID 조회
                existing = await fetch_all("SELECT id FROM content_safety_info WHERE title = :t", {"t": info["title"]})
                if existing:
                    safety_id_map[info["category"]] = existing[0]["id"]
        except Exception as e:
            print(f"  [Error] {info['title']} 삽입 실패: {e}")

    # 4. 표준 공종 정보 (content_work_info)
    work_types = [
        {"type": "가설공사(비계/시스템)", "score": 75, "safety": ["추락예방", "낙하/비래"]},
        {"type": "토공사 및 굴착", "score": 70, "safety": ["붕괴예방", "중장비"]},
        {"type": "철근콘크리트(거푸집/천단)", "score": 65, "safety": ["추락예방", "붕괴예방"]},
        {"type": "용접 및 화기작업", "score": 80, "safety": ["감전예방", "화재예방"]},
        {"type": "밀폐공간 작업(정화조/맨홀)", "score": 85, "safety": ["질식/중독"]},
        {"type": "전기 및 통신 설비", "score": 60, "safety": ["감전예방"]},
        {"type": "내외장 마감공사", "score": 40, "safety": ["추락예방", "낙하/비래"]}
    ]

    for work in work_types:
        try:
            from back.database import insert_and_return
            sql_work = "INSERT INTO content_work_info (work_type, base_risk_score) VALUES (:wt, :brs) ON CONFLICT (work_type) DO UPDATE SET base_risk_score = :brs RETURNING id;"
            res_work = await insert_and_return(sql_work, {"wt": work["type"], "brs": work["score"]})
            work_id = res_work["id"]
            
            # 매핑 처리
            for s_cat in work["safety"]:
                if s_cat in safety_id_map:
                    s_id = safety_id_map[s_cat]
                    # 중복 체크 후 매핑
                    check_map = await fetch_all("SELECT id FROM content_work_safety_map WHERE work_info_id = :wi AND safety_info_id = :si", {"wi": work_id, "si": s_id})
                    if not check_map:
                        await execute("INSERT INTO content_work_safety_map (work_info_id, safety_info_id) VALUES (:wi, :si)", {"wi": work_id, "si": s_id})
            
            print(f"  [OK] 공종 등록 및 매핑: {work['type']}")
        except Exception as e:
            print(f"  [Error] {work['type']} 처리 실패: {e}")

    print("=== 시딩 완료 ===")

if __name__ == "__main__":
    asyncio.run(seed_safety_content())
