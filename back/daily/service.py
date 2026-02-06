
from back.daily.repository import daily_repository
from datetime import date, datetime

class daily_service:
    """[DAILY] 출역 체크 및 일일 작업 관리 로직"""

    @staticmethod
    async def process_check_in(user_id: int, project_id: int):
        """출근 처리 (중복 체크 포함)"""
        today = date.today()
        existing = await daily_repository.get_attendance(project_id, today)
        # 이미 출근했는지 필터링 로직 (생략)
        
        data = {
            "user_id": user_id,
            "project_id": project_id,
            "date": today,
            "check_in_time": datetime.now(),
            "status": "PRESENT"
        }
        # Repository에 인서트 요청 로직 호출...
        return data

    @staticmethod
    async def get_daily_dashboard(project_id: int):
        """오늘의 현황 요약 (출역수, 위험작업수)"""
        today = date.today()
        attendance = await daily_repository.get_attendance(project_id, today)
        # 추가 요약 로직...
        return {"attendance_count": len(attendance)}
