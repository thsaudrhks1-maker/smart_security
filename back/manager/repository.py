from back.database import fetch_one, fetch_all

class ManagerRepository:
    
    @staticmethod
    async def get_my_project_info(user_id: int):
        """
        관리자가 담당하는 프로젝트 정보 조회
        관리자는 project_members 테이블에 등록되어 있거나(우선),
        소속 회사(발주처/시공사)가 참여한 프로젝트 중 하나를 담당한다고 가정.
        """
        # [Revised] 쿼리 단순화 및 UNION을 통한 우선순위 처리
        # 1. 내 프로젝트 정보 조회 (직접 배정 > 소속 회사 참여 > 발주/시공사 텍스트 일치)
        # 우선순위를 정수로 부여하고 정렬하여 1건만 가져옴.
        sql = """
            SELECT DISTINCT ON (sort_order)
                p.id as project_id,
                p.name as project_name,
                p.location_name,
                p.start_date,
                p.end_date,
                CASE 
                    WHEN pm.role_name IS NOT NULL THEN pm.role_name
                    WHEN u.role = 'manager' THEN '현장소장'
                    WHEN u.role = 'safety_manager' THEN '안전관리자'
                    ELSE '관리자'
                END as my_role,
                1 as sort_order
            FROM users u
            JOIN project_members pm ON u.id = pm.user_id AND pm.status = 'ACTIVE'
            JOIN projects p ON pm.project_id = p.id
            WHERE u.id = :user_id
            
            UNION ALL
            
            SELECT DISTINCT
                p.id as project_id,
                p.name as project_name,
                p.location_name,
                p.start_date,
                p.end_date,
                CASE 
                    WHEN u.role = 'manager' THEN '현장소장'
                    WHEN u.role = 'safety_manager' THEN '안전관리자'
                    ELSE '협력사 관리자'
                END as my_role,
                2 as sort_order
            FROM users u
            JOIN project_participants pp ON u.company_id = pp.company_id
            JOIN projects p ON pp.project_id = p.id
            WHERE u.id = :user_id
            
            ORDER BY sort_order ASC, start_date DESC
            LIMIT 1
        """
        return await fetch_one(sql, {"user_id": user_id})

    @staticmethod
    async def get_project_stats(project_id: int, today_date: str):
        """
        프로젝트 대시보드 통계 (근로자 수, 금일 출역 수 등)
        """
        # 1. 총 등록 근로자 수 (해당 프로젝트에 멤버로 등록된 근로자, 승인여부 무관하게 전체 인원 파악용 혹은 ACTIVE만? 기획상 '등록 근로자'는 보통 승인된 사람을 의미하지만,
        # 사용자 요청: "운영현황 등록근로자와 아직 승인 안된 근로자도 나오면 좋고" -> 즉 전체 인원 수? 
        # 일단은 '승인된(ACTIVE)' 근로자만 카운트하는 것이 일반적이나, 요청에 따라 전체 인원을 보여주거나 분리해서 보여주는게 맞음.
        # 기존 로직은 project_participants 기반이라 부정확했음. project_members 테이블 기준으로 변경하되, ACTIVE만 카운트.
        # (만약 대기 인원까지 포함하려면 status 조건을 제거하면 됨)
        sql_total = """
            SELECT COUNT(pm.id) as count
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = :project_id 
            AND u.role = 'worker'
            AND pm.status = 'ACTIVE'
        """
        total_res = await fetch_one(sql_total, {"project_id": project_id})
        total_workers = total_res["count"] if total_res else 0

        # 2. 금일 출역 수 (Attendance 테이블 기준)
        sql_today = """
            SELECT COUNT(id) as count
            FROM attendance
            WHERE project_id = :project_id AND date = :today AND status != 'ABSENT'
        """
        # [FIX] 문자열 날짜를 date 객체로 변환 (asyncpg 에러 해결)
        from datetime import datetime
        if isinstance(today_date, str):
            today_date = datetime.strptime(today_date, "%Y-%m-%d").date()

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
                pm.status as member_status,
                (SELECT status FROM attendance a WHERE a.user_id = u.id AND a.date = CURRENT_DATE LIMIT 1) as today_status
            FROM users u
            JOIN companies c ON u.company_id = c.id
            JOIN project_members pm ON u.id = pm.user_id 
            WHERE pm.project_id = :project_id 
            AND u.role = 'worker'
            ORDER BY 
                CASE WHEN pm.status = 'ACTIVE' THEN 1 ELSE 2 END,
                u.full_name
        """
        return await fetch_all(sql, {"project_id": project_id})
