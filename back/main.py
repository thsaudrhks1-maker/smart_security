from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from back.database import engine, Base
import asyncio

# 모듈별 라우터 임포트
from back.login.router import router as login_router
from back.map.router import router as map_router, simulate_worker_movement

# DB 테이블 생성 (비동기 엔진 사용 시 Alembic으로 관리하므로 생략 가능하나, 프로토타입 편의상 유지 시 engine 설정 주의 필요)
# 현재는 Alembic을 쓰므로 Base.metadata.create_all 관련 코드는 제거하거나 주석 처리함

app = FastAPI(title="Smart Safety Guardian API")

# CORS 설정 (프론트엔드 포트 허용)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(login_router)
app.include_router(map_router)

@app.on_event("startup")
async def startup_event():
    # 백그라운드에서 작업자 이동 시뮬레이션 시작
    asyncio.create_task(simulate_worker_movement())

@app.get("/")
def read_root():
    print("ROOT ACCESSED - RELOAD CHECK") 
    return {"message": "Smart Safety Guardian API is running"}
 