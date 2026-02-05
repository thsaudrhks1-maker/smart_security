from datetime import datetime
from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any

class ProjectRepository:
    """프로젝트 데이터 접근 계층 (SQL Repository Pattern)"""
    
    @staticmethod
    async def create(project_data: Dict[str, Any]) -> Dict[str, Any]:
        """프로젝트 생성 및 기본 정보 반환"""
        sql = """
            INSERT INTO projects (
                name, description, start_date, end_date, 
                location_lat, location_lng, location_address,
                grid_spacing, grid_rows, grid_cols,
                basement_floors, ground_floors,
                client_company, constructor_company, project_type, budget_amount,
                status, created_at, updated_at
            ) VALUES (
                :name, :description, :start_date, :end_date, 
                :location_lat, :location_lng, :location_address,
                :grid_spacing, :grid_rows, :grid_cols,
                :basement_floors, :ground_floors,
                :client_company, :constructor_company, :project_type, :budget_amount,
                :status, :created_at, :updated_at
            ) RETURNING *
        """
        now = datetime.now()
        project_data.update({"created_at": now, "updated_at": now})
        return await insert_and_return(sql, project_data)

    @staticmethod
    async def get_site_by_id(site_id: int) -> Dict[str, Any] | None:
        """사이트 상세 조회"""
        sql = "SELECT * FROM sites WHERE id = :site_id"
        return await fetch_one(sql, {"site_id": site_id})

    @staticmethod
    async def add_participant(project_id: int, company_id: int, role: str):
        """참여 업체 연결 (project_participants)"""
        sql = """
            INSERT INTO project_participants (project_id, company_id, role)
            VALUES (:project_id, :company_id, :role)
            ON CONFLICT ON CONSTRAINT uq_project_company DO NOTHING
        """
        await execute(sql, {"project_id": project_id, "company_id": company_id, "role": role})

    @staticmethod
    async def add_member(project_id: int, user_id: int, role_name: str, status: str = "ACTIVE"):
        """핵심 인력(ProjectMember) 배정"""
        sql = """
            INSERT INTO project_members (project_id, user_id, role_name, status, joined_at)
            VALUES (:project_id, :user_id, :role_name, :status, :joined_at)
        """
        await execute(sql, {
            "project_id": project_id, 
            "user_id": user_id, 
            "role_name": role_name, 
            "status": status,
            "joined_at": datetime.now().date()
        })

    @staticmethod
    async def get_all() -> List[Dict[str, Any]]:
        """모든 프로젝트 목록 조회"""
        sql = """
            SELECT p.*, 
                   (SELECT json_agg(json_build_object(
                       'company_id', c.id, 
                       'company_name', c.name, 
                       'role', pp.role
                   )) FROM project_participants pp 
                   JOIN companies c ON pp.company_id = c.id 
                   WHERE pp.project_id = p.id) as participants
            FROM projects p
            ORDER BY p.created_at DESC
        """
        return await fetch_all(sql)

    @staticmethod
    async def get_by_id(project_id: int) -> Dict[str, Any] | None:
        """특정 프로젝트 상세 조회"""
        sql = """
            SELECT p.*,
                   (SELECT json_agg(json_build_object(
                       'company_id', c.id, 
                       'company_name', c.name, 
                       'role', pp.role
                   )) FROM project_participants pp 
                   JOIN companies c ON pp.company_id = c.id 
                   WHERE pp.project_id = p.id) as participants,
                   (SELECT json_agg(json_build_object(
                       'user_id', u.id,
                       'role_name', pm.role_name,
                       'name', u.full_name,
                       'phone', u.phone
                   )) FROM project_members pm
                   JOIN users u ON pm.user_id = u.id
                   WHERE pm.project_id = p.id) as key_members
            FROM projects p
            WHERE p.id = :project_id
        """
        return await fetch_one(sql, {"project_id": project_id})

    @staticmethod
    async def get_active_projects() -> List[Dict[str, Any]]:
        """진행 중인 프로젝트 조회"""
        sql = """
            SELECT p.*,
                   (SELECT json_agg(json_build_object(
                       'company_id', c.id, 
                       'company_name', c.name, 
                       'role', pp.role
                   )) FROM project_participants pp 
                   JOIN companies c ON pp.company_id = c.id 
                   WHERE pp.project_id = p.id) as participants
            FROM projects p
            WHERE p.status = 'ACTIVE'
            ORDER BY p.created_at DESC
        """
        return await fetch_all(sql)

    @staticmethod
    async def update(project_id: int, update_data: Dict[str, Any]) -> Dict[str, Any] | None:
        """프로젝트 정보 수정"""
        if not update_data:
            return await ProjectRepository.get_by_id(project_id)

        set_clause = ", ".join([f"{k} = :{k}" for k in update_data.keys()])
        update_data["project_id"] = project_id
        
        sql = f"""
            UPDATE projects 
            SET {set_clause}, updated_at = :updated_at 
            WHERE id = :project_id 
            RETURNING *
        """
        update_data["updated_at"] = datetime.now()
        return await insert_and_return(sql, update_data)

    @staticmethod
    async def delete(project_id: int) -> bool:
        """프로젝트 삭제"""
        sql = "DELETE FROM projects WHERE id = :project_id"
        result = await execute(sql, {"project_id": project_id})
        return result.rowcount > 0

    @staticmethod
    async def get_participants(project_id: int):
        """참여 업체 목록 조회"""
        sql = """
            SELECT pp.id, pp.project_id, c.id as company_id, 
                   c.name as company_name, pp.role, c.trade_type
            FROM project_participants pp
            JOIN companies c ON pp.company_id = c.id
            WHERE pp.project_id = :project_id
        """
        return await fetch_all(sql, {"project_id": project_id})

    @staticmethod
    async def get_workers(project_id: int):
        """프로젝트 참여 업체의 작업자들 조회"""
        sql = """
            SELECT u.id, u.full_name, u.username, c.name as company_name, 
                   u.phone, u.role as role_in_system
            FROM users u
            JOIN companies c ON u.company_id = c.id
            WHERE u.company_id IN (
                SELECT company_id FROM project_participants 
                WHERE project_id = :project_id
            ) AND UPPER(u.role) = 'WORKER'
        """
        return await fetch_all(sql, {"project_id": project_id})

    @staticmethod
    async def get_members(project_id: int, status: str = None):
        """프로젝트 멤버 조회"""
        params = {"project_id": project_id}
        status_filter = ""
        if status and status != "ALL":
            status_filter = "AND pm.status = :status"
            params["status"] = status

        sql = f"""
            SELECT pm.id, u.id as user_id, u.username, u.full_name, 
                   pm.role_name, pm.status, pm.joined_at, 
                   c.name as company_name
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE pm.project_id = :project_id {status_filter}
            ORDER BY pm.joined_at DESC
        """
        return await fetch_all(sql, params)

    @staticmethod
    async def update_member_status(project_id: int, user_ids: List[int], action: str):
        """멤버 승인/거절 처리"""
        if action == "APPROVE":
            sql = """
                UPDATE project_members SET status = 'ACTIVE' 
                WHERE project_id = :project_id AND user_id = ANY(:user_ids)
            """
        elif action == "REJECT":
            sql = """
                DELETE FROM project_members 
                WHERE project_id = :project_id AND user_id = ANY(:user_ids)
            """
        else:
            return 0
        
        result = await execute(sql, {"project_id": project_id, "user_ids": user_ids})
        return result.rowcount

    @staticmethod
    async def get_sites(project_id: int):
        """현장 목록 조회"""
        sql = """
            SELECT id, name, address, floor_plan_url 
            FROM sites 
            WHERE project_id = :project_id 
            ORDER BY id
        """
        return await fetch_all(sql, {"project_id": project_id})

    @staticmethod
    async def create_site(project_id: int, name: str, address: str = None):
        """현장 생성"""
        sql = """
            INSERT INTO sites (project_id, name, address)
            VALUES (:project_id, :name, :address)
            RETURNING id, name, address, floor_plan_url
        """
        return await insert_and_return(sql, {"project_id": project_id, "name": name, "address": address})

    @staticmethod
    async def update_site_floor_plan(site_id: int, url: str):
        """현장 도면 업데이트"""
        sql = "UPDATE sites SET floor_plan_url = :url WHERE id = :site_id RETURNING floor_plan_url"
        return await insert_and_return(sql, {"site_id": site_id, "url": url})
