
from back.daily.attendance.repository import attendance_repository
from datetime import date

class attendance_service:
    """[DAILY_ATTENDANCE] 비즈니스 로직"""
    @staticmethod
    async def get_today_list(pid: int):
        return await attendance_repository.get_by_date(pid, date.today())

    @staticmethod
    async def get_my_status(uid: int):
        return await attendance_repository.get_user_today(uid, date.today())

    @staticmethod
    async def do_check_in(uid: int, pid: int):
        return await attendance_repository.upsert_check_in(uid, pid, date.today())

