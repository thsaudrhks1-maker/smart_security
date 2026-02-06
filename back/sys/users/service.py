
from back.sys.users.repository import users_repository
import bcrypt

class users_service:
    """[SYS_USERS] 로그인 및 회원가입 비즈니스 로직"""
    @staticmethod
    async def authenticate(username: str, password: str):
        user = await users_repository.get_by_username(username)
        if not user:
            return None
            
        # DB의 password가 bytes일 수도, str일 수도 있으므로 안전하게 처리
        db_pw = user['hashed_password']
        if isinstance(db_pw, str):
            db_pw = db_pw.encode('utf-8')
            
        try:
            if bcrypt.checkpw(password.encode('utf-8'), db_pw):
                return user
        except Exception as e:
            print(f"Password check error: {e}")
            
        return None
