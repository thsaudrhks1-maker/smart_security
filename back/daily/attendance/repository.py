
from back.database import fetch_all, fetch_one, insert_and_return
from datetime import date

class attendance_repository:
    """[DAILY_ATTENDANCE] 데이터 접근"""
    @staticmethod
    async def get_by_date(pid: int, d: date):
        sql = """
            SELECT a.*, u.full_name FROM daily_attendance a
            JOIN sys_users u ON a.user_id = u.id
            WHERE a.project_id = :pid AND a.date = :d
        """
        return await fetch_all(sql, {"pid": pid, "d": d})
