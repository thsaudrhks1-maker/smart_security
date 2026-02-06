
from back.sys.repository import sys_repository
from back.sys.schema import UserCreate
import bcrypt

class sys_service:
    """[SYS] 사용자 인증 및 업체 관리 비즈니스 로직"""

    @staticmethod
    async def register_user(user_in: UserCreate):
        # 비밀번호 해싱
        hashed = bcrypt.hashpw(user_in.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_dict = user_in.model_dump()
        user_dict['hashed_password'] = hashed
        del user_dict['password']
        
        return await sys_repository.create_user(user_dict)

    @staticmethod
    async def get_login_user(username: str):
        return await sys_repository.get_user_by_username(username)
