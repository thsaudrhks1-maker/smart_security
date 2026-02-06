
from pydantic import BaseModel
from typing import Optional

class CompanyBase(BaseModel):
    name: str
    type: Optional[str] = None
    trade_type: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
