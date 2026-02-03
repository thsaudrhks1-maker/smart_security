from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, comment="제목")
    content = Column(Text, nullable=False, comment="내용")
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="작성자(관리자)")
    
    is_important = Column(Boolean, default=False, comment="중요 공지 여부")
    created_at = Column(DateTime, default=datetime.now)

    author = relationship("User")
