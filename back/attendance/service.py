from back.attendance.repository import AttendanceRepository
from back.attendance.schema import CheckInRequest
from datetime import datetime
from typing import List, Dict, Any

class AttendanceService:
    """출결 비즈니스 로직 계층 (Service Pattern)"""

    @staticmethod
    async def process_check_in(user_id: int, req: CheckInRequest):
        """출근 로직 처리"""
        # 1. 이미 출근했는지 확인
        existing = await AttendanceRepository.get_today_attendance(user_id)
        if existing:
            return existing

        # 2. 지각 여부 판단 (9:00 기준)
        now = datetime.now()
        status = "PRESENT"
        if now.hour >= 9 and now.minute > 0:
            status = "LATE"

        # 3. 출근 기록 생성
        attendance_data = {
            "user_id": user_id,
            "project_id": req.project_id,
            "work_type_id": req.work_type_id,
            "date": now.date(),
            "check_in_time": now,
            "check_in_method": req.check_in_method,
            "status": status
        }
        return await AttendanceRepository.create_attendance(attendance_data)

    @staticmethod
    async def process_check_out(user_id: int, attendance_id: int):
        """퇴근 로직 처리"""
        result = await AttendanceRepository.update_check_out(attendance_id, user_id)
        return result

    @staticmethod
    async def get_project_attendance(project_id: int, target_date: str = None):
        return await AttendanceRepository.get_project_attendance_list(project_id, target_date)

    @staticmethod
    async def get_my_attendance(user_id: int, start_date: str, end_date: str):
        # 날짜 변환 로직은 Repository에서 처리함
        return await AttendanceRepository.get_my_attendance_list(user_id, start_date, end_date)
