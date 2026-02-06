
from back.database import fetch_all, fetch_one, execute, insert_and_return
from datetime import date

class project_repository:
    @staticmethod
    async def create_full_project(data: dict):
        """프로젝트 생성 및 관련 데이터(Zones, Companies, Members) 통합 처리"""
        
        # 1. 프로젝트 마스터 생성
        project_sql = """
            INSERT INTO project_master (
                name, location_address, lat, lng, grid_cols, grid_rows, grid_spacing, 
                floors_above, floors_below, budget, start_date, end_date, status
            ) VALUES (
                :name, :location_address, :lat, :lng, :grid_cols, :grid_rows, :grid_spacing,
                :floors_above, :floors_below, :budget, :start_date, :end_date, 'ACTIVE'
            ) RETURNING id
        """
        # 날짜 문자열을 date 객체로 변환
        start_date = None
        if data.get('start_date'):
            start_date = date.fromisoformat(data['start_date']) if isinstance(data['start_date'], str) else data['start_date']
        
        end_date = None
        if data.get('end_date'):
            end_date = date.fromisoformat(data['end_date']) if isinstance(data['end_date'], str) else data['end_date']
        
        proj = await insert_and_return(project_sql, {
            "name": data['name'],
            "location_address": data.get('location_address'),
            "lat": data.get('lat', 37.5665),
            "lng": data.get('lng', 126.9780),
            "grid_cols": int(data.get('grid_cols', 5)),
            "grid_rows": int(data.get('grid_rows', 5)),
            "grid_spacing": float(data.get('grid_spacing', 10.0)),
            "floors_above": int(data.get('floors_above', 1)),
            "floors_below": int(data.get('floors_below', 0)),
            "budget": int(data.get('budget')) if data.get('budget') else None,
            "start_date": start_date,
            "end_date": end_date
        })
        pid = proj['id']

        # 2. 관련 회사 연결 (project_companies)
        if data.get('client_id'):
            await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'CLIENT')", {"pid": pid, "cid": int(data['client_id'])})
        if data.get('constructor_id'):
            await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'CONSTRUCTOR')", {"pid": pid, "cid": int(data['constructor_id'])})
        
        # 협력사 다중 배정 (Partner IDs)
        partner_ids = data.get('partner_ids', [])
        for p_id in partner_ids:
            if p_id:
                await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'PARTNER')", {"pid": pid, "cid": int(p_id)})

        # 3. 핵심 인력 배정 (project_members)
        if data.get('manager_id'):
            await execute("INSERT INTO project_members (project_id, user_id, role_name, status) VALUES (:pid, :uid, 'manager', 'ACTIVE')", {"pid": pid, "uid": int(data['manager_id'])})
        if data.get('safety_manager_id'):
            await execute("INSERT INTO project_members (project_id, user_id, role_name, status) VALUES (:pid, :uid, 'safety_manager', 'ACTIVE')", {"pid": pid, "uid": int(data['safety_manager_id'])})

        # 4. 자동 구역(Zones) 생성 로직
        # 지상 층 생성
        floors_above = int(data.get('floors_above', 1))
        floors_below = int(data.get('floors_below', 0))
        grid_rows = int(data.get('grid_rows', 5))
        grid_cols = int(data.get('grid_cols', 5))
        
        for f in range(1, floors_above + 1):
            await project_repository._generate_floor_zones(pid, f"{f}F", grid_rows, grid_cols)
        # 지하 층 생성
        for f in range(1, floors_below + 1):
            await project_repository._generate_floor_zones(pid, f"B{f}", grid_rows, grid_cols)

        return pid

    @staticmethod
    async def _generate_floor_zones(pid, level, rows, cols):
        for r in range(rows):
            for c in range(cols):
                zone_name = f"{level}-{chr(65+r)}{c+1}" # 예: 1F-A1, 1F-B2
                await execute(
                    "INSERT INTO project_zones (project_id, name, level, row_index, col_index) VALUES (:pid, :n, :l, :ri, :ci)",
                    {"pid": pid, "n": zone_name, "l": level, "ri": r, "ci": c}
                )

    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM project_master ORDER BY id DESC")

    @staticmethod
    async def get_by_id(project_id: int):
        return await fetch_one("SELECT * FROM project_master WHERE id = :pid", {"pid": project_id})
