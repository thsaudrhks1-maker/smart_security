from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from back.database import get_db
from back.project.schema import ProjectCreate, ProjectUpdate, ProjectResponse
from back.project.repository import ProjectRepository
from typing import List

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

@router.get("/{project_id}/participants")
async def get_project_participants(
    project_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """프로젝트 참여 기업 목록 조회"""
    from back.company.model import Company, ProjectParticipant
    from sqlalchemy.future import select

    result = await db.execute(
        select(ProjectParticipant, Company)
        .join(Company, ProjectParticipant.company_id == Company.id)
        .where(ProjectParticipant.project_id == project_id)
    )
    
    participants = []
    for part, comp in result:
        participants.append({
            "id": part.id,
            "project_id": part.project_id,
            "company_id": comp.id,
            "company_name": comp.name,
            "role": part.role,
            "trade_type": comp.trade_type
        })
    return participants

@router.get("/{project_id}/workers")
async def get_project_workers(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """프로젝트 참여 업체의 작업자들 조회"""
    from back.auth.model import User
    from back.company.model import Company, ProjectParticipant
    from sqlalchemy.future import select

    # 이 프로젝트에 참여 중인 업체 ID들 가져오기
    part_query = await db.execute(
        select(ProjectParticipant.company_id).where(ProjectParticipant.project_id == project_id)
    )
    company_ids = part_query.scalars().all()

    if not company_ids:
        return []

    # 해당 업체들에 소속된 유저 중 role이 WORKER인 사람 조회 (대소문자 무시)
    from sqlalchemy import func
    worker_query = await db.execute(
        select(User, Company.name.label("company_name"))
        .join(Company, User.company_id == Company.id)
        .where(User.company_id.in_(company_ids))
        .where(func.upper(User.role) == "WORKER")
    )

    workers = []
    for user, c_name in worker_query:
        workers.append({
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "company_name": c_name,
            "phone": user.phone,
            "role_in_system": user.role
        })
    return workers

@router.post("/{project_id}/participants")
async def add_project_participant(
    project_id: int,
    company_name: str,
    role: str = "PARTNER",
    db: AsyncSession = Depends(get_db)
):
    """프로젝트에 협력사 추가 (이름으로 검색/생성)"""
    from back.company.model import Company, ProjectParticipant
    from sqlalchemy.future import select

    # 1. 회사 조회/생성
    result = await db.execute(select(Company).where(Company.name == company_name))
    comp = result.scalars().first()
    if not comp:
        comp = Company(name=company_name, trade_type="미지정")
        db.add(comp)
        await db.flush()

    # 2. 중복 체크
    exists = await db.execute(
        select(ProjectParticipant)
        .where(
            ProjectParticipant.project_id == project_id,
            ProjectParticipant.company_id == comp.id
        )
    )
    if exists.scalars().first():
        return {"message": "이미 등록된 협력사입니다.", "status": "exists"}

    # 3. 관계 생성
    part = ProjectParticipant(
        project_id=project_id,
        company_id=comp.id,
        role=role
    )
    db.add(part)
    await db.commit()
    
    return {"message": "협력사가 추가되었습니다.", "status": "success", "company_id": comp.id}
