from back.project.repository import ProjectRepository
from back.project.schema import ProjectCreate, ProjectUpdate
from back.company.repository import CompanyRepository # Assuming it exists or I'll use raw logic
from back.database import execute
from typing import List, Dict, Any
from datetime import datetime

class ProjectService:
    """프로젝트 비즈니스 로직 계층 (Service Pattern)"""

    @staticmethod
    async def create_project(project_data: ProjectCreate) -> Dict[str, Any]:
        """프로젝트 생성 및 관련 데이터(참여업체, 멤버) 연계"""
        data = project_data.dict()
        
        # 1. 특정 필드 추출 및 변환
        partner_ids = data.pop("partner_ids", [])
        client_id = data.pop("client_id", None)
        constructor_id = data.pop("constructor_id", None)
        manager_id = data.pop("manager_id", None)
        safety_manager_id = data.pop("safety_manager_id", None)

        if data.get("start_date") and isinstance(data["start_date"], str):
            data["start_date"] = datetime.strptime(data["start_date"], "%Y-%m-%d").date()
        if data.get("end_date") and isinstance(data["end_date"], str):
            data["end_date"] = datetime.strptime(data["end_date"], "%Y-%m-%d").date()

        # 2. 프로젝트 기본 생성
        project = await ProjectRepository.create(data)
        project_id = project["id"]

        # 3. 참여 업체 연결 (중복 방지 로직은 SQL 레벨에서 처리됨)
        if client_id:
            await ProjectRepository.add_participant(project_id, client_id, "CLIENT")
        if constructor_id:
            await ProjectRepository.add_participant(project_id, constructor_id, "CONSTRUCTOR")
        for pid in partner_ids:
            if pid:
                await ProjectRepository.add_participant(project_id, pid, "PARTNER")

        # 4. 핵심 멤버 멤버십 생성
        if manager_id:
            await ProjectRepository.add_member(project_id, manager_id, "현장소장")
        if safety_manager_id:
            await ProjectRepository.add_member(project_id, safety_manager_id, "안전관리자")

        # 5. 최종 결과 조회
        return await ProjectRepository.get_by_id(project_id)

    @staticmethod
    async def get_all_projects() -> List[Dict[str, Any]]:
        return await ProjectRepository.get_all()

    @staticmethod
    async def get_active_projects() -> List[Dict[str, Any]]:
        return await ProjectRepository.get_active_projects()

    @staticmethod
    async def get_project_detail(project_id: int) -> Dict[str, Any]:
        return await ProjectRepository.get_by_id(project_id)

    @staticmethod
    async def update_project(project_id: int, update_data: ProjectUpdate) -> Dict[str, Any]:
        data = update_data.dict(exclude_unset=True)
        return await ProjectRepository.update(project_id, data)

    @staticmethod
    async def delete_project(project_id: int) -> bool:
        return await ProjectRepository.delete(project_id)

    @staticmethod
    async def get_participants(project_id: int):
        return await ProjectRepository.get_participants(project_id)

    @staticmethod
    async def get_workers(project_id: int):
        return await ProjectRepository.get_workers(project_id)

    @staticmethod
    async def add_participant_by_name(project_id: int, company_name: str, role: str):
        # 회사가 있는지 확인 후 없으면 생성하는 로직은 Repository에 포함되어 있었으나
        # 서비스에서 흐름을 제어하는 것이 좋음. 
        # 일단 기존 Repository 로직을 유지하면서 Service 호출 구조로 변경
        
        # 회사 조회 (간단하게 Raw SQL로 직접 조회)
        from back.database import fetch_one
        comp = await fetch_one("SELECT id FROM companies WHERE name = :name", {"name": company_name})
        
        if not comp:
            # 회사 생성
            comp = await ProjectRepository.insert_and_return(
                "INSERT INTO companies (name, trade_type) VALUES (:name, '미지정') RETURNING id",
                {"name": company_name}
            )
        
        company_id = comp["id"]
        await ProjectRepository.add_participant(project_id, company_id, role)
        return {"status": "success", "company_id": company_id}

    @staticmethod
    async def get_members(project_id: int, status: str = None):
        return await ProjectRepository.get_members(project_id, status)

    @staticmethod
    async def approve_members(project_id: int, user_ids: List[int], action: str):
        count = await ProjectRepository.update_member_status(project_id, user_ids, action)
        return {"message": f"{count}명의 멤버가 {action} 처리되었습니다."}

    @staticmethod
    async def get_sites(project_id: int):
        return await ProjectRepository.get_sites(project_id)

    @staticmethod
    async def create_site(project_id: int, site_data: dict):
        name = site_data.get("name")
        address = site_data.get("address")
        return await ProjectRepository.create_site(project_id, name, address)

    @staticmethod
    async def save_floor_plan(project_id: int, site_id: int, url: str):
        # project_id와 site_id의 관계 검증 로직 추가 가능
        return await ProjectRepository.update_site_floor_plan(site_id, url)
