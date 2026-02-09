
import asyncio
import json
from back.database import engine
from sqlalchemy import text

async def update_danger_guidelines():
    print("Connecting to database...")
    
    # 위험 종류별 안전 가이드라인 데이터
    danger_guidelines = {
        "중장비": [
            "신호수 배치 확인 및 수신호 준수",
            "장비 작업 반경(회전 반경) 내 접근 금지",
            "장비 이동 경로 확보 및 장애물 제거",
            "운전자와 눈 맞춤(Eye Contact) 후 이동"
        ],
        "낙하물": [
            "상부 작업 구간 하부 출입 통제",
            "낙하물 방지망 설치 상태 확인",
            "안전모 필수 착용 및 턱끈 체결",
            "자재 인양 시 결속 상태 재확인"
        ],
        "감전": [
            "젖은 손으로 전기 기기 조작 금지",
            "전선 피복 손상 여부 육안 점검",
            "이동형 전기 기계 기구 누전 차단기 연결 확인",
            "분전반 잠금 상태 및 경고 표지 확인"
        ],
        "화재": [
            "작업장 주변 소화기(2대 이상) 비치 확인",
            "인화성 물질(시너, 유류 등) 별도 보관",
            "용접/절단 작업 시 불티 비산 방지 조치",
            "비상 대피로 물건 적치 금지"
        ],
        "추락": [
            "안전대 착용 및 안전 고리 체결 철저",
            "개구부 덮개 및 안전 난간 설치 확인",
            "비계 발판 고정 상태 및 미끄럼 주의",
            "사다리 작업 시 2인 1조 및 아웃트리거 설치"
        ],
        "질식": [
            "밀폐 공간 작업 전 산소/유해 가스 농도 측정",
            "송기 마스크 착용 및 환기 설비 가동",
            "감시인 배치 및 비상 연락 체계 유지",
            "출입 인원 점검 및 통제"
        ],
        "붕괴": [
            "굴착 사면 기울기 준수 및 토사 붕괴 징후 감시",
            "거푸집 동바리 결속 및 지지 상태 확인",
            "구조물 균열, 변형 발생 시 즉시 작업 중단",
            "강우/강풍 후 지반 상태 점검"
        ]
    }

    print("Updating danger guidelines...")
    
    async with engine.begin() as conn:
        for danger_type, guidelines in danger_guidelines.items():
            # JSON 배열 문자열로 변환
            json_guidelines = json.dumps(guidelines, ensure_ascii=False)
            
            # danger_type 이름으로 매칭하여 업데이트
            query = text("""
                UPDATE content_danger_info 
                SET safety_guidelines = :guidelines
                WHERE danger_type = :danger_type
            """)
            
            result = await conn.execute(query, {"guidelines": json_guidelines, "danger_type": danger_type})
            # print(f"Updated '{danger_type}' guidelines. Rows affected: {result.rowcount}")

    print("Done!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(update_danger_guidelines())
