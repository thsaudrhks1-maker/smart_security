
import asyncio
import json
from back.database import engine
from sqlalchemy import text

async def update_checklists():
    print("Connecting to database...")
    
    # 공종별 표준 체크리스트 매핑 데이터
    updates = {
        "거푸집 설치 및 해체": [
            "거푸집 및 동바리 재료 변형/부식 여부 확인",
            "동바리 수평 연결재 및 가새 설치 상태",
            "콘크리트 타설 전 거푸집 내부 청소 상태",
            "작업 발판 설치 및 안전 난간 상태 확인"
        ],
        "고소작업 (3m 이상)": [
            "안전대 착용 및 체결 상태 확인 (이중 걸이)",
            "작업 발판 고정 상태 및 미끄럼 방지 조치",
            "추락 방지망 설치 여부 및 손상 확인",
            "상부 작업장 하부 낙하물 방호 조치",
            "강풍/우천 시 작업 제한 기준 준수"
        ],
        "용접 및 절단작업": [
            "작업장 주변 인화성 물질 제거 확인 (반경 10m)",
            "비산 불티 방지포 설치 및 빈틈 확인",
            "소화기(2대 이상) 비치 여부 확인",
            "화재 감시자 배치 및 근무 상태 확인",
            "가스 용기 전도 방지 조치 및 누설 점검"
        ],
        "중장비 운용": [
            "장비 작업 반경 내 일반 근로자 출입 통제",
            "신호수 배치 및 신호 체계 확인",
            "장비 주행 경로 지반 상태 점검 (침하/붕괴)",
            "운전자 자격 확인 및 안전벨트 착용",
            "장비 별 작업 계획서 작성 및 준수 여부"
        ],
        "전기배선 작업": [
            "작업 전 전원 차단 및 잠금 장치(LOTO) 설치",
            "절연 보호구(장갑, 장화 등) 착용 상태",
            "전선 피복 손상 여부 및 연결 부위 절연 처리",
            "누전 차단기 동작 테스트 및 접지 상태 확인",
            "습윤한 장소 작업 시 감전 예방 조치"
        ],
        "배관 설치": [
            "중량물 취급 시 올바른 자세 및 2인 1조 작업",
            "용접/절단 시 화기 작업 허가 및 안전 조치",
            "배관/자재 적재 시 전도/붕괴 방지 조치",
            "밀폐 공간 작업 시 산소 농도 측정 및 환기"
        ],
        "내장 마감": [
            "MSDS(물질안전보건자료) 비치 및 교육 이수",
            "밀폐 공간 도장 시 환기 설비 가동 상태",
            "사다리/비계 사용 시 전도 방지 조치",
            "개인 보호구(방독 마스크, 보호 안경) 착용"
        ]
    }

    print("Updating checklist items...")
    
    async with engine.begin() as conn:
        for work_type, items in updates.items():
            # JSON 배열 문자열로 변환
            json_items = json.dumps(items, ensure_ascii=False)
            
            query = text("""
                UPDATE content_work_info 
                SET checklist_items = :items
                WHERE work_type = :work_type
            """)
            
            await conn.execute(query, {"items": json_items, "work_type": work_type})
            print(f"Updated '{work_type}' checklist.")

    print("Done!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(update_checklists())
