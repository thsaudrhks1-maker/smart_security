from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from back.project.model import Project
from back.project.schema import ProjectCreate, ProjectUpdate
from typing import List

class ProjectRepository:
    """프로젝트 데이터 접근 계층 (Repository Pattern)"""
    
    @staticmethod
    async def create(db: AsyncSession, project_data: ProjectCreate) -> Project:
        """프로젝트 생성 및 참여 업체 교차 테이블 연결"""
        from datetime import datetime
        from back.company.model import ProjectParticipant
        
        data = project_data.dict()
        
        # 모델 필드가 아닌 값들(교차 테이블용 ID들) 추출
        partner_ids = data.pop("partner_ids", [])
        client_id = data.pop("client_id", None)
        constructor_id = data.pop("constructor_id", None)
        partners_text = data.pop("partners", []) # 직접 입력 텍스트
        
        # 기타 비모델 필드 제거
        data.pop("manager_id", None)
        data.pop("safety_manager_id", None)
        
        # 문자열 날짜를 date 객체로 변환 (PostgreSQL/asyncpg 호환)
        if data.get("start_date") and isinstance(data["start_date"], str):
            data["start_date"] = datetime.strptime(data["start_date"], "%Y-%m-%d").date()
        if data.get("end_date") and isinstance(data["end_date"], str):
            data["end_date"] = datetime.strptime(data["end_date"], "%Y-%m-%d").date()
        
        # 1. 프로젝트 기본 정보 생성
        project = Project(**data)
        db.add(project)
        await db.flush() # ID 생성을 위해 flush (commit 전 ID 확보)
        
        # 2. 참여 업체 연결 (project_participants 교차 테이블 데이터 생성 - 중복 방지)
        participants = []
        seen_pairs = set() # (company_id, role) 중복 체크용
        
        # [CLIENT] 발주처 연결
        if client_id and (client_id, "CLIENT") not in seen_pairs:
            participants.append(ProjectParticipant(project_id=project.id, company_id=client_id, role="CLIENT"))
            seen_pairs.add((client_id, "CLIENT"))
        
        # [CONSTRUCTOR] 시공사 연결
        if constructor_id and (constructor_id, "CONSTRUCTOR") not in seen_pairs:
            participants.append(ProjectParticipant(project_id=project.id, company_id=constructor_id, role="CONSTRUCTOR"))
            seen_pairs.add((constructor_id, "CONSTRUCTOR"))
            
        # [PARTNER] 협력사(ID 기반) 연결
        for cid in partner_ids:
            if cid and (cid, "PARTNER") not in seen_pairs:
                participants.append(ProjectParticipant(project_id=project.id, company_id=cid, role="PARTNER"))
                seen_pairs.add((cid, "PARTNER"))
            
        if participants:
            db.add_all(participants)
            
        await db.commit()
        await db.refresh(project)
        return project
    
    @staticmethod
    async def get_all(db: AsyncSession) -> List[Project]:
        """모든 프로젝트 조회 (참참여 업체 포함)"""
        from sqlalchemy.orm import selectinload
        from back.company.model import ProjectParticipant
        
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.participations).selectinload(ProjectParticipant.company))
            .order_by(Project.created_at.desc())
        )
        projects = result.scalars().all()
        
        # Pydantic 응답을 위해 participants 필드에 가공 데이터 주입
        for p in projects:
            p.participants = [
                {
                    "company_id": part.company_id,
                    "company_name": part.company.name,
                    "role": part.role
                } for part in p.participations
            ]
        return projects
    
    @staticmethod
    async def get_by_id(db: AsyncSession, project_id: int) -> Project | None:
        """특정 프로젝트 상세 조회 (참여 업체 포함)"""
        from sqlalchemy.orm import selectinload
        from back.company.model import ProjectParticipant
        
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.participations).selectinload(ProjectParticipant.company))
            .where(Project.id == project_id)
        )
        project = result.scalars().first()
        if project:
            project.participants = [
                {
                    "company_id": part.company_id,
                    "company_name": part.company.name,
                    "role": part.role
                } for part in project.participations
            ]
        return project
    
    @staticmethod
    async def get_active_projects(db: AsyncSession) -> List[Project]:
        """진행 중인 프로젝트 조회 (참여 업체 포함)"""
        from sqlalchemy.orm import selectinload
        from back.company.model import ProjectParticipant
        
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.participations).selectinload(ProjectParticipant.company))
            .where(Project.status == "ACTIVE")
            .order_by(Project.created_at.desc())
        )
        projects = result.scalars().all()
        for p in projects:
            p.participants = [
                {
                    "company_id": part.company_id,
                    "company_name": part.company.name,
                    "role": part.role
                } for part in p.participations
            ]
        return projects
    
    @staticmethod
    async def update(db: AsyncSession, project_id: int, update_data: ProjectUpdate) -> Project | None:
        """프로젝트 정보 수정"""
        project = await ProjectRepository.get_by_id(db, project_id)
        if not project:
            return None
        
        # 업데이트할 필드만 적용 (None이 아닌 값만)
        for key, value in update_data.dict(exclude_unset=True).items():
            setattr(project, key, value)
        
        await db.commit()
        await db.refresh(project)
        return project
    
    @staticmethod
    async def delete(db: AsyncSession, project_id: int) -> bool:
        """프로젝트 삭제 (실제로는 상태 변경 권장)"""
        project = await ProjectRepository.get_by_id(db, project_id)
        if not project:
            return False
        
        await db.delete(project)
        await db.commit()
        return True
