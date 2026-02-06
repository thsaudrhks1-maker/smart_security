
from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str = "worker"
