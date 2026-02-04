from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, date
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

    @staticmethod
    def _parse_date(value):
        """str 'YYYY-MM-DD' 또는 date -> date. PostgreSQL DATE 바인딩용."""
        if value is None:
            return date.today()
        if isinstance(value, date) and not isinstance(value, datetime):
            return value
        if isinstance(value, str):
            return date.fromisoformat(value[:10])
        return value

    @staticmethod
    async def get_project_attendance_list(db: AsyncSession, project_id: int, target_date: str = None):
        """
        프로젝트별 출역 명단 조회 (Raw SQL)
        - target_date가 없으면 오늘 날짜 기준. DB DATE 컬럼에는 date 객체로 전달.
        """
        from sqlalchemy import text

        plan_date = AttendanceRepository._parse_date(target_date)

        query = text("""
            SELECT 
                a.id,
                a.user_id,
                u.full_name,
                c.name as company_name,
                u.job_type,
                a.check_in_time,
                a.check_out_time,
                a.status,
                a.check_in_method
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE a.project_id = :project_id
              AND a.date = :target_date
            ORDER BY a.check_in_time DESC
        """)

        result = await db.execute(query, {"project_id": project_id, "target_date": plan_date})
        
        # 딕셔너리 형태로 변환하여 반환
        return [dict(row._mapping) for row in result]

    @staticmethod
    async def get_my_attendance_list(
        db: AsyncSession,
        user_id: int,
        start_date: date,
        end_date: date,
    ):
        """
        작업자 본인 출근 내역 조회 (기간별)
        - 근무회사, 나의 파트(역할), 당일 작업내용(일일 계획 설명) 포함
        """
        from sqlalchemy import text

        query = text("""
            SELECT
                a.id,
                a.date,
                a.check_in_time,
                a.check_out_time,
                a.status,
                c.name AS company_name,
                pm.role_name AS my_part,
                (
                    SELECT p.description
                    FROM worker_allocations wa
                    JOIN daily_work_plans p ON wa.plan_id = p.id
                    WHERE wa.worker_id = a.user_id AND p.date = a.date
                    LIMIT 1
                ) AS work_description
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN companies c ON u.company_id = c.id
            LEFT JOIN project_members pm ON pm.user_id = a.user_id
                AND pm.project_id = a.project_id AND pm.status = 'ACTIVE'
            WHERE a.user_id = :user_id
              AND a.date >= :start_date
              AND a.date <= :end_date
            ORDER BY a.date DESC
        """)
        result = await db.execute(
            query,
            {
                "user_id": user_id,
                "start_date": AttendanceRepository._parse_date(start_date),
                "end_date": AttendanceRepository._parse_date(end_date),
            },
        )
        return [dict(row._mapping) for row in result]
