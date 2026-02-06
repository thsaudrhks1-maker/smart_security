
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from back.sys.users.router import router as users_router
from back.sys.companies.router import router as companies_router
from back.project.master.router import router as project_router
from back.project.locations.router import router as locations_router
from back.content.work_manuals.router import router as manuals_router
from back.daily.attendance.router import router as attendance_router
from back.daily.notices.router import router as notices_router

app = FastAPI(title="Smart Security API")

# CORS 해결: allow_origins를 와일드카드(*) 대신 실제 주소로 명시
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3500",
        "http://localhost:5173",  # Vite 기본 포트
        "http://127.0.0.1:3500",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [SYS]
app.include_router(users_router, prefix="/api/sys/users", tags=["SYS_Users"])
app.include_router(companies_router, prefix="/api/sys/companies", tags=["SYS_Companies"])

# [PROJECT]
app.include_router(project_router, prefix="/api/project/master", tags=["Project_Master"])
app.include_router(locations_router, prefix="/api/project/locations", tags=["Project_Locations"])

# [CONTENT]
app.include_router(manuals_router, prefix="/api/content/manuals", tags=["Content_Manuals"])

# [DAILY]
app.include_router(attendance_router, prefix="/api/daily/attendance", tags=["Daily_Attendance"])
app.include_router(notices_router, prefix="/api/daily/notices", tags=["Daily_Notices"])

@app.get("/")
async def root():
    return {"message": "Smart Security Domain API is running"}