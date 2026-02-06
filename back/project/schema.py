
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "ACTIVE"

class ProjectResponse(ProjectBase):
    id: int
    site_count: Optional[int] = 0
    class Config:
        from_attributes = True

class SiteBase(BaseModel):
    project_id: int
    name: str
    address: Optional[str] = None

class ZoneBase(BaseModel):
    site_id: int
    level: str
    name: str
