import asyncio
import sys
import os

# 프로젝트 루트 경로를 sys.path에 추가 (seed 폴더에서 실행 시 back 모듈 못 찾는 문제 해결)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from back.database import AsyncSessionLocal

async def seed_templates():
    templates = [
        # --- 고위험 (High Risk) ---
        {
            "work_type": "철골/비계 설치",
            "base_risk": 70,
            "ppe": ["안전모", "안전대", "안전화"],
            "check_items": ["안전대 부착설비 확인", "하부 통제 확인", "자재 결속 상태 확인"]
        },
        {
            "work_type": "타워크레인 양중",
            "base_risk": 80,
            "ppe": ["안전모", "신호수 조끼"],
            "check_items": ["줄걸이 상태 확인", "신호수 배치 확인", "작업 반경 통제"]
        },
        {
            "work_type": "굴착기 토공",
            "base_risk": 75,
            "ppe": ["안전모", "안전화"],
            "check_items": ["장비 유도원 배치", "후방 카메라 작동 확인", "지반 침하 확인"]
        },
        # --- 중위험 (Medium Risk) ---
        {
            "work_type": "알폼/거푸집 조립",
            "base_risk": 50,
            "ppe": ["안전모", "안전장갑", "안전화"],
            "check_items": ["자재 적재 상태", "못 찔림 주의", "이동 통로 확보"]
        },
        {
            "work_type": "철근 배근",
            "base_risk": 45,
            "ppe": ["안전모", "코팅장갑"],
            "check_items": ["철근 찔림 방지캡", "결속선 정리", "넘어짐 주의"]
        },
        {
            "work_type": "용접/절단",
            "base_risk": 60,
            "ppe": ["용접보안면", "가죽장갑"],
            "check_items": ["소화기 비치", "불티 비산 방지망", "가연물 제거"]
        },
        # --- 저위험 (Low Risk) ---
        {
            "work_type": "내부 조적/미장",
            "base_risk": 30,
            "ppe": ["안전모", "분진마스크"],
            "check_items": ["비계 발판 고정", "조명 밝기 확보"]
        },
        {
            "work_type": "마감 도장",
            "base_risk": 35,
            "ppe": ["반면형 마스크", "보호복"],
            "check_items": ["환기 설비 가동", "유기용제 보관 상태"]
        },
        {
            "work_type": "자재 정리/청소",
            "base_risk": 20,
            "ppe": ["안전모", "안전화"],
            "check_items": ["이동 통로 확보", "쓰레기 분리 수거"]
        }
    ]

    async with AsyncSessionLocal() as session:
        print("🌱 Seeding Work Templates...")
        
        # 기존 데이터 삭제 (중복 방지)
        await session.execute(text("TRUNCATE TABLE work_templates RESTART IDENTITY CASCADE"))
        
        for t in templates:
            # check_items list -> jsonb or text array? Model definition uses JSON usually or ARRAY.
            # Assuming JSON based on schema.
            
            # Use raw SQL for speed and simplicity
            sql = """
            INSERT INTO work_templates (work_type, base_risk_score, required_ppe, checklist_items)
            VALUES (:type, :risk, :ppe, :check)
            """
            # PostgreSQL Array syntax adjustment if needed, but SQLAlchemy params handle lists well usually
            # if the column type is JSONB or ARRAY. Let's assume JSONB for now or ARRAY.
            # Checking model: work_templates usually has JSON columns for these.
            import json
            
            await session.execute(text(sql), {
                "type": t["work_type"],
                "risk": t["base_risk"],
                "ppe": json.dumps(t["ppe"], ensure_ascii=False), # JSON string
                "check": json.dumps(t["check_items"], ensure_ascii=False)
            })
            
        await session.commit()
        print(f"✅ inserted {len(templates)} templates.")

if __name__ == "__main__":
    asyncio.run(seed_templates())
