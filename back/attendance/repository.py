from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from back.attendance.model import Attendance, AttendanceStatus
from back.attendance.schema import CheckInRequest

class AttendanceRepository:
    
    @staticmethod
    async def get_today_attendance(db: AsyncSession, user_id: int):
        """오늘 날짜의 출근 기록 조회"""
        today = datetime.now().date()
        result = await db.execute(
            select(Attendance)
            .where(Attendance.user_id == user_id)
            .where(Attendance.date == today)
        )
        return result.scalars().first()

    @staticmethod
    async def check_in(db: AsyncSession, user_id: int, req: CheckInRequest):
        """출근 처리"""
        today = datetime.now().date()
        now = datetime.now()
        
        # 이미 출근했는지 확인
        existing = await AttendanceRepository.get_today_attendance(db, user_id)
        if existing:
            return existing # 이미 있으면 그 객체 반환
        
        # 새 출근 기록 생성
        # 지각 판단 로직 (예: 9시 이후면 지각) - 필요 시 추가
        status = AttendanceStatus.PRESENT 
        if now.hour >= 9 and now.minute > 0:
            status = AttendanceStatus.LATE

        new_attendance = Attendance(
            user_id=user_id,
            project_id=req.project_id,
            work_type_id=req.work_type_id,
            date=today,
            check_in_time=now,
            check_in_method=req.check_in_method,
            status=status
        )
        
        db.add(new_attendance)
        await db.commit()
        await db.refresh(new_attendance)
        return new_attendance

    @staticmethod
    async def check_out(db: AsyncSession, user_id: int, attendance_id: int):
        """퇴근 처리"""
        # 해당 ID의 기록을 가져오되, 본인 것인지 확인
        result = await db.execute(select(Attendance).where(Attendance.id == attendance_id, Attendance.user_id == user_id))
        attendance = result.scalars().first()
        
        if not attendance:
            return None
            
        attendance.check_out_time = datetime.now()
        # 조퇴 판단 로직 (예: 17시 이전이면 조퇴) - 필요 시 추가
        
        await db.commit()
        await db.refresh(attendance)
        return attendance
