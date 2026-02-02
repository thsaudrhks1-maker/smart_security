"""
통합 시드 데이터 생성 스크립트
- 사용자, 작업자, 현장, 구역, 작업 템플릿, 일일 작업 계획
- 대시보드 정보 (날씨, 알림, 안전정보, 출역, 위반, 공지)
모두를 한 번에 생성하여 ID 참조 정합성을 보장합니다.
"""
import asyncio
from datetime import date, datetime
from sqlalchemy import text
from passlib.context import CryptContext

from back.database import AsyncSessionLocal
from back.auth.model import UserModel
from back.company.model import Company, Site, Worker
from back.safety.model import Zone
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.info.model import (
    Notice, DailySafetyInfo, EmergencyAlert, 
    Attendance, SafetyViolation, Weather
)

# 비밀번호 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_all_data():
    async with AsyncSessionLocal() as db:
        print("🔧 통합 데이터 시딩 시작...")
        
        # 1. 기존 데이터 삭제 (Foreign Key 순서 고려)
        print("   - 기존 데이터 삭제 중...")
        tables = [
            "safety_violations", "attendance", "emergency_alerts", 
            "daily_safety_info", "notices", "weather",
            "worker_allocations", "daily_work_plans", "work_templates", 
            "workers", "zones", "sites", "companies", "users"
        ]
        for table in tables:
            await db.execute(text(f"DELETE FROM {table}"))
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

        # 3. 위험 구역 (Zones)
        zones = [
            Zone(id=1, site_id=1, name="3층 C zone (추락위험)", type="DANGER", level="HIGH", lat=37.5, lng=127.0),
            Zone(id=2, site_id=1, name="지하 1층 기계실", type="SAFE", level="LOW", lat=37.5, lng=127.0),
            Zone(id=3, site_id=1, name="옥상 슬라브 (강풍주의)", type="DANGER", level="CRITICAL", lat=37.5, lng=127.0)
        ]
        for z in zones:
            db.add(z)
        await db.flush()

        # 4. 사용자 및 작업자
        # 비밀번호 '0000' 해시
        # hashed_pwd = pwd_context.hash("0000")
        hashed_pwd = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
        
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

        # 5. 작업 템플릿 및 일일 작업 계획
        templates = [
            WorkTemplate(id=1, work_type="기초파일항타", required_ppe=["안전모", "안전화"], checklist_items=["장비 점검", "신호수 배치"]),
            WorkTemplate(id=2, work_type="배관용접", required_ppe=["용접면", "가죽장갑"], checklist_items=["소화기 비치", "불티 비산방지"]),
        ]
        for t in templates:
            db.add(t)
        await db.flush()
        
        plans = [
            # 김철수: 3층 C zone에서 기초파일항타
            DailyWorkPlan(
                id=1, site_id=1, zone_id=1, template_id=1, 
                date=today_str, description="파일공사 - 기초파일항타", 
                calculated_risk_score=85, status="IN_PROGRESS"
            ),
            # 이영희: 지하 1층에서 용접
            DailyWorkPlan(
                id=2, site_id=1, zone_id=2, template_id=2, 
                date=today_str, description="기계실 배관 용접", 
                calculated_risk_score=40, status="PLANNED"
            )
        ]
        for p in plans:
            db.add(p)
        await db.flush()
        
        allocations = [
            WorkerAllocation(plan_id=1, worker_id=1, role="반장"), # 김철수 할당
            WorkerAllocation(plan_id=2, worker_id=2, role="용접공"), # 이영희 할당
        ]
        for a in allocations:
            db.add(a)

        # 6. 대시보드 정보 (날씨, 알림 등)
        db.add(Weather(date=today_str, temperature="2.7°C", condition="구름 조금", humidity="45%", wind_speed="2.1m/s"))
        
        db.add(EmergencyAlert(title="긴급알림", message="강풍 주의! 타워크레인 작업 중지 바람.", severity="HIGH", is_active=True))
        
        db.add(DailySafetyInfo(
            date=today_str, title="일일 안전정보", content="금일 낙하물 사고 위험이 높습니다.", 
            is_read_by_worker="1" # 김철수만 읽음 (13건 열람 효과 연출용)
        ))
        
        # 출역 현황
        db.add(Attendance(worker_id=1, date=today_str, check_in_time="06:50", status="PRESENT")) # 김철수
        db.add(Attendance(worker_id=2, date=today_str, check_in_time="08:10", status="LATE"))    # 이영희
        
        # 안전 위반
        db.add(SafetyViolation(worker_id=1, date=today_str, violation_type="안전고리 미체결", description="고소작업 중 미체결", severity="HIGH"))
        db.add(SafetyViolation(worker_id=1, date=today_str, violation_type="보호구 불량", description="안전화 파손", severity="LOW"))
        db.add(SafetyViolation(worker_id=2, date=today_str, violation_type="흡연", description="지정장소 외 흡연", severity="MEDIUM"))
        
        # 공지사항
        db.add(Notice(title="시스템 공지", content="서버 점검 안내", priority="NORMAL"))
        db.add(Notice(title="동절기 건강관리", content="스트레칭 필수", priority="NORMAL"))

        await db.commit()
        print("✅ 통합 데이터 시딩 완료!")
        print("   - 사용자: admin, worker1(김철수), worker2(이영희), worker3(박민수)")
        print("   - 암호: 0000")
        print("   - 작업: 김철수(기초파일항타), 이영희(배관용접)")

if __name__ == "__main__":
    asyncio.run(seed_all_data())
