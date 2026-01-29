from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# .env 로드
load_dotenv()

# SQLite DB URL (프로토타입용)
SQLALCHEMY_DATABASE_URL = os.getenv("DB_URL", "sqlite:///./smart_security.db")

# SQLite는 멀티 스레드 통신을 위해 check_same_thread=False 필요
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency Injection용 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
