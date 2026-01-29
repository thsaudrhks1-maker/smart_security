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

class AuthRepository:
    def __init__(self, db):
        self.db = db

    def get_user_by_username(self, username: str):
        return self.db.query(UserModel).filter(UserModel.username == username).first()
    
    # 프로토타입용: 사용자 생성 (테스트용)
    def create_user(self, user: UserModel):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
