
from sqlalchemy import Column, Integer, String, ForeignKey, Float
from back.database import Base

class project_sites(Base):
    """[PROJECT] 현장"""
    __tablename__ = "project_sites"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)

class project_zones(Base):
    """[PROJECT] 현장 내 구역"""
    __tablename__ = "project_zones"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    site_id = Column(Integer, ForeignKey("project_sites.id", ondelete="CASCADE"), nullable=False)
    level = Column(String, nullable=False)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
