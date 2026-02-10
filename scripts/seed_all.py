"""
통합 시드 데이터 생성 스크립트
- 사용자, 작업자, 현장, 구역, 작업 템플릿, 일일 작업 계획
- 대시보드 정보 (날씨, 알림, 안전정보, 출역, 위반, 공지)
모두를 한 번에 생성하여 ID 참조 정합성을 보장합니다.
"""
import asyncio
from datetime import date, datetime
from sqlalchemy import text
import bcrypt

# 비밀번호 해싱 함수 (bcrypt 사용)
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

from back.database import AsyncSessionLocal
from back.auth.model import UserModel
from back.company.model import Company, Site, Worker
from back.safety.model import Zone, DailyDangerZone
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.info.model import (
    Notice, DailySafetyInfo, 
    Attendance, SafetyViolation, Weather
)

async def seed_all_data():
    async with AsyncSessionLocal() as db:
        print("🔧 통합 데이터 시딩 시작...")
        
        # 1. 기존 데이터 삭제 (Foreign Key 순서 고려)
        print("   - 기존 데이터 삭제 중...")
        tables = [
            "daily_worker_locations", "device_beacons", # 새로 추가된 테이블
            "safety_violations", "attendance", 
            "daily_safety_info", "daily_danger_zones", "notices", "weather",
            "worker_allocations", "daily_work_plans", "work_templates", 
            "workers", "zones", "sites", "companies", "users"
        ]
        for table in tables:
            # 테이블이 없을 수도 있으므로 예외처리
            try:
                await db.execute(text(f"DELETE FROM {table}"))
            except Exception:
                pass
        await db.commit()
        print("   ✅ 기존 데이터 삭제 완료")
        
        today_str = str(date.today())
        
        # 2. 기초 데이터 (현장, 회사)
        site = Site(id=1, name="서울빌딩 신축공사", address="서울시 강남구 삼성동 123")
        db.add(site)
        
        companies = [
            Company(id=1, name="대한건설", trade_type="골조"),
            Company(id=2, name="한성설비", trade_type="설비")
        ]
        for c in companies:
            db.add(c)
        await db.flush()

        # 3. 위험 구역 (Zones) - 1층 방 6개 + 복도 + 코어
        zones = [
            # 방 6개
            Zone(
                id=1, site_id=1, 
                name="1층 방1 (철근 작업)", 
                type="INDOOR", level="MEDIUM", 
                lat=37.5001, lng=127.0001,
                default_hazards=["낙하물 위험", "철근 적재물", "협착 위험"]
            ),
            Zone(
                id=2, site_id=1, 
                name="1층 방2 (미장 작업)", 
                type="INDOOR", level="LOW", 
                lat=37.5002, lng=127.0002,
                default_hazards=["분진", "미끄럼"]
            ),
            Zone(
                id=3, site_id=1, 
                name="1층 방3 (배관실)", 
                type="INDOOR", level="MEDIUM", 
                lat=37.5003, lng=127.0003,
                default_hazards=["밀폐공간", "용접 작업"]
            ),
            Zone(
                id=4, site_id=1, 
                name="1층 방4 (전기실)", 
                type="DANGER", level="HIGH", 
                lat=37.5004, lng=127.0004,
                default_hazards=["감전 위험", "고압 전류", "화재 위험"]
            ),
            Zone(
                id=5, site_id=1, 
                name="1층 방5 (자재 보관)", 
                type="SAFE", level="LOW", 
                lat=37.5005, lng=127.0005,
                default_hazards=["적재물 붕괴"]
            ),
            Zone(
                id=6, site_id=1, 
                name="1층 방6 (도장 작업)", 
                type="DANGER", level="MEDIUM", 
                lat=37.5006, lng=127.0006,
                default_hazards=["유독가스", "환기불량", "화재위험"]
            ),
            # 복도
            Zone(
                id=7, site_id=1, 
                name="1층 복도1", 
                type="INDOOR", level="LOW", 
                lat=37.5007, lng=127.0007,
                default_hazards=["미끄럼", "자재 적재"]
            ),
            # 코어 (계단실)
            Zone(
                id=8, site_id=1, 
                name="1층 코어 (계단실)", 
                type="INDOOR", level="MEDIUM", 
                lat=37.5008, lng=127.0008,
                default_hazards=["추락위험", "좁은 통로", "조명 불량"]
            )
        ]
        for z in zones:
            db.add(z)
        await db.flush()

        # 4. 사용자 및 작업자
        hashed_pwd = hash_password("0000")
        
        users = [
            UserModel(id=1, username="admin", full_name="관리자", role="admin", hashed_password=hashed_pwd),
            UserModel(id=2, username="worker1", full_name="김철수", role="worker", hashed_password=hashed_pwd), # 철근
            UserModel(id=3, username="worker2", full_name="이영희", role="worker", hashed_password=hashed_pwd), # 배관
            UserModel(id=4, username="worker3", full_name="박민수", role="worker", hashed_password=hashed_pwd), # 잡부
        ]
        for u in users:
            db.add(u)
        await db.flush()
        
        workers = [
            Worker(id=1, user_id=2, company_id=1, name="김철수", trade="철근공", status="ON_SITE"),
            Worker(id=2, user_id=3, company_id=2, name="이영희", trade="배관공", status="ON_SITE"),
            Worker(id=3, user_id=4, company_id=1, name="박민수", trade="조공", status="ON_SITE"),
        ]
        for w in workers:
            db.add(w)
        await db.flush()

        # 5. 작업 템플릿 및 일일 작업 계획 - 일일 위험 요소 포함
        templates = [
            WorkTemplate(id=1, work_type="철근 조립", required_ppe=["안전모", "안전화", "안전장갑"], checklist_items=["철근 상태 점검", "작업 공간 정리", "낙하물 방지망 설치"]),
            WorkTemplate(id=2, work_type="배관용접", required_ppe=["용접면", "가죽장갑", "안전화"], checklist_items=["소화기 비치", "불티 비산방지", "환기 확인"]),
            WorkTemplate(id=3, work_type="자재 운반", required_ppe=["안전모", "안전화"], checklist_items=["통로 확보", "중량 확인"]),
        ]
        for t in templates:
            db.add(t)
        await db.flush()
        
        plans = [
            # 김철수: 1층 방1에서 철근 조립 (고정위험 + 일일위험)
            DailyWorkPlan(
                id=1, site_id=1, zone_id=1, template_id=1, 
                date=today_str, description="철근 배근 및 조립 작업", 
                calculated_risk_score=75, status="IN_PROGRESS",
                daily_hazards=["중량물 취급", "날카로운 철근", "고소 작업"]
            ),
            # 이영희: 1층 방3에서 배관 용접 (고정위험 + 일일위험)
            DailyWorkPlan(
                id=2, site_id=1, zone_id=3, template_id=2, 
                date=today_str, description="급수 배관 용접 작업을 진행합니다", 
                calculated_risk_score=65, status="PLANNED",
                daily_hazards=["화재위험", "화상위험", "밀폐공간 질식"]
            ),
            # 박민수: 복도에서 자재 운반
            DailyWorkPlan(
                id=3, site_id=1, zone_id=7, template_id=3,
                date=today_str, description="자재 운반 및 정리",
                calculated_risk_score=30, status="PLANNED",
                daily_hazards=["미끄럼", "중량물 낙하"]
            )
        ]
        for p in plans:
            db.add(p)
        await db.flush()
        
        allocations = [
            WorkerAllocation(plan_id=1, worker_id=1, role="반장"),    # 김철수 → 철근 작업
            WorkerAllocation(plan_id=2, worker_id=2, role="용접공"),  # 이영희 → 배관 용접
            WorkerAllocation(plan_id=3, worker_id=3, role="운반공"),  # 박민수 → 자재 운반
        ]
        for a in allocations:
            db.add(a)

        # 6. 대시보드 정보 (날씨, 알림 등)
        db.add(Weather(date=today_str, temperature="2.7°C", condition="구름 조금", humidity="45%", wind_speed="2.1m/s"))
        
        # EmergencyAlert 제거됨

        
        # 일일 안전정보 - 작업별로 다르게
        safety_infos = [
            DailySafetyInfo(
                date=today_str, 
                title="[철근 작업] 중량물 취급 안전수칙", 
                content="• 철근 운반 시 2인 1조 작업 필수\n• 날카로운 철근 단면에 보호캡 설치\n• 작업 전 안전장갑 착용 상태 확인\n• 철근 적재 높이 1.5m 이하 유지\n• 낙하물 방지를 위한 안전망 설치 확인",
                is_read_by_worker="1"  # 김철수만 읽음
            ),
            DailySafetyInfo(
                date=today_str, 
                title="[용접 작업] 화재 예방 및 환기 관리", 
                content="• 용접 작업 전 소화기 비치 확인 (10m 이내)\n• 밀폐공간 작업 시 환기팬 가동 필수\n• 불티 비산 방지 덮개 설치\n• 인화성 물질 5m 이상 거리 확보\n• 용접면 및 가죽장갑 착용 상태 점검",
                is_read_by_worker="2"  # 이영희만 읽음
            ),
            DailySafetyInfo(
                date=today_str, 
                title="[공통] 동절기 안전관리", 
                content="• 결빙 구간 미끄럼 주의 (복도, 계단)\n• 보온 장구 착용으로 동상 예방\n• 작업 시작 전 준비운동 5분 이상\n• 온열 질환 예방을 위한 수분 섭취\n• 기상악화 시 외부 작업 즉시 중단",
                is_read_by_worker="3"  # 박민수만 읽음
            )
        ]
        for info in safety_infos:
            db.add(info)
        
        # 출역 현황
        db.add(Attendance(worker_id=1, date=today_str, check_in_time="06:50", status="PRESENT")) # 김철수
        db.add(Attendance(worker_id=2, date=today_str, check_in_time="08:10", status="LATE"))    # 이영희
        
        # 안전 위반
        db.add(SafetyViolation(worker_id=1, date=today_str, violation_type="안전고리 미체결", description="고소작업 중 미체결", severity="HIGH"))
        db.add(SafetyViolation(worker_id=1, date=today_str, violation_type="보호구 불량", description="안전화 파손", severity="LOW"))
        db.add(SafetyViolation(worker_id=2, date=today_str, violation_type="흡연", description="지정장소 외 흡연", severity="MEDIUM"))
        
        # 7. 일일 변동 위험 (DailyDangerZone)
        daily_dangers = [
            # Zone 1 (김철수 작업공간): 싱크홀 & 중장비
            DailyDangerZone(
                zone_id=1, date=today_str, risk_type="COLLAPSE", 
                description="🚨 [방1/긴급] 지반 약화로 인한 싱크홀 경보", 
                x=15.0, y=22.0, z=0.0
            ),
            DailyDangerZone(
                zone_id=1, date=today_str, risk_type="HEAVY_EQUIPMENT", 
                description="🚜 [방1/운행] 소형 굴삭기 내부 진입 작업 중", 
                x=18.0, y=25.0, z=0.0
            ),
            # Zone 3 (이영희 작업공간): 화재
            DailyDangerZone(
                zone_id=3, date=today_str, risk_type="FIRE", 
                description="🔥 [방3/화기] 인화성 가스 농도 상승 (환기 필요)", 
                x=30.0, y=30.0, z=1.5
            ),
            # Zone 7 (박민수 작업공간 - 복도): 낙하물
            DailyDangerZone(
                zone_id=7, date=today_str, risk_type="FALL", 
                description="🧱 [복도/상부] 2층 자재 인양 중 낙하물 주의", 
                x=42.0, y=10.0, z=3.0
            )
        ]
        for dd in daily_dangers:
            db.add(dd)
        
        # 공지사항
        db.add(Notice(title="시스템 공지", content="서버 점검 안내 - 2월 3일 02:00~04:00 시스템 점검이 진행됩니다.", priority="NORMAL"))
        db.add(Notice(title="동절기 건강관리", content="스트레칭 필수 - 작업 전후 스트레칭으로 근골격계 질환을 예방하세요.", priority="NORMAL"))


        await db.commit()
        print("✅ 통합 데이터 시딩 완료!")
        print("   - Zone: 1층 방1~6, 복도, 코어 (총 8개)")
        print("   - 사용자: admin, worker1(김철수), worker2(이영희), worker3(박민수)")
        print("   - 암호: 0000")
        print("   - 작업:")
        print("     • 김철수 → 1층 방1: 철근 배근 작업")
        print("     • 이영희 → 1층 방3: 배관 용접 작업")
        print("     • 박민수 → 1층 복도: 자재 운반")


if __name__ == "__main__":
    asyncio.run(seed_all_data())
