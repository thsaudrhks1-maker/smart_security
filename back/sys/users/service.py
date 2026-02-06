
from back.sys.users.repository import users_repository
import bcrypt

class users_service:
    """[SYS_USERS] 로그인 및 회원가입 비즈니스 로직"""
    @staticmethod
    async def authenticate(username: str, password: str):
        user = await users_repository.get_by_username(username)
        if user and bcrypt.checkpw(password.encode('utf-8'), user['hashed_password'].encode('utf-8')):
            return user
        return None
