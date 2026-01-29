from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from back.database import engine, Base
import asyncio

# 모듈별 라우터 임포트
from back.auth.router import router as auth_router
from back.map.router import router as map_router, simulate_worker_movement

# DB 테이블 생성 (프로토타입용 Auto Migration)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Safety Guardian API")

# CORS 설정 (프론트엔드 포트 허용)
origins = [
    "http://localhost:5173", # Vite dev server
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 마운트 (도면 이미지 서빙용)
app.mount("/static", StaticFiles(directory="back/static"), name="static")

# 라우터 등록
app.include_router(auth_router)
app.include_router(map_router)

@app.on_event("startup")
async def startup_event():
    # 백그라운드에서 작업자 이동 시뮬레이션 시작
    asyncio.create_task(simulate_worker_movement())

@app.get("/")
def read_root():
    return {"message": "Smart Safety Guardian API is running"}
