
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from back.database import fetch_all, execute

router = APIRouter()

class WorkerApprovalRequest(BaseModel):
    user_id: int
    project_id: int  # [추가] 어떤 프로젝트에서의 요청인지 명시
    action: str  # "approve" or "reject"

@router.get("/dashboard")
async def get_dashboard_summary(project_id: int):
    """매니저 대시보드 요약 (임시)"""
    return {"success": True, "data": {}}

@router.get("/workers")
async def get_workers(project_id: int):
    # [수정] 하드코딩된 project_id = 1 제거
    sql = """
        SELECT 
            u.id, 
            u.full_name, 
            u.phone, 
            u.job_title as job_type, 
            c.name as company_name,
            pu.status as member_status,
            pu.joined_at
        FROM project_users pu
        JOIN sys_users u ON pu.user_id = u.id
        LEFT JOIN sys_companies c ON u.company_id = c.id
        WHERE pu.project_id = :pid AND u.role = 'worker'
        ORDER BY pu.joined_at DESC
    """
    workers = await fetch_all(sql, {"pid": project_id})
    return {"success": True, "data": workers}

@router.get("/companies")
async def get_companies(project_id: int):
    """협력사 목록 (프로젝트 참여 업체 + 인원 통계 추가)"""
    # [수정] 하드코딩된 project_id = 1 제거
    sql = """
        SELECT 
            c.id, 
            c.name, 
            pc.role as type, 
            c.trade_type,
            (SELECT count(*) FROM sys_users u WHERE u.company_id = c.id) as total_staff,
            (SELECT count(*) FROM project_users pu 
             JOIN sys_users u ON pu.user_id = u.id 
             WHERE pu.project_id = :pid AND u.company_id = c.id AND pu.status = 'ACTIVE') as assigned_workers
        FROM project_companies pc
        JOIN sys_companies c ON pc.company_id = c.id
        WHERE pc.project_id = :pid
        ORDER BY 
            CASE pc.role WHEN 'CLIENT' THEN 1 WHEN 'CONSTRUCTOR' THEN 2 ELSE 3 END,
            c.name
    """
    companies = await fetch_all(sql, {"pid": project_id})
    return {"success": True, "data": companies}

@router.post("/workers/approval")
async def approve_or_reject_worker(req: WorkerApprovalRequest):
    """작업자 프로젝트 투입 승인/거절"""
    # [수정] 요청 바디에서 project_id를 가져옴
    
    if req.action == "approve":
        await execute("""
            UPDATE project_users 
            SET status = 'ACTIVE', joined_at = NOW()
            WHERE project_id = :pid AND user_id = :uid
        """, {"pid": req.project_id, "uid": req.user_id})
        return {"success": True, "message": "작업자가 승인되었습니다."}
    
    elif req.action == "reject":
        await execute("""
            UPDATE project_users 
            SET status = 'REJECTED'
            WHERE project_id = :pid AND user_id = :uid
        """, {"pid": req.project_id, "uid": req.user_id})
        return {"success": True, "message": "작업자가 거절되었습니다."}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
