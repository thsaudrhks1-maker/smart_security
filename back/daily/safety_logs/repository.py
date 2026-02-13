
from back.database import fetch_all, insert_and_return
from datetime import date

class safety_logs_repository:
    """[DAILY_SAFETY] 위험 구역 및 점검 로그 데이터 접근"""
    @staticmethod
    async def get_hazards(zid: int, d: date):
        sql = """
            SELECT 
                dz.*, 
                COALESCE(di.danger_type, dz.risk_type) as risk_type, -- 호환성 유지
                COALESCE(di.danger_type, dz.risk_type) as danger_type_label, -- 신규 표준
                di.icon,
                di.color,
                di.risk_level,
                i.image_url
            FROM daily_danger_zones dz
            LEFT JOIN daily_danger_images i ON dz.id = i.danger_zone_id
            LEFT JOIN content_danger_info di ON dz.danger_info_id = di.id
            WHERE dz.zone_id = :zid AND dz.date = :d
        """
        return await fetch_all(sql, {"zid": zid, "d": d})
    
    @staticmethod
    async def get_by_project(pid: int, d: date):
        """프로젝트의 모든 위험 구역 조회"""
        sql = """
            SELECT 
                dz.*, 
                z.name as zone_name, 
                z.level,
                di.danger_type,
                di.icon,
                di.color,
                di.risk_level
            FROM daily_danger_zones dz
            JOIN project_zones z ON dz.zone_id = z.id
            LEFT JOIN content_danger_info di ON dz.danger_info_id = di.id
            WHERE z.project_id = :pid AND dz.date = :d
            ORDER BY z.level, z.name
        """
        return await fetch_all(sql, {"pid": pid, "d": d})
    
    @staticmethod
    async def create_danger_zone(data: dict):
        """위험 구역 생성 (신고자 및 상태 추가)"""
        params = {
            "zone_id": data.get("zone_id"),
            "date": data.get("date"),
            "danger_info_id": data.get("danger_info_id"),
            "risk_type": data.get("risk_type") or data.get("custom_type"),
            "description": data.get("description"),
            "status": data.get("status", "PENDING"),
            "reporter_id": data.get("user_id") # 신고자/등록자 ID
        }

        # date가 문자열인 경우 date 객체로 변환
        if params["date"] and isinstance(params["date"], str):
            from datetime import date as dt_date
            try:
                params["date"] = dt_date.fromisoformat(params["date"].split('T')[0])
            except ValueError:
                pass

        sql = """
            INSERT INTO daily_danger_zones (zone_id, date, danger_info_id, risk_type, description, status, reporter_id)
            VALUES (:zone_id, :date, :danger_info_id, :risk_type, :description, :status, :reporter_id)
            RETURNING *
        """
        return await insert_and_return(sql, params)

    @staticmethod
    async def approve_hazard(danger_id: int):
        """근로자 신고 위험 구역 승인"""
        from back.database import execute
        sql = "UPDATE daily_danger_zones SET status = 'APPROVED' WHERE id = :id"
        await execute(sql, {"id": danger_id})
        return True

    
    @staticmethod
    async def delete_danger_zone(danger_id: int):
        """위험 구역 삭제 및 물리 파일 정리 (Flat 구조 대응)"""
        from back.database import execute, fetch_all
        import os
        
        # 1. 삭제 전 이미지 정보 확보
        sql_info = "SELECT image_url FROM daily_danger_images WHERE danger_zone_id = :id"
        images = await fetch_all(sql_info, {"id": danger_id})
        
        # 2. 물리 파일 삭제 (Flat 구조: uploads/daily_danger_images/파일명)
        for img in images:
            file_path = f"uploads/daily_danger_images/{img['image_url']}"
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"이미지 파일 삭제 실패: {file_path}, {e}")

        # 3. DB 삭제 (Cascade 설정으로 daily_danger_images 행도 자동 삭제됨)
        await execute("DELETE FROM daily_danger_zones WHERE id = :id", {"id": danger_id})
        return True

    @staticmethod
    async def create_log(data: dict):
        """안전 점검 로그 생성"""
        from back.database import insert_and_return
        import json
        from datetime import datetime
        
        sql = """
            INSERT INTO daily_safety_logs (project_id, user_id, log_type, note, plan_id, checklist_data, created_at)
            VALUES (:project_id, :user_id, :log_type, :note, :plan_id, :checklist_data, :created_at)
            RETURNING *
        """
        # 기본값 처리
        params = {
            "project_id": data.get("project_id"),
            "user_id": data.get("user_id"),
            "log_type": data.get("log_type", "CHECK"),
            "note": data.get("note"),
            "plan_id": data.get("plan_id"),
            "checklist_data": json.dumps(data.get("checklist_data"), ensure_ascii=False) if data.get("checklist_data") is not None else None,
            "created_at": datetime.now()
        }
        return await insert_and_return(sql, params)

