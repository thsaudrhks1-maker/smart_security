from datetime import date, datetime
from typing import Union

def get_today() -> date:
    """오늘 날짜를 반환합니다 (date 객체). DB 쿼리용으로 권장됩니다."""
    return date.today()

def get_now() -> datetime:
    """현재 날짜와 시간을 반환합니다 (datetime 객체). 출퇴근 기록용으로 권장됩니다."""
    return datetime.now()

def ensure_date(val: Union[str, date, datetime]) -> date:
    """
    다양한 입력을 date 객체로 안전하게 변환합니다.
    API 파라미터(문자열)를 받아 DB 쿼리 객체로 만들 때 사용합니다.
    """
    if isinstance(val, date) and not isinstance(val, datetime):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, str):
        try:
            # YYYY-MM-DD 형식 파싱
            return datetime.strptime(val[:10], "%Y-%m-%d").date()
        except ValueError:
            return date.today() # 파싱 실패 시 기본값
    return val

def format_to_str(d: Union[date, datetime]) -> str:
    """객체를 문자열로 변환합니다 (주로 프론트엔드 응답용)."""
    if not d: return ""
    return d.strftime("%Y-%m-%d")

def format_to_datetime_str(dt: datetime) -> str:
    """객체를 일시 문자열로 변환합니다 (YYYY-MM-DD HH:MM:SS)."""
    if not dt: return ""
    return dt.strftime("%Y-%m-%d %H:%M:%S")
