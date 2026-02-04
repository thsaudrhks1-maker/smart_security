from pydantic import BaseModel
from typing import Optional, List

class ZoneBase(BaseModel):
    name: str
    level: str
    type: str  # INDOOR, OUTDOOR, ROOF, PIT, DANGER
    lat: Optional[float] = None
    lng: Optional[float] = None
    default_hazards: Optional[list] = None


class ZoneCreate(ZoneBase):
    site_id: int


class ZoneUpdate(BaseModel):
    """구역 부분 수정 (작업 위치 탭에서 좌표·층·구역명·타입·특징 등)"""
    name: Optional[str] = None
    level: Optional[str] = None
    type: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    default_hazards: Optional[list] = None


class ZoneRead(ZoneBase):
    id: int
    site_id: int

    class Config:
        from_attributes = True


# --- 일일 변동 위험 구역 (중장비, 화재 등 오늘만 해당하는 위험) ---
class DailyDangerZoneCreate(BaseModel):
    zone_id: int
    date: str  # YYYY-MM-DD
    risk_type: str  # HEAVY_EQUIPMENT, FIRE, FALL, ETC
    description: str


class DailyDangerZoneRead(BaseModel):
    id: int
    zone_id: int
    date: str
    risk_type: str
    description: str

    class Config:
        from_attributes = True
