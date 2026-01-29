from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from back.database import engine, Base
import asyncio

# 모듈별 라우터 임포트
from back.login.router import router as login_router
from back.map.router import router as map_router, simulate_worker_movement

# ... (중략) ...

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
 