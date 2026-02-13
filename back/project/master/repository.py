
from back.database import fetch_all, fetch_one, execute, insert_and_return
from datetime import date

class project_repository:
    @staticmethod
    async def create_full_project(data: dict):
        """프로젝트 생성 및 관련 데이터(Zones, Companies, Users) 통합 처리"""
        
        # 1. 프로젝트 마스터 생성
        project_sql = """
            INSERT INTO project_master (
                name, location_address, lat, lng, grid_cols, grid_rows, grid_spacing, grid_angle,
                floors_above, floors_below, budget, start_date, end_date, status
            ) VALUES (
                :name, :location_address, :lat, :lng, :grid_cols, :grid_rows, :grid_spacing, :grid_angle,
                :floors_above, :floors_below, :budget, :start_date, :end_date, 'ACTIVE'
            ) RETURNING id
        """
        # 날짜 문자열을 date 객체로 변환
        start_date = None
        if data.get('start_date') and isinstance(data['start_date'], str):
            start_date = date.fromisoformat(data['start_date'])
        
        end_date = None
        if data.get('end_date') and isinstance(data['end_date'], str):
            end_date = date.fromisoformat(data['end_date'])
        
        proj = await insert_and_return(project_sql, {
            "name": data['name'],
            "location_address": data.get('location_address'),
            "lat": data.get('lat', 37.5665),
            "lng": data.get('lng', 126.9780),
            "grid_cols": int(data.get('grid_cols', 5)),
            "grid_rows": int(data.get('grid_rows', 5)),
            "grid_spacing": float(data.get('grid_spacing', 10.0)),
            "grid_angle": float(data.get('grid_angle', 0.0)),
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
        
        # 협력사 다중 배정
        partner_ids = data.get('partner_ids', [])
        for p_id in partner_ids:
            if p_id:
                await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'PARTNER')", {"pid": pid, "cid": int(p_id)})

        # 3. 핵심 인력 배정 (project_users)
        if data.get('manager_id'):
            await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (:pid, :uid, 'manager', 'ACTIVE')", {"pid": pid, "uid": int(data['manager_id'])})
        if data.get('safety_manager_id'):
            await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (:pid, :uid, 'safety_manager', 'ACTIVE')", {"pid": pid, "uid": int(data['safety_manager_id'])})

        # 4. 자동 구역(Zones) 생성
        floors_above = int(data.get('floors_above', 1))
        floors_below = int(data.get('floors_below', 0))
        grid_rows = int(data.get('grid_rows', 5))
        grid_cols = int(data.get('grid_cols', 5))
        
        # 지상 층 (1F, 2F...)
        for f in range(1, floors_above + 1):
            await project_repository._generate_floor_zones(pid, f"{f}F", grid_rows, grid_cols)
        # 지하 층 (B1, B2...)
        for f in range(1, floors_below + 1):
            await project_repository._generate_floor_zones(pid, f"B{f}", grid_rows, grid_cols)

        return pid

    @staticmethod
    async def _generate_floor_zones(pid, level, rows, cols):
        for r in range(rows):
            for c in range(cols):
                zone_name = f"{level}-{chr(65+r)}{c+1}"
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

    @staticmethod
    async def update_project(pid: int, data: dict):
        """프로젝트 기본 정보 업데이트 (격자 각도 포함)"""
        sql = """
            UPDATE project_master 
            SET name = :name,
                location_address = :location_address,
                lat = :lat,
                lng = :lng,
                grid_angle = :grid_angle,
                budget = :budget,
                start_date = :start_date,
                end_date = :end_date
            WHERE id = :id
        """
        # 날짜 타입 변환
        start_date = data.get('start_date')
        if start_date and isinstance(start_date, str):
            start_date = date.fromisoformat(start_date)
            
        end_date = data.get('end_date')
        if end_date and isinstance(end_date, str):
            end_date = date.fromisoformat(end_date)

        await execute(sql, {
            "id": pid,
            "name": data['name'],
            "location_address": data.get('location_address'),
            "lat": data.get('lat'),
            "lng": data.get('lng'),
            "grid_angle": float(data.get('grid_angle', 0.0)),
            "budget": int(data.get('budget')) if data.get('budget') else None,
            "start_date": start_date,
            "end_date": end_date
        })
        return True

    @staticmethod
    async def delete_project(pid: int):
        await execute("DELETE FROM project_master WHERE id = :id", {"id": pid})
        return True

    @staticmethod
    async def get_project_detail(pid: int):
        """프로젝트 상세 정보 (업체, 관리자, 협력업체, 작업자 포함)"""
        # 1. 프로젝트 기본 정보
        project = await fetch_one("SELECT * FROM project_master WHERE id = :pid", {"pid": pid})
        if not project:
            return None
        
        # 2. 발주처, 시공사
        client = await fetch_one("""
            SELECT c.* FROM sys_companies c
            JOIN project_companies pc ON c.id = pc.company_id
            WHERE pc.project_id = :pid AND pc.role = 'CLIENT'
        """, {"pid": pid})
        
        constructor = await fetch_one("""
            SELECT c.* FROM sys_companies c
            JOIN project_companies pc ON c.id = pc.company_id
            WHERE pc.project_id = :pid AND pc.role = 'CONSTRUCTOR'
        """, {"pid": pid})
        
        # 3. 소장, 안전관리자
        manager = await fetch_one("""
            SELECT u.* FROM sys_users u
            JOIN project_users pu ON u.id = pu.user_id
            WHERE pu.project_id = :pid AND pu.role_name = 'manager' AND pu.status = 'ACTIVE'
        """, {"pid": pid})
        
        safety_manager = await fetch_one("""
            SELECT u.* FROM sys_users u
            JOIN project_users pu ON u.id = pu.user_id
            WHERE pu.project_id = :pid AND pu.role_name = 'safety_manager' AND pu.status = 'ACTIVE'
        """, {"pid": pid})
        
        # 4. 협력업체 목록
        partners = await fetch_all("""
            SELECT c.* FROM sys_companies c
            JOIN project_companies pc ON c.id = pc.company_id
            WHERE pc.project_id = :pid AND pc.role = 'PARTNER'
            ORDER BY c.name
        """, {"pid": pid})
        
        # 5. 승인된 작업자 (project_users에 있는 worker)
        approved_workers = await fetch_all("""
            SELECT u.id, u.username, u.full_name, u.role, u.job_title, u.company_id, c.name as company_name, pu.status
            FROM sys_users u
            JOIN project_users pu ON u.id = pu.user_id
            JOIN sys_companies c ON u.company_id = c.id
            WHERE pu.project_id = :pid AND u.role = 'worker' AND pu.status = 'ACTIVE'
            ORDER BY c.name, u.full_name
        """, {"pid": pid})
        
        # 6. 승인 대기 작업자 (협력업체 소속이지만 project_users에 없음)
        pending_workers = await fetch_all("""
            SELECT u.id, u.username, u.full_name, u.role, u.job_title, u.company_id, c.name as company_name
            FROM sys_users u
            JOIN sys_companies c ON u.company_id = c.id
            WHERE u.role = 'worker' 
            AND c.id IN (
                SELECT company_id FROM project_companies 
                WHERE project_id = :pid AND role = 'PARTNER'
            )
            AND u.id NOT IN (
                SELECT user_id FROM project_users WHERE project_id = :pid
            )
            ORDER BY c.name, u.full_name
        """, {"pid": pid})
        
        # 7. 오늘 출퇴근 현황 (승인된 작업자 대상)
        today = date.today()
        attendance = await fetch_all("""
            SELECT 
                da.id, da.user_id, da.check_in_time, da.check_out_time, da.status,
                u.full_name, u.username, c.name as company_name
            FROM daily_attendance da
            JOIN sys_users u ON da.user_id = u.id
            JOIN sys_companies c ON u.company_id = c.id
            WHERE da.project_id = :pid AND da.date = :today
            ORDER BY da.check_in_time DESC
        """, {"pid": pid, "today": today})
        
        # 8. 오늘 작업 계획 (층별, 구역별)
        work_tasks = await fetch_all("""
            SELECT 
                dwt.id, dwt.zone_id, dwt.work_info_id, dwt.description, 
                dwt.calculated_risk_score, dwt.status,
                pz.name as zone_name, pz.level,
                cwi.work_type
            FROM daily_work_plans dwt
            JOIN project_zones pz ON dwt.zone_id = pz.id
            LEFT JOIN content_work_info cwi ON dwt.work_info_id = cwi.id
            WHERE dwt.project_id = :pid AND dwt.date = :today
            ORDER BY pz.level, pz.name
        """, {"pid": pid, "today": today})
        
        # 9. 오늘 위험 구역
        danger_zones = await fetch_all("""
            SELECT 
                ddz.id, ddz.zone_id, ddz.risk_type, ddz.description,
                pz.name as zone_name, pz.level
            FROM daily_danger_zones ddz
            JOIN project_zones pz ON ddz.zone_id = pz.id
            WHERE pz.project_id = :pid AND ddz.date = :today
            ORDER BY pz.level, pz.name
        """, {"pid": pid, "today": today})
        
        return {
            "project": project,
            "client": client,
            "constructor": constructor,
            "manager": manager,
            "safety_manager": safety_manager,
            "partners": partners,
            "approved_workers": approved_workers,
            "pending_workers": pending_workers,
            "attendance": attendance,
            "work_tasks": work_tasks,
            "danger_zones": danger_zones
        }
