
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from back.utils.websocket_manager import notice_ws_manager
from back.sys.users.router import router as users_router
from back.sys.companies.router import router as companies_router
from back.project.master.router import router as project_router
from back.project.locations.router import router as locations_router
from back.content.work_info.router import router as work_info_router
from back.content.danger_info.router import router as danger_info_router
from back.daily.attendance.router import router as attendance_router
from back.daily.notices.router import router as notices_router
from back.daily.task_plans.router import router as task_plans_router
from back.daily.safety_logs.router import router as safety_logs_router
from back.daily.worker_locations.router import router as worker_locations_router
from back.content.safety_info.router import router as safety_info_router
from back.manager.router import router as manager_router
from back.admin.router import router as admin_router

from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Smart Security API")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS 해결: allow_origins를 와일드카드(*) 대신 실제 주소로 명시
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3500",
        "http://localhost:5173",
        "http://127.0.0.1:3500",
        "http://127.0.0.1:5173",
        "http://168.107.52.201:3500",
        "http://168.107.52.201:5173",
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
app.include_router(work_info_router, prefix="/api/content/work_info", tags=["Content_WorkInfo"])
app.include_router(danger_info_router, prefix="/api/content/danger_info", tags=["Content_DangerInfo"])
app.include_router(safety_info_router, prefix="/api/content/safety_info", tags=["Content_SafetyInfo"])

# [DAILY]
app.include_router(attendance_router, prefix="/api/daily/attendance", tags=["Daily_Attendance"])
app.include_router(notices_router, prefix="/api/daily/notices", tags=["Daily_Notices"])
app.include_router(task_plans_router, prefix="/api/daily/task_plans", tags=["Daily_TaskPlans"])
app.include_router(safety_logs_router, prefix="/api/daily/safety_logs", tags=["Daily_SafetyLogs"])
app.include_router(manager_router, prefix="/api/manager", tags=["Manager"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Smart Security Domain API is running"}