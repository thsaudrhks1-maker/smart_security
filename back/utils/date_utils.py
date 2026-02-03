from datetime import date, datetime
from typing import Union

def get_today() -> date:
    """오늘 날짜를 반환합니다 (date 객체)."""
    return date.today()

def format_to_str(d: Union[date, datetime]) -> str:
    """date/datetime 객체를 YYYY-MM-DD 문자열로 변환합니다."""
    if d is None:
        return ""
    return d.strftime("%Y-%m-%d")

def parse_from_str(s: str) -> date:
    """YYYY-MM-DD 문자열을 date 객체로 변환합니다. 실패 시 에러 발생."""
    return datetime.strptime(s, "%Y-%m-%d").date()

def ensure_date(val: Union[str, date, datetime]) -> date:
    """입력값이 문자열이면 date로 변환하고, date/datetime이면 date를 반환합니다. (안전 장치)"""
    if isinstance(val, str):
        return parse_from_str(val)
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    raise ValueError(f"Cannot convert {type(val)} to date")
