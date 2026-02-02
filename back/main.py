from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from back.database import Base, engine, get_db
import asyncio

# 모듈별 라우터 임포트
# 모듈별 라우터 임포트
from back.auth.router import router as auth_router
from back.map.router import router as map_router, simulate_worker_movement
from back.work.router import router as work_router
from back.company.router import router as company_router
from back.safety.router import router as safety_router
from back.dashboard.router import router as dashboard_router
from back.worker.router import router as worker_router
from back.admin.router import router as admin_router

app = FastAPI(title="Smart Safety Guardian API")

# CORS 설정 (프론트엔드 포트 허용)
origins = [
    "http://localhost:3500",
    "http://127.0.0.1:3500",
    "http://168.107.52.201:3500",
    "http://localhost:5173",      # Vite 기본 포트
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
app.include_router(auth_router)
app.include_router(map_router)
app.include_router(work_router)
app.include_router(company_router)
app.include_router(safety_router)
app.include_router(dashboard_router)
app.include_router(worker_router)
app.include_router(admin_router)

# --- Admin / Data Endpoints ---
@app.get("/admin/db/workers")
async def get_all_workers_admin(
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_active_user) # 권한 체크는 추후 적용
):
    """
    관리자용: 모든 작업자 정보 조회 (엑셀 뷰용)
    """
    from sqlalchemy.future import select
    from back.company.model import Worker
    from back.auth.model import UserModel

    # Worker와 User 조인
    query = select(Worker, UserModel).join(UserModel, Worker.user_id == UserModel.id)
    result = await db.execute(query)
    rows = result.all()

    data = []
    for worker, user in rows:
        data.append({
            "id": worker.id,
            "name": worker.name,
            "username": user.username,
            "role": user.role,
            "birth_date": worker.birth_date,
            "phone_number": user.phone_number,
            "trade": worker.trade,
            "address": worker.address,
            "company_id": worker.company_id,
            "status": worker.status
        })
    return data

@app.on_event("startup")
async def startup_event():
    # 백그라운드에서 작업자 이동 시뮬레이션 시작
    asyncio.create_task(simulate_worker_movement())

@app.get("/")
def read_root():
    print("ROOT ACCESSED - RELOAD CHECK")
    return {"message": "Smart Safety Guardian API is running"}