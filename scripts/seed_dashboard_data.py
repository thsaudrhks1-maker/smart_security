"""
작업자 대시보드용 추가 시드 데이터
- 공지사항, 일일 안전정보, 긴급알림, 출역현황, 안전위반, 날씨
"""
import asyncio
from datetime import date
from sqlalchemy import text

from back.database import AsyncSessionLocal
from back.info.model import (
    Notice, DailySafetyInfo, EmergencyAlert, 
    Attendance, SafetyViolation, Weather
)

async def create_dashboard_data():
    async with AsyncSessionLocal() as db:
        print("🔧 대시보드 데이터 생성 시작...")
        
        # 1. 기존 데이터 삭제
        print("   - 기존 대시보드 데이터 삭제 중...")
        await db.execute(text("DELETE FROM safety_violations"))
        await db.execute(text("DELETE FROM attendance"))
        await db.execute(text("DELETE FROM emergency_alerts"))
        await db.execute(text("DELETE FROM daily_safety_info"))
        await db.execute(text("DELETE FROM notices"))
        await db.execute(text("DELETE FROM weather"))
        await db.commit()
        print("   ✅ 기존 데이터 삭제 완료")
        
        today = str(date.today())
        
        # 2. 날씨 정보
        weather = Weather(
            id=1,
            date=today,
            temperature="2.7°C",
            condition="흐림",
            humidity="65%",
            wind_speed="3.2m/s"
        )
        db.add(weather)
        
        # 3. 긴급알림
        alerts = [
            EmergencyAlert(
                id=1,
                title="강풍 주의보",
                message="오후 3시부터 강풍이 예상됩니다. 고소작업 주의 바랍니다.",
                severity="HIGH",
                is_active=True
            )
        ]
        for alert in alerts:
            db.add(alert)
        
        # 4. 일일 안전정보
        safety_infos = [
            DailySafetyInfo(
                id=1,
                date=today,
                title="동절기 안전수칙",
                content="동절기 미끄럼 사고 예방을 위해 안전화 착용을 철저히 해주세요.",
                is_read_by_worker=""  # 아무도 안 읽음
            ),
            DailySafetyInfo(
                id=2,
                date=today,
                title="화기작업 안전수칙",
                content="용접작업 시 반드시 소화기를 배치하고 작업허가증을 받으세요.",
                is_read_by_worker="1"  # worker_id=1 (김철수)만 읽음
            )
        ]
        for info in safety_infos:
            db.add(info)
        
        # 5. 금일 출역현황 (worker1, worker2, worker3)
        attendances = [
            Attendance(
                id=1,
                worker_id=1,  # 김철수
                date=today,
                check_in_time="07:55",
                check_out_time=None,
                status="PRESENT"
            ),
            Attendance(
                id=2,
                worker_id=2,  # 이영희
                date=today,
                check_in_time="08:10",
                check_out_time=None,
                status="LATE"
            ),
            Attendance(
                id=3,
                worker_id=3,  # 박민수
                date=today,
                check_in_time="07:50",
                check_out_time=None,
                status="PRESENT"
            )
        ]
        for att in attendances:
            db.add(att)
        
        # 6. 안전위반 (worker1: 2건, worker2: 1건, worker3: 0건)
        violations = [
            SafetyViolation(
                id=1,
                worker_id=1,  # 김철수
                date=today,
                violation_type="안전모 미착용",
                description="3층 작업 중 안전모를 벗고 작업",
                severity="HIGH"
            ),
            SafetyViolation(
                id=2,
                worker_id=1,  # 김철수
                date=today,
                violation_type="안전대 미착용",
                description="고소작업 중 안전대 미착용 적발",
                severity="CRITICAL"
            ),
            SafetyViolation(
                id=3,
                worker_id=2,  # 이영희
                date=today,
                violation_type="작업허가 미확인",
                description="화기작업 허가증 없이 작업 진행",
                severity="MEDIUM"
            )
        ]
        for vio in violations:
            db.add(vio)
        
        # 7. 공지사항
        notices = [
            Notice(
                id=1,
                title="안전의식 제고 캠페인 실시",
                content="3월부터 안전의식 제고 캠페인이 진행됩니다. 적극적인 참여 부탁드립니다.",
                priority="NORMAL"
            ),
            Notice(
                id=2,
                title="[긴급] 내일 전체 안전교육 실시",
                content="내일(2월 3일) 오전 8시 전체 작업자 안전교육이 진행됩니다. 필참 바랍니다.",
                priority="URGENT"
            )
        ]
        for notice in notices:
            db.add(notice)
        
        await db.commit()
        
        print("✅ 대시보드 데이터 생성 완료!")
        print(f"   - 날씨: 1건")
        print(f"   - 긴급알림: 1건")
        print(f"   - 일일 안전정보: 2건")
        print(f"   - 금일 출역현황: 3건")
        print(f"   - 안전위반: 3건 (김철수 2건, 이영희 1건)")
        print(f"   - 공지사항: 2건")
        print("")
        print("📌 각 작업자별 데이터:")
        print("   - worker1 (김철수): 안전위반 2건, 출근 정상")
        print("   - worker2 (이영희): 안전위반 1건, 지각")
        print("   - worker3 (박민수): 안전위반 0건, 출근 정상")

if __name__ == "__main__":
    asyncio.run(create_dashboard_data())
