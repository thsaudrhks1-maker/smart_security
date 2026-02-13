
from fastapi import APIRouter, HTTPException, Request
from back.project.master.repository import project_repository
from back.database import execute

router = APIRouter()

@router.get("")
async def list_projects():
    projects = await project_repository.get_all()
    return {"success": True, "data": projects}

@router.post("")
async def create_project(request: Request):
    data = await request.json()
    try:
        project_id = await project_repository.create_full_project(data)
        return {"success": True, "message": "프로젝트가 성공적으로 생성되었습니다.", "project_id": project_id}
    except Exception as e:
        print(f"Project Create Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}")
async def get_project(project_id: int):
    project = await project_repository.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return {"success": True, "data": project}

@router.get("/{project_id}/detail")
async def get_project_detail(project_id: int):
    """프로젝트 상세 정보 (업체, 관리자, 협력업체, 작업자 포함)"""
    detail = await project_repository.get_project_detail(project_id)
    if not detail:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return {"success": True, "data": detail}

@router.put("/{project_id}")
async def update_project(project_id: int, request: Request):
    """프로젝트 정보 업데이트 (격자 각도 조절 등)"""
    data = await request.json()
    try:
        await project_repository.update_project(project_id, data)
        return {"success": True, "message": "프로젝트 정보가 업데이트되었습니다."}
    except Exception as e:
        print(f"Project Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/approve-worker/{user_id}")
async def approve_worker(project_id: int, user_id: int):
    """작업자 승인 (project_users에 추가)"""
    await execute(
        "INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (:pid, :uid, 'worker', 'ACTIVE')",
        {"pid": project_id, "uid": user_id}
    )
    return {"success": True, "message": "작업자가 승인되었습니다."}

@router.delete("/{project_id}")
async def delete_project(project_id: int):
    await project_repository.delete_project(project_id)
    return {"success": True, "message": "프로젝트가 삭제되었습니다."}
