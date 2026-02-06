
from back.database import fetch_all, fetch_one, insert_and_return
from datetime import date

class attendance_repository:
    """[DAILY_ATTENDANCE] 데이터 접근"""
    @staticmethod
    async def get_by_date(pid: int, d: date):
        sql = """
            SELECT a.*, u.full_name, c.name as company_name 
            FROM daily_attendance a
            JOIN sys_users u ON a.user_id = u.id
            LEFT JOIN sys_companies c ON u.company_id = c.id
            WHERE a.project_id = :pid AND a.date = :d
        """
        return await fetch_all(sql, {"pid": pid, "d": d})

    @staticmethod
    async def get_user_today(uid: int, d: date):
        sql = "SELECT * FROM daily_attendance WHERE user_id = :uid AND date = :d"
        return await fetch_one(sql, {"uid": uid, "d": d})

    @staticmethod
    async def upsert_check_in(uid: int, pid: int, d: date):
        from datetime import datetime
        # 이미 있는지 확인
        existing = await attendance_repository.get_user_today(uid, d)
        if existing:
            sql = "UPDATE daily_attendance SET check_in_time = :now, status = 'IN' WHERE id = :id"
            await insert_and_return(sql, {"now": datetime.now(), "id": existing['id']})
        else:
            sql = """
                INSERT INTO daily_attendance (user_id, project_id, date, check_in_time, status)
                VALUES (:uid, :pid, :d, :now, 'IN')
                RETURNING *
            """
            await insert_and_return(sql, {"uid": uid, "pid": pid, "d": d, "now": datetime.now()})
        return True

