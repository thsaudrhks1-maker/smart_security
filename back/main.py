
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# [Standard] 새 도메인 라우터 임포트
from back.sys.router import router as sys_router
from back.project.router import router as project_router
from back.content.router import router as content_router
from back.daily.router import router as daily_router

app = FastAPI(title="Smart Security Standard API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [Standard] 중앙 집중식 API 라우팅
app.include_router(sys_router, prefix="/api/sys", tags=["System"])
app.include_router(project_router, prefix="/api/project", tags=["Project"])
app.include_router(content_router, prefix="/api/content", tags=["Content"])
app.include_router(daily_router, prefix="/api/daily", tags=["Daily"])

@app.get("/")
async def root():
    return {"message": "Smart Security API is running with Global Standard Architecture"}