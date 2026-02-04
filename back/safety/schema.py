from pydantic import BaseModel
from typing import Optional

class ZoneBase(BaseModel):
    name: str
    level: str
    type: str  # INDOOR, OUTDOOR, ROOF, PIT, DANGER
    lat: Optional[float] = None
    lng: Optional[float] = None
    default_hazards: Optional[list] = None


class ZoneCreate(ZoneBase):
    site_id: int


class ZoneRead(ZoneBase):
    id: int
    site_id: int

    class Config:
        from_attributes = True
