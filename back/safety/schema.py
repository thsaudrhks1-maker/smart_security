from pydantic import BaseModel
from typing import Optional

class ZoneBase(BaseModel):
    name: str
    level: str
    type: str # INDOOR, OUTDOOR...
    lat: Optional[float] = None
    lng: Optional[float] = None

class ZoneRead(ZoneBase):
    id: int
    site_id: int
    
    class Config:
        from_attributes = True
