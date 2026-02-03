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
    - 입력된 발주처/시공사가 Company 테이블에 없으면 자동 등록 (role 구분)
    """
    # 프로젝트 생성 (ProjectRepository에서 commit 수행됨)
    project = await ProjectRepository.create(db, project_data)
    
    # [관계 설정] Project - Company (N:M)
    from sqlalchemy.future import select
    from back.company.model import Company, ProjectParticipant

    # 헬퍼: 회사 조회 또는 생성
    async def get_or_create_company(name: str):
        # 이미 세션에 추가된 객체 확인 (flush 전)
        for obj in db.new:
            if isinstance(obj, Company) and obj.name == name:
                return obj
                
        result = await db.execute(select(Company).where(Company.name == name))
        comp = result.scalars().first()
        if not comp:
            comp = Company(name=name) # 순수 회사 정보
            db.add(comp)
            await db.flush() # ID 생성을 위해 flush
        return comp

    try:
        # 1. 발주처(CLIENT) 등록
        if project_data.client_company:
            client = await get_or_create_company(project_data.client_company)
            # 참여 관계 생성
            client_part = ProjectParticipant(
                project_id=project.id,
                company_id=client.id,
                role="CLIENT"
            )
            db.add(client_part)

        # 2. 시공사(CONSTRUCTOR) 등록
        if project_data.constructor_company:
            constructor = await get_or_create_company(project_data.constructor_company)
            constructor_part = ProjectParticipant(
                project_id=project.id,
                company_id=constructor.id,
                role="CONSTRUCTOR"
            )
            db.add(constructor_part)
            
        # 3. 협력사(PARTNER) 등록
        if project_data.partners:
            for p_name in project_data.partners:
                partner = await get_or_create_company(p_name)
                # 중복 방지 (혹시 시공사와 같거나 중복 입력된 경우)
                # (간단하게 구현: flush된 session 내에서 체크는 복잡하므로 일단 그냥 insert 시도 or 파이썬 레벨에서 필터링)
                partner_part = ProjectParticipant(
                    project_id=project.id,
                    company_id=partner.id,
                    role="PARTNER"
                )
                db.add(partner_part)
            
        await db.commit()
        
    except Exception as e:
        print(f"회사 관계 설정 중 오류 발생: {e}")
        # 프로젝트는 이미 생성되었으므로 롤백하지 않음 (비즈니스 정책에 따라 다름)
        # 필요하다면 프로젝트 삭제 로직 추가 가능
    
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
