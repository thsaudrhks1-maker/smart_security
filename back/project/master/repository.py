
from back.database import fetch_all, fetch_one, execute, insert_and_return

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
        proj = await insert_and_return(project_sql, {
            "name": data['name'],
            "location_address": data.get('location_address'),
            "lat": data.get('lat', 37.5665),
            "lng": data.get('lng', 126.9780),
            "grid_cols": data.get('grid_cols', 5),
            "grid_rows": data.get('grid_rows', 5),
            "grid_spacing": data.get('grid_spacing', 10.0),
            "floors_above": data.get('floors_above', 1),
            "floors_below": data.get('floors_below', 0),
            "budget": data.get('budget'),
            "start_date": data.get('start_date'),
            "end_date": data.get('end_date')
        })
        pid = proj['id']

        # 2. 관련 회사 연결 (project_companies)
        if data.get('client_id'):
            await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'CLIENT')", {"pid": pid, "cid": data['client_id']})
        if data.get('constructor_id'):
            await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'CONSTRUCTOR')", {"pid": pid, "cid": data['constructor_id']})

        # 3. 핵심 인력 배정 (project_members)
        if data.get('manager_id'):
            await execute("INSERT INTO project_members (project_id, user_id, role_name, status) VALUES (:pid, :uid, 'manager', 'ACTIVE')", {"pid": pid, "uid": data['manager_id']})
        if data.get('safety_manager_id'):
            await execute("INSERT INTO project_members (project_id, user_id, role_name, status) VALUES (:pid, :uid, 'safety_manager', 'ACTIVE')", {"pid": pid, "uid": data['safety_manager_id']})

        # 4. 자동 구역(Zones) 생성 로직
        # 지상 층 생성
        for f in range(1, data.get('floors_above', 1) + 1):
            await project_repository._generate_floor_zones(pid, f"{f}F", data.get('grid_rows', 5), data.get('grid_cols', 5))
        # 지하 층 생성
        for f in range(1, data.get('floors_below', 0) + 1):
            await project_repository._generate_floor_zones(pid, f"B{f}", data.get('grid_rows', 5), data.get('grid_cols', 5))

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
