
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str = "worker"
    company_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    name: str
    type: Optional[str] = None
    trade_type: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    class Config:
        from_attributes = True
