
from sqlalchemy import Column, Integer, String, JSON, Text
from back.database import Base

class content_safety_info(Base):
    """[CONTENT] 안전 표준 정보 및 점검 기준"""
    __tablename__ = "content_safety_info"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, comment="카테고리 (예: 고소작업, 밀폐공간, 중장비)")
    title = Column(String, nullable=False, comment="표준 제목")
    description = Column(Text, nullable=True, comment="상세 설명")
    checklist = Column(JSON, nullable=True, comment="점검 항목 리스트")
    risk_factors = Column(JSON, nullable=True, comment="주요 위험 요소")
    safety_measures = Column(JSON, nullable=True, comment="안전 조치 사항")
    required_ppe = Column(JSON, nullable=True, comment="필수 보호구")
    
    # AI 가공 관련 컬럼 추가
    summary = Column(Text, nullable=True, comment="Gemini AI가 요약한 핵심 지문 (임베딩 대상)")
    embedding = Column(JSON, nullable=True, comment="AI 임베딩 벡터값 (Vector 타입과 매핑)")
