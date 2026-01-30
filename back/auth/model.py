from sqlalchemy import Column, String, Integer
from back.database import Base

# DB 모델 정의 (User)
class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="worker")

from sqlalchemy import select

class AuthRepository:
    def __init__(self, db):
        self.db = db

    async def get_user_by_username(self, username: str):
        result = await self.db.execute(select(UserModel).where(UserModel.username == username))
        return result.scalars().first()
    
    # 프로토타입용: 사용자 생성 (테스트용)
    async def create_user(self, user: UserModel):
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
