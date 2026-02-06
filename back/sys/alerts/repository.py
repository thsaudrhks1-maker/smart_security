
from back.database import fetch_all, fetch_one, insert_and_return

class alerts_repository:
    """[SYS_ALERTS] 긴급 알림 데이터 접근"""
    @staticmethod
    async def get_active():
        return await fetch_all("SELECT * FROM sys_emergency_alerts WHERE is_active = true ORDER BY created_at DESC")
