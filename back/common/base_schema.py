"""
Base Pydantic 스키마
- 모든 Response 스키마의 Base 클래스
- date, datetime 타입을 JSON 직렬화 시 자동으로 ISO 포맷 문자열로 변환
"""
from pydantic import BaseModel
from datetime import date, datetime
from typing import Any


class BaseResponseSchema(BaseModel):
    """
    모든 Read/Response 스키마의 Base 클래스
    - date, datetime 타입을 자동으로 ISO 포맷 문자열로 변환 (YYYY-MM-DD, ISO 8601)
    - from_attributes=True로 SQLAlchemy ORM 모델을 자동 변환
    """
    class Config:
        from_attributes = True  # SQLAlchemy ORM 모델 → Pydantic 자동 변환
        json_encoders = {
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None,
        }


class BaseCreateSchema(BaseModel):
    """
    모든 Create 스키마의 Base 클래스
    - 날짜는 str (YYYY-MM-DD) 또는 date 타입으로 정의
    """
    pass


class BaseUpdateSchema(BaseModel):
    """
    모든 Update 스키마의 Base 클래스
    - 모든 필드 Optional
    """
    pass
