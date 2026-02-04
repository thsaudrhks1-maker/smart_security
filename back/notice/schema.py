from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class NoticeBase(BaseModel):
    title: str
    content: str
    is_important: bool = False
    image_url: Optional[str] = None

class NoticeCreate(NoticeBase):
    project_id: int

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_important: Optional[bool] = None
    image_url: Optional[str] = None

class NoticeResponse(NoticeBase):
    id: int
    project_id: int
    author_id: int
    author_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
