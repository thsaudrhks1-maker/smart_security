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
        # [KEY USER] 현장소장 및 안전관리자 배정
        manager_id = data.pop("manager_id", None)
        safety_manager_id = data.pop("safety_manager_id", None)
        
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

        # 3. 핵심 인력(ProjectMember) 배정
        from back.auth.model import ProjectMember
        
        members = []
        if manager_id:
            members.append(ProjectMember(
                project_id=project.id, 
                user_id=manager_id, 
                role_name="현장소장", 
                status="ACTIVE",
                joined_at=datetime.now().date()
            ))
        
        if safety_manager_id:
            members.append(ProjectMember(
                project_id=project.id, 
                user_id=safety_manager_id, 
                role_name="안전관리자", 
                status="ACTIVE",
                joined_at=datetime.now().date()
            ))
            
        if members:
            db.add_all(members)
        
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
        """특정 프로젝트 상세 조회 (참여 업체 및 담당자 포함)"""
        from sqlalchemy.orm import selectinload
        from back.company.model import ProjectParticipant
        from back.project.model import ProjectMember # Import ProjectMember
        from back.auth.model import User
        
        result = await db.execute(
            select(Project)
            .options(
                selectinload(Project.participations).selectinload(ProjectParticipant.company),
                selectinload(Project.members).selectinload(ProjectMember.user) # Load members with user info
            )
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
            project.key_members = [
                {
                    "user_id": m.user_id,
                    "role_name": m.role_name,
                    "name": m.user.full_name if m.user else "Unknown",
                    "phone": m.user.phone if m.user else ""
                } for m in project.members
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

    # --- 협력사 및 멤버 관리 (Repository Pattern 확장) ---

    @staticmethod
    async def get_participants(db: AsyncSession, project_id: int):
        from back.company.model import Company, ProjectParticipant
        
        result = await db.execute(
            select(ProjectParticipant, Company)
            .join(Company, ProjectParticipant.company_id == Company.id)
            .where(ProjectParticipant.project_id == project_id)
        )
        
        # Pydantic 호환 dict 변환
        data = []
        for part, comp in result:
            data.append({
                "id": part.id,
                "project_id": part.project_id,
                "company_id": comp.id,
                "company_name": comp.name,
                "role": part.role,
                "trade_type": comp.trade_type
            })
        return data

    @staticmethod
    async def get_workers(db: AsyncSession, project_id: int):
        from back.company.model import Company, ProjectParticipant
        from back.auth.model import User
        from sqlalchemy import func

        # 1. 참여 업체 ID 조회
        part_query = await db.execute(
            select(ProjectParticipant.company_id).where(ProjectParticipant.project_id == project_id)
        )
        company_ids = part_query.scalars().all()

        if not company_ids:
            return []

        # 2. 업체 소속 근로자 조회
        worker_query = await db.execute(
            select(User, Company.name.label("company_name"))
            .join(Company, User.company_id == Company.id)
            .where(User.company_id.in_(company_ids))
            .where(func.upper(User.role) == "WORKER")
        )

        data = []
        for user, c_name in worker_query:
            data.append({
                "id": user.id,
                "full_name": user.full_name,
                "username": user.username,
                "company_name": c_name,
                "phone": user.phone,
                "role_in_system": user.role
            })
        return data

    @staticmethod
    async def add_participant(db: AsyncSession, project_id: int, company_name: str, role: str):
        from back.company.model import Company, ProjectParticipant
        
        # 회사 조회/생성
        result = await db.execute(select(Company).where(Company.name == company_name))
        comp = result.scalars().first()
        if not comp:
            comp = Company(name=company_name, trade_type="미지정")
            db.add(comp)
            await db.flush()
            
        # 중복 체크
        exists = await db.execute(
            select(ProjectParticipant)
            .where(
                ProjectParticipant.project_id == project_id,
                ProjectParticipant.company_id == comp.id
            )
        )
        if exists.scalars().first():
            return {"status": "exists", "message": "이미 등록된 협력사입니다."}
            
        # 관계 생성
        part = ProjectParticipant(project_id=project_id, company_id=comp.id, role=role)
        db.add(part)
        await db.commit()
        return {"status": "success", "message": "협력사가 추가되었습니다.", "company_id": comp.id}

    @staticmethod
    async def get_members(db: AsyncSession, project_id: int, status: str = None):
        from back.project.model import ProjectMember
        from back.auth.model import User
        from back.company.model import Company
        
        query = (
            select(ProjectMember, User, Company.name)
            .join(User, ProjectMember.user_id == User.id)
            .outerjoin(Company, User.company_id == Company.id)
            .where(ProjectMember.project_id == project_id)
        )
        
        if status and status != "ALL":
            query = query.where(ProjectMember.status == status)
            
        query = query.order_by(ProjectMember.joined_at.desc())
        
        result = await db.execute(query)
        members = []
        for pm, user, company_name in result:
            members.append({
                "id": pm.id,
                "user_id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "role_name": pm.role_name,
                "status": pm.status,
                "joined_at": pm.joined_at,
                "company_name": company_name or "미소속"
            })
        return members

    @staticmethod
    async def update_member_status(db: AsyncSession, project_id: int, user_ids: list[int], action: str):
        from back.project.model import ProjectMember
        
        result = await db.execute(
            select(ProjectMember)
            .where(ProjectMember.project_id == project_id)
            .where(ProjectMember.user_id.in_(user_ids))
        )
        members = result.scalars().all()
        
        if not members:
            return 0
            
        count = 0
        if action == "APPROVE":
            for m in members:
                m.status = "ACTIVE"
                count += 1
        elif action == "REJECT":
            for m in members:
                await db.delete(m)
                count += 1
                
        await db.commit()
        return count
