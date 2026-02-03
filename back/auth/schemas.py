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
    role: Optional[str] = "worker"
    
    # [신규] 상세 정보
    company_id: Optional[int] = None
    job_type: Optional[str] = None # 직종 (전기, 설비...)
    title: Optional[str] = None    # 직위 (반장, 소장...)
    phone: Optional[str] = None
    birth_date: Optional[str] = None

# 토큰 응답 DTO
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    full_name: Optional[str] = None
    role: str
    user_id: Optional[int] = None
    birth_date: Optional[str] = None

# 사용자 정보 DTO
class User(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str # worker / manager / admin
