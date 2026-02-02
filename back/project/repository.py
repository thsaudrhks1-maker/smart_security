from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from back.project.model import Project
from back.project.schema import ProjectCreate, ProjectUpdate
from typing import List

class ProjectRepository:
    """프로젝트 데이터 접근 계층 (Repository Pattern)"""
    
    @staticmethod
    async def create(db: AsyncSession, project_data: ProjectCreate) -> Project:
        """프로젝트 생성"""
        project = Project(**project_data.dict())
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project
    
    @staticmethod
    async def get_all(db: AsyncSession) -> List[Project]:
        """모든 프로젝트 조회 (최신순)"""
        result = await db.execute(select(Project).order_by(Project.created_at.desc()))
        return result.scalars().all()
    
    @staticmethod
    async def get_by_id(db: AsyncSession, project_id: int) -> Project | None:
        """특정 프로젝트 조회"""
        result = await db.execute(select(Project).where(Project.id == project_id))
        return result.scalars().first()
    
    @staticmethod
    async def get_active_projects(db: AsyncSession) -> List[Project]:
        """진행 중인 프로젝트만 조회"""
        result = await db.execute(
            select(Project).where(Project.status == "ACTIVE").order_by(Project.created_at.desc())
        )
        return result.scalars().all()
    
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
