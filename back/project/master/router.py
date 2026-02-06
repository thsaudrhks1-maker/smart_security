
from fastapi import APIRouter, HTTPException, Request
from back.project.master.repository import project_repository

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

@router.delete("/{project_id}")
async def delete_project(project_id: int):
    await project_repository.delete_project(project_id)
    return {"success": True, "message": "프로젝트가 삭제되었습니다."}
