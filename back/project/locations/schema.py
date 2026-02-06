
from pydantic import BaseModel
from typing import Optional

class SiteResponse(BaseModel):
    id: int
    name: str

class ZoneResponse(BaseModel):
    id: int
    level: str
    name: str

class RiskZone(BaseModel):
    id: Optional[int] = None
    name: str
    type: str # equipment, opening, falling
    lat: float
    lng: float
    radius: float

class WorkerBox(BaseModel):
    id: int
    name: str
    role: str
    lat: float
    lng: float
    status: str # 'SAFE', 'DANGER'
