from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from back.database import engine, Base
import asyncio

# 모듈별 라우터 임포트
# 모듈별 라우터 임포트
from back.auth.router import router as auth_router
from back.map.router import router as map_router, simulate_worker_movement
from back.work.router import router as work_router
from back.company.router import router as company_router
from back.safety.router import router as safety_router
from back.dashboard.router import router as dashboard_router

app = FastAPI(title="Smart Safety Guardian API")

# CORS 설정 (프론트엔드 포트 허용)
origins = [
    "http://localhost:3005",
    "http://127.0.0.1:3005",
    "http://168.107.52.201:3005",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth_router)
app.include_router(map_router)
app.include_router(work_router)
app.include_router(company_router)
app.include_router(safety_router)
app.include_router(dashboard_router)

@app.on_event("startup")
async def startup_event():
    # 백그라운드에서 작업자 이동 시뮬레이션 시작
    asyncio.create_task(simulate_worker_movement())

@app.get("/")
def read_root():
    print("ROOT ACCESSED - RELOAD CHECK") 
    return {"message": "Smart Safety Guardian API is running"}
 