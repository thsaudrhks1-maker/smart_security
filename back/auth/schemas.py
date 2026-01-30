from pydantic import BaseModel
from typing import Optional

# 로그인 요청 DTO
class LoginRequest(BaseModel):
    username: str # 사번 또는 이름
    password: str

# 회원가입 요청 DTO
class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "worker" # 기본값 worker

# 토큰 응답 DTO
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

# 사용자 정보 DTO
class User(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str # worker / manager / admin
