
from back.daily.attendance.repository import attendance_repository
from datetime import date

class attendance_service:
    """[DAILY_ATTENDANCE] 비즈니스 로직"""
    @staticmethod
    async def get_today_list(pid: int):
        return await attendance_repository.get_by_date(pid, date.today())
