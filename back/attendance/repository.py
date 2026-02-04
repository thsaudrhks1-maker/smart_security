from back.database import fetch_all, fetch_one, execute, insert_and_return
from datetime import datetime, date
from typing import List, Dict, Any

class AttendanceRepository:
    """출결 데이터 접근 계층 (SQL Repository Pattern)"""
    
    @staticmethod
    def _parse_date(value):
        """날짜 파싱 유틸리티"""
        if value is None:
            return date.today()
        if isinstance(value, (date, datetime)):
            return value.date() if isinstance(value, datetime) else value
        if isinstance(value, str):
            try:
                return date.fromisoformat(value[:10])
            except ValueError:
                return date.today()
        return value

    @staticmethod
    async def get_today_attendance(user_id: int) -> Dict[str, Any] | None:
        """오늘 날짜의 출근 기록 조회"""
        sql = "SELECT * FROM attendance WHERE user_id = :user_id AND date = CURRENT_DATE"
        return await fetch_one(sql, {"user_id": user_id})

    @staticmethod
    async def create_attendance(data: Dict[str, Any]) -> Dict[str, Any]:
        """새 출근 기록 생성"""
        sql = """
            INSERT INTO attendance (
                user_id, project_id, work_type_id, date, 
                check_in_time, check_in_method, status
            ) VALUES (
                :user_id, :project_id, :work_type_id, :date, 
                :check_in_time, :check_in_method, :status
            ) RETURNING *
        """
        return await insert_and_return(sql, data)

    @staticmethod
    async def update_check_out(attendance_id: int, user_id: int) -> Dict[str, Any] | None:
        """퇴근 처리"""
        sql = """
            UPDATE attendance 
            SET check_out_time = NOW() 
            WHERE id = :attendance_id AND user_id = :user_id 
            RETURNING *
        """
        return await insert_and_return(sql, {"attendance_id": attendance_id, "user_id": user_id})

    @staticmethod
    async def get_project_attendance_list(project_id: int, target_date: str = None) -> List[Dict[str, Any]]:
        """프로젝트별 출역 명단 조회"""
        plan_date = AttendanceRepository._parse_date(target_date)
        sql = """
            SELECT 
                a.id, a.user_id, u.full_name, c.name as company_name,
                u.job_type, a.check_in_time, a.check_out_time,
                a.status, a.check_in_method
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE a.project_id = :project_id AND a.date = :target_date
            ORDER BY a.check_in_time DESC
        """
        return await fetch_all(sql, {"project_id": project_id, "target_date": plan_date})

    @staticmethod
    async def get_my_attendance_list(user_id: int, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """작업자 본인 출근 내역 조회 (기간별)"""
        sql = """
            SELECT
                a.id, a.date, a.check_in_time, a.check_out_time, a.status,
                c.name AS company_name, pm.role_name AS my_part,
                (
                    SELECT p.description FROM worker_allocations wa
                    JOIN daily_work_plans p ON wa.plan_id = p.id
                    WHERE wa.worker_id = a.user_id AND p.date = a.date
                    LIMIT 1
                ) AS work_description
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN companies c ON u.company_id = c.id
            LEFT JOIN project_members pm ON pm.user_id = a.user_id
                AND pm.project_id = a.project_id AND pm.status = 'ACTIVE'
            WHERE a.user_id = :user_id
              AND a.date >= :start_date AND a.date <= :end_date
            ORDER BY a.date DESC
        """
        return await fetch_all(sql, {
            "user_id": user_id,
            "start_date": AttendanceRepository._parse_date(start_date),
            "end_date": AttendanceRepository._parse_date(end_date),
        })
