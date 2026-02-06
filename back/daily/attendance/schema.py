
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    check_in_time: Optional[datetime] = None
