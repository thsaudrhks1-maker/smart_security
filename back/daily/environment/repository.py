
from back.database import fetch_one, insert_and_return
from datetime import date

class environment_repository:
    """[DAILY_ENV] 날씨 및 환경 데이터 접근"""
    @staticmethod
    async def get_weather(d: date):
        return await fetch_one("SELECT * FROM daily_weather WHERE date = :d", {"d": d})
