from back.database import fetch_one, fetch_all

class ManagerRepository:
    
    @staticmethod
    async def get_my_project_info(user_id: int):
        """
        관리자가 담당하는 프로젝트 정보 조회
        관리자는 project_members 테이블에 등록되어 있거나(우선),
        소속 회사(발주처/시공사)가 참여한 프로젝트 중 하나를 담당한다고 가정.
        """
        sql = """
            SELECT 
                p.id as project_id,
                p.name as project_name,
                p.location_name,
                p.start_date,
                p.end_date,
                COALESCE(pm.role_name, 'MANAGER') as my_role
            FROM users u
            LEFT JOIN project_members pm ON pm.user_id = u.id AND pm.status = 'ACTIVE'
            LEFT JOIN projects p ON p.id = pm.project_id
            -- 만약 직접 배정된 프로젝트가 없다면, 회사가 참여중인 프로젝트 중 가장 최신 것 조회
            LEFT JOIN project_participants pp ON pp.company_id = u.company_id
            LEFT JOIN projects p2 ON pp.project_id = p2.id
            WHERE u.id = :user_id
            ORDER BY p.created_at DESC, p2.created_at DESC
            LIMIT 1
        """
        # 위 쿼리는 조인이 복잡해서 정확한 우선순위 처리가 어려울 수 있음.
        # 명확하게 두 단계로 분리하거나 COALESCE를 활용하는데, 
        # 여기서는 간단히 Fetch 후 로직 처리 혹은 Union 방식이 나음.
        # 하지만 기존 구조를 유지하며 최적화된 쿼리로 변경:
        
        sql = """
            SELECT 
                COALESCE(p1.id, p2.id) as project_id,
                COALESCE(p1.name, p2.name) as project_name,
                COALESCE(p1.location_name, p2.location_name) as location_name,
                COALESCE(p1.start_date, p2.start_date) as start_date,
                COALESCE(p1.end_date, p2.end_date) as end_date,
                COALESCE(pm.role_name, '관리자') as my_role
            FROM users u
            -- 1순위: 직접 배정된 프로젝트
            LEFT JOIN project_members pm ON u.id = pm.user_id AND pm.status = 'ACTIVE'
            LEFT JOIN projects p1 ON pm.project_id = p1.id
            -- 2순위: 소속 회사가 참여중인 최신 프로젝트
            LEFT JOIN project_participants pp ON u.company_id = pp.company_id
            LEFT JOIN projects p2 ON pp.project_id = p2.id
            WHERE u.id = :user_id
            ORDER BY p1.created_at DESC NULLS LAST, p2.created_at DESC
            LIMIT 1
        """
        return await fetch_one(sql, {"user_id": user_id})

    @staticmethod
    async def get_project_stats(project_id: int, today_date: str):
        """
        프로젝트 대시보드 통계 (근로자 수, 금일 출역 수 등)
        """
        # 1. 총 등록 근로자 수 (해당 프로젝트에 참여 중인 업체의 소속 근로자)
        # (단순화를 위해 project_participants -> company -> users 로 카운트)
        sql_total = """
            SELECT COUNT(u.id) as count
            FROM users u
            JOIN companies c ON u.company_id = c.id
            JOIN project_participants pp ON c.id = pp.company_id
            WHERE pp.project_id = :project_id AND u.role = 'worker'
        """
        total_res = await fetch_one(sql_total, {"project_id": project_id})
        total_workers = total_res["count"] if total_res else 0

        # 2. 금일 출역 수 (Attendance 테이블 기준)
        sql_today = """
            SELECT COUNT(id) as count
            FROM attendance
            WHERE project_id = :project_id AND date = :today AND status != 'ABSENT'
        """
        today_res = await fetch_one(sql_today, {"project_id": project_id, "today": today_date})
        today_attendance = today_res["count"] if today_res else 0
        
        return {
            "total_workers": total_workers,
            "today_attendance": today_attendance
        }

    @staticmethod
    async def get_project_companies(project_id: int):
        """
        프로젝트 참여 업체 리스트
        """
        sql = """
            SELECT 
                c.id, c.name, c.type, pp.role as project_role
            FROM companies c
            JOIN project_participants pp ON c.id = pp.company_id
            WHERE pp.project_id = :project_id
            ORDER BY c.name
        """
        return await fetch_all(sql, {"project_id": project_id})

    @staticmethod
    async def get_project_workers(project_id: int):
        """
        프로젝트 관련 근로자 리스트
        """
        sql = """
            SELECT 
                u.id, u.full_name, u.phone, u.job_type,
                c.name as company_name,
                (SELECT status FROM attendance a WHERE a.user_id = u.id AND a.date = CURRENT_DATE LIMIT 1) as today_status
            FROM users u
            JOIN companies c ON u.company_id = c.id
            JOIN project_participants pp ON c.id = pp.company_id
            WHERE pp.project_id = :project_id AND u.role = 'worker'
            ORDER BY u.full_name
        """
        return await fetch_all(sql, {"project_id": project_id})
