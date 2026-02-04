from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from back.database import get_db
from back.project.schema import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMemberResponse, MemberApprovalRequest, ProjectParticipantResponse, ProjectWorkerResponse
from back.project.repository import ProjectRepository
from back.company.model import Site
from typing import List
import os
import uuid

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    프로젝트 생성 (관리자 전용)
    - ProjectRepository에서 프로젝트 및 참여 업체(ProjectParticipant)를 한 번에 생성함
    """
    project = await ProjectRepository.create(db, project_data)
    return project

@router.get("/", response_model=List[ProjectResponse])
async def get_all_projects(db: AsyncSession = Depends(get_db)):
    """
    모든 프로젝트 목록 조회 (최신순)
    """
    projects = await ProjectRepository.get_all(db)
    return projects

@router.get("/active", response_model=List[ProjectResponse])
async def get_active_projects(db: AsyncSession = Depends(get_db)):
    """
    진행 중인 프로젝트만 조회 (status=ACTIVE)
    """
    projects = await ProjectRepository.get_active_projects(db)
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    특정 프로젝트 상세 조회
    """
    project = await ProjectRepository.get_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    update_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    프로젝트 정보 수정 (관리자 전용)
    """
    project = await ProjectRepository.update(db, project_id, update_data)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return project

@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    프로젝트 삭제 (Soft Delete 권장)
    
    실무에서는 status='DELETED'로 변경하는 것이 안전
    """
    success = await ProjectRepository.delete(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    return None

# --- 협력사(참여자) 관리 API ---

@router.get("/{project_id}/participants", response_model=List[ProjectParticipantResponse])
async def get_project_participants(
    project_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """프로젝트 참여 기업 목록 조회"""
    return await ProjectRepository.get_participants(db, project_id)

@router.get("/{project_id}/workers", response_model=List[ProjectWorkerResponse])
async def get_project_workers(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """프로젝트 참여 업체의 작업자들 조회"""
    return await ProjectRepository.get_workers(db, project_id)

@router.post("/{project_id}/participants")
async def add_project_participant(
    project_id: int,
    company_name: str,
    role: str = "PARTNER",
    db: AsyncSession = Depends(get_db)
):
    """프로젝트에 협력사 추가 (이름으로 검색/생성)"""
    return await ProjectRepository.add_participant(db, project_id, company_name, role)

# --- 작업자(멤버) 승인 관리 API ---

@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
async def get_project_members(
    project_id: int,
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    프로젝트 멤버 조회
    - status 파라미터로 필터링 가능 (PENDING, ACTIVE, ALL)
    """
    return await ProjectRepository.get_members(db, project_id, status)

@router.patch("/{project_id}/members/approval")
async def approve_project_members(
    project_id: int,
    req: MemberApprovalRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    프로젝트 멤버 승인/거절 (관리자 전용)
    """
    count = await ProjectRepository.update_member_status(db, project_id, req.user_ids, req.action)
    return {"message": f"{count}명의 멤버가 {req.action} 처리되었습니다."}


# --- 현장(Site) 및 도면/구역(Zone) 관리 (최고관리자: 프로젝트 생성 후 위치·도면·Zone 설정) ---

@router.get("/{project_id}/sites")
async def get_project_sites(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """프로젝트 소속 현장 목록 조회 (도면 URL 포함)"""
    result = await db.execute(select(Site).where(Site.project_id == project_id).order_by(Site.id))
    sites = result.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "address": s.address or "",
            "floor_plan_url": s.floor_plan_url or "",
        }
        for s in sites
    ]


@router.post("/{project_id}/sites", status_code=201)
async def create_project_site(
    project_id: int,
    body: dict,
    db: AsyncSession = Depends(get_db)
):
    """프로젝트에 현장 1개 추가 (body: { name, address }). 생성 후 해당 현장에 도면 업로드·Zone 정의 가능."""
    name = body.get("name") or ""
    address = body.get("address") or ""
    if not name.strip():
        raise HTTPException(status_code=400, detail="현장명을 입력해주세요.")
    project = await ProjectRepository.get_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
    site = Site(project_id=project_id, name=name.strip(), address=address.strip() or None)
    db.add(site)
    await db.commit()
    await db.refresh(site)
    return {"id": site.id, "name": site.name, "address": site.address or "", "floor_plan_url": site.floor_plan_url or ""}


@router.post("/{project_id}/sites/{site_id}/floor-plan", status_code=201)
async def upload_site_floor_plan(
    project_id: int,
    site_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """현장 도면 이미지 업로드 (1개 층 예시). 저장 후 해당 Site에 floor_plan_url 설정."""
    result = await db.execute(select(Site).where(Site.id == site_id, Site.project_id == project_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="현장을 찾을 수 없습니다.")
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
    site.floor_plan_url = url
    await db.commit()
    await db.refresh(site)
    return {"floor_plan_url": url}
