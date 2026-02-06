
from sqlalchemy import Column, Integer, String, ForeignKey, Float
from back.database import Base


class project_zones(Base):
    """[PROJECT] 현장 내 세부 구역 (Grid 기반)"""
    __tablename__ = "project_zones"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False) # 예: 1F-A1, B1-C3 등
    level = Column(String, nullable=False) # 층 정보 (1F, B1 등)
    row_index = Column(Integer, nullable=True)
    col_index = Column(Integer, nullable=True)
    zone_type = Column(String, default="NORMAL") # NORMAL, DANGER, RESTRICTED
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
