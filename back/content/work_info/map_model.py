
from sqlalchemy import Column, Integer, ForeignKey
from back.database import Base

class content_work_safety_map(Base):
    """[CONTENT] 작업 정보 - 안전 정보 매핑 테이블 (N:M)"""
    __tablename__ = "content_work_safety_map"
    
    id = Column(Integer, primary_key=True, index=True)
    work_info_id = Column(Integer, ForeignKey("content_work_info.id", ondelete="CASCADE"), nullable=False)
    safety_info_id = Column(Integer, ForeignKey("content_safety_info.id", ondelete="CASCADE"), nullable=False)
