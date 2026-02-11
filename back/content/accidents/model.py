
from sqlalchemy import Column, Integer, String, Text, JSON, Date, DateTime
from back.database import Base
from datetime import datetime

class content_accidents(Base):
    """[CONTENT] 사고 사례 마스터 (CSI, KOSHA 데이터)"""
    __tablename__ = "content_accidents"

    id = Column(Integer, primary_key=True, index=True)
    data_source = Column(String, nullable=False, comment="데이터 출처 (CSI, KOSHA_CASE 등)")
    external_id = Column(String, unique=True, index=True, comment="외부기관 관리 ID")
    
    category = Column(String, index=True, comment="사고 유형 (추락, 붕괴 등)")
    title = Column(String, nullable=False, comment="사고명")
    description = Column(Text, comment="상세 사고 경위 및 내용")
    cause = Column(Text, comment="사고 원인")
    
    location = Column(String, comment="발생 지역/장소")
    occurred_at = Column(Date, comment="사고 발생 일자")
    
    # AI 가공 컬럼
    summary = Column(Text, comment="Gemini AI가 가공한 근로자용 친절한 요약 메시지")
    embedding = Column(JSON, comment="벡터 검색을 위한 임베딩 데이터 (768차원)")
    
    created_at = Column(DateTime, default=datetime.now)
