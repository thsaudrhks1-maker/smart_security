
from back.database import fetch_all, insert_and_return, execute
from datetime import date

class task_plans_repository:
    """[DAILY_TASKS] 일일 실무 계획 데이터 접근"""
    
    @staticmethod
    async def get_by_project(pid: int, d: date):
        sql = """
            SELECT t.*, z.name as zone_name, z.level, wi.work_type
            FROM daily_work_plans t
            JOIN project_zones z ON t.zone_id = z.id
            LEFT JOIN content_work_info wi ON t.work_info_id = wi.id
            WHERE t.project_id = :pid AND t.date = :d
        """
        return await fetch_all(sql, {"pid": pid, "d": d})

    @staticmethod
    async def get_worker_users(plan_id: int):
        # daily_worker_users 테이블 사용 (최종 명칭)
        sql = """
            SELECT u.id, u.full_name, u.role, u.job_title, c.name as company_name
            FROM daily_worker_users wa
            JOIN sys_users u ON wa.worker_id = u.id
            LEFT JOIN sys_companies c ON u.company_id = c.id
            WHERE wa.plan_id = :pid
        """
        return await fetch_all(sql, {"pid": plan_id})
    
    @staticmethod
    async def get_by_zone(zone_id: int, d: date):
        """특정 구역의 오늘 작업 계획 조회"""
        sql = """
            SELECT t.*, z.name as zone_name, z.level, wi.work_type
            FROM daily_work_plans t
            JOIN project_zones z ON t.zone_id = z.id
            LEFT JOIN content_work_info wi ON t.work_info_id = wi.id
            WHERE t.zone_id = :zid AND t.date = :d
        """
        return await fetch_all(sql, {"zid": zone_id, "d": d})
    
    @staticmethod
    async def create_task(data: dict):
        """작업 계획 생성"""
        params = {
            "project_id": data.get("project_id"),
            "zone_id": data.get("zone_id"),
            "work_info_id": data.get("work_info_id"),
            "date": data.get("date"),
            "description": data.get("description"),
            "risk_score": data.get("risk_score", 0),
            "status": data.get("status", "PLANNED")
        }

        # date가 문자열인 경우 date 객체로 변환
        if params["date"] and isinstance(params["date"], str):
            from datetime import date as dt_date
            try:
                params["date"] = dt_date.fromisoformat(params["date"].split('T')[0])
            except ValueError:
                pass

        sql = """
            INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, calculated_risk_score, status)
            VALUES (:project_id, :zone_id, :work_info_id, :date, :description, :risk_score, :status)
            RETURNING *
        """
        return await insert_and_return(sql, params)

    
    @staticmethod
    async def update_task(task_id: int, data: dict):
        """작업 계획 수정"""
        sql = """
            UPDATE daily_work_plans 
            SET work_info_id = :work_info_id, description = :description, 
                calculated_risk_score = :risk_score, status = :status
            WHERE id = :task_id
        """
        await execute(sql, {**data, "task_id": task_id})
        return True
    
    @staticmethod
    async def delete_task(task_id: int):
        """작업 계획 삭제"""
        await execute("DELETE FROM daily_work_plans WHERE id = :id", {"id": task_id})
        return True
    
    @staticmethod
    async def assign_worker(plan_id: int, worker_id: int):
        """작업자 배정"""
        sql = """
            INSERT INTO daily_worker_users (plan_id, worker_id)
            VALUES (:plan_id, :worker_id)
        """
        await execute(sql, {"plan_id": plan_id, "worker_id": worker_id})
        return True
    
    @staticmethod
    async def remove_worker(plan_id: int, worker_id: int):
        """작업자 제거"""
        await execute("DELETE FROM daily_worker_users WHERE plan_id = :pid AND worker_id = :wid", 
                     {"pid": plan_id, "wid": worker_id})
        return True
