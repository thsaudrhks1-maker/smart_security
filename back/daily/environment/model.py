
from sqlalchemy import Column, Integer, String, Date, Float
from back.database import Base

class daily_weather(Base):
    """[DAILY] 일일 기상 데이터"""
    __tablename__ = "daily_weather"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False)
    temperature = Column(Float)
    condition = Column(String) # CLEAR, RAIN, SNOW, WINDY
