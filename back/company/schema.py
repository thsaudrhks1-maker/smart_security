from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    type: Optional[str] = "SPECIALTY" # GENERAL(원청), SPECIALTY(협력사)
    trade_type: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyRead(CompanyBase):
    id: int
    class Config:
        from_attributes = True

class WorkerBase(BaseModel):
    name: str
    trade: str
    status: Optional[str] = "OFF_SITE"
    qualification_tags: Optional[str] = None

class WorkerRead(WorkerBase):
    id: int
    company_id: int
    company_name: Optional[str] = None # Enriched
    
    class Config:
        from_attributes = True
