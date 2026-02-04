# Smart Security API (Force Reload)
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from back.database import Base, engine, get_db
import asyncio

# 모듈별 라우터 임포트
# 모듈별 라우터 임포트
from back.auth.router import router as auth_router
from back.project.router import router as project_router
from back.map.router import router as map_router, simulate_worker_movement
from back.work.router import router as work_router
from back.company.router import router as company_router
from back.safety.router import router as safety_router
from back.dashboard.router import router as dashboard_router
from back.worker.router import router as worker_router
from back.admin.router import router as admin_router
from back.manager.router import router as manager_router # [NEW]
from back.attendance.router import router as attendance_router # [NEW]
from back.notice.router import router as notice_router

app = FastAPI(title="Smart Security AI API")

# CORS 설정 (프론트엔드 포트 허용)
# allow_credentials=True일 때는 allow_origins에 '*'를 사용할 수 없음
origins = [
    "http://localhost:3500",
    "http://127.0.0.1:3500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8500",
]
# 추가로 와일드카드 느낌의 루프백/로컬 전체 허용 (안전한 개발 환경용)
allow_origin_regex = r"http://(localhost|127\.0\.0\.1|168\.107\.52\.\d+):[0-9]+"


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex, # 정규식 기반 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 도면 등 정적 파일 서빙 (업로드된 도면 이미지)
import os as _os
_static_path = _os.path.join(_os.path.dirname(__file__), "static")
if _os.path.isdir(_static_path):
    app.mount("/static", StaticFiles(directory=_static_path), name="static")

# 라우터 등록 (/api 공통 접두어 부여로 프론트엔드 호환성 유지)
app.include_router(auth_router, prefix="/api")
app.include_router(project_router, prefix="/api")
app.include_router(map_router, prefix="/api")
app.include_router(work_router, prefix="/api")
app.include_router(company_router, prefix="/api")
app.include_router(safety_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(worker_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(manager_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")
app.include_router(notice_router, prefix="/api")

# --- Admin / Data Endpoints ---
# --- Admin / Data Endpoints deleted (moved to back/admin/router.py) ---

@app.on_event("startup")
async def startup_event():
    # 백그라운드에서 작업자 이동 시뮬레이션 시작
    asyncio.create_task(simulate_worker_movement())

@app.get("/")
def read_root():
    print("ROOT ACCESSED - RELOAD CHECK")
    return {"message": "Smart Safety Guardian API is running"}