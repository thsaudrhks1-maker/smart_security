from back.database import fetch_all, fetch_one, insert_and_return
from typing import Dict, Any

class notices_repository:
    """[DAILY_NOTICES] 공지사항 및 긴급 알람 데이터 접근"""

    @staticmethod
    async def get_all_notices(project_id: int = None, date: str = None):
        """공지사항 목록 (긴급 알람 우선 정렬)"""
        params = {}
        conditions = []
        
        if project_id:
            conditions.append("n.project_id = :pid")
            params["pid"] = project_id
        
        if date:
            from datetime import datetime
            try:
                # 'YYYY-MM-DD' 형식을 date 객체로 변환
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                conditions.append("n.date = :date")
                params["date"] = date_obj
            except ValueError:
                # 날짜 형식이 올바르지 않으면 무시하거나 에러 처리
                pass

        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

        sql = f"""
            SELECT n.*, u.full_name as author_name,
                   (SELECT COUNT(*) FROM daily_notice_reads r WHERE r.notice_id = n.id) as read_count
            FROM daily_notices n
            LEFT JOIN sys_users u ON n.created_by = u.id
            {where_clause}
            ORDER BY 
                CASE 
                    WHEN n.notice_type = 'EMERGENCY' THEN 1 
                    WHEN n.notice_type = 'IMPORTANT' THEN 2
                    ELSE 3 
                END,
                n.created_at DESC NULLS LAST, n.id DESC
        """
        return await fetch_all(sql, params)

    @staticmethod
    async def create_notice(data: Dict[str, Any]):
        """공지사항 또는 긴급 알람 생성"""
        from datetime import datetime
        sql = """
            INSERT INTO daily_notices (
                project_id, date, title, content, notice_type, notice_role, created_by
            ) VALUES (
                :project_id, :date, :title, :content, :notice_type, :notice_role, :created_by
            ) RETURNING *
        """
        # 기본값 설정
        data.setdefault('notice_type', 'NORMAL')
        if not data.get('date'):
            data['date'] = datetime.now().date()
        elif isinstance(data.get('date'), str):
            try:
                data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                data['date'] = datetime.now().date()
        
        return await insert_and_return(sql, data)

    @staticmethod
    async def get_latest_emergency(project_id: int):
        """가장 최근 긴급 알람 1건 조회 (근로자 팝업용)"""
        sql = """
            SELECT n.*, u.full_name as author_name
            FROM daily_notices n
            LEFT JOIN sys_users u ON n.created_by = u.id
            WHERE n.project_id = :pid AND n.notice_type = 'EMERGENCY' 
            ORDER BY n.created_at DESC NULLS LAST, n.id DESC LIMIT 1
        """
        return await fetch_one(sql, {"pid": project_id})

    @staticmethod
    async def mark_as_read(notice_id: int, user_id: int):
        """공지사항 확인 기록 저장"""
        sql = """
            INSERT INTO daily_notice_reads (notice_id, user_id)
            VALUES (:notice_id, :user_id)
            ON CONFLICT (notice_id, user_id) DO NOTHING
            RETURNING *
        """
        return await insert_and_return(sql, {"notice_id": notice_id, "user_id": user_id})

    @staticmethod
    async def get_read_status(notice_id: int):
        """공지사항 확인 인원 목록 상세 조회"""
        sql = """
            SELECT r.read_at, u.full_name, c.name as company_name
            FROM daily_notice_reads r
            JOIN sys_users u ON r.user_id = u.id
            LEFT JOIN sys_companies c ON u.company_id = c.id
            WHERE r.notice_id = :nid
            ORDER BY r.read_at DESC
        """
        return await fetch_all(sql, {"nid": notice_id})
