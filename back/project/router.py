from fastapi import APIRouter, HTTPException, UploadFile, File
from back.project.schema import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMemberResponse, MemberApprovalRequest, ProjectParticipantResponse, ProjectWorkerResponse
from back.project.service import ProjectService
from typing import List
import os
import uuid

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(project_data: ProjectCreate):
    """프로젝트 생성 (관리자 전용)"""
    return await ProjectService.create_project(project_data)

@router.get("", response_model=List[ProjectResponse])
async def get_all_projects():
    """모든 프로젝트 목록 조회"""
    return await ProjectService.get_all_projects()

@router.get("/active", response_model=List[ProjectResponse])
async def get_active_projects():
    """진행 중인 프로젝트만 조회"""
    return await ProjectService.get_active_projects()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int):
    """특정 프로젝트 상세 조회"""
    project = await ProjectService.get_project_detail(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, update_data: ProjectUpdate):
    """프로젝트 정보 수정"""
    project = await ProjectService.update_project(project_id, update_data)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return project

@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: int):
    """프로젝트 삭제"""
    success = await ProjectService.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return None

# --- 협력사(참여자) 관리 API ---

@router.get("/{project_id}/participants", response_model=List[ProjectParticipantResponse])
async def get_project_participants(project_id: int):
    """프로젝트 참여 기업 목록 조회"""
    return await ProjectService.get_participants(project_id)

@router.get("/{project_id}/workers", response_model=List[ProjectWorkerResponse])
async def get_project_workers(project_id: int):
    """프로젝트 참여 업체의 작업자들 조회"""
    return await ProjectService.get_workers(project_id)

@router.post("/{project_id}/participants")
async def add_project_participant(
    project_id: int,
    company_name: str,
    role: str = "PARTNER"
):
    """프로젝트에 협력사 추가 (이름으로 검색/생성)"""
    return await ProjectService.add_participant_by_name(project_id, company_name, role)

# --- 작업자(멤버) 승인 관리 API ---

@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
async def get_project_members(project_id: int, status: str = None):
    """프로젝트 멤버 조회"""
    return await ProjectService.get_members(project_id, status)

@router.patch("/{project_id}/members/approval")
async def approve_project_members(project_id: int, req: MemberApprovalRequest):
    """프로젝트 멤버 승인/거절"""
    return await ProjectService.approve_members(project_id, req.user_ids, req.action)

# --- 현장(Site) 및 도면/구역(Zone) 관리 ---

@router.get("/{project_id}/sites")
async def get_project_sites(project_id: int):
    """프로젝트 소속 현장 목록 조회"""
    return await ProjectService.get_sites(project_id)

@router.post("/{project_id}/sites", status_code=201)
async def create_project_site(project_id: int, body: dict):
    """프로젝트에 현장 추가"""
    if not body.get("name", "").strip():
        raise HTTPException(status_code=400, detail="현장명을 입력해주세요.")
    return await ProjectService.create_site(project_id, body)

@router.post("/{project_id}/sites/{site_id}/floor-plan", status_code=201)
async def upload_site_floor_plan(project_id: int, site_id: int, file: UploadFile = File(...)):
    """현장 도면 이미지 업로드"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    ext = os.path.splitext(file.filename or ".png")[1] or ".png"
    safe_name = f"{uuid.uuid4().hex}{ext}"
    static_dir = os.path.join(os.path.dirname(__file__), "..", "static", "blueprints")
    os.makedirs(static_dir, exist_ok=True)
    path = os.path.join(static_dir, safe_name)
    
    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    url = f"/static/blueprints/{safe_name}"
    return await ProjectService.save_floor_plan(project_id, site_id, url)
