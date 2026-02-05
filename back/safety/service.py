from back.safety.repository import SafetyRepository
from back.database import execute
from back.safety.schema import ZoneCreate, ZoneUpdate, DailyDangerZoneCreate, DangerZoneReportCreate
from datetime import datetime
from typing import List, Dict, Any
from fastapi import UploadFile
from pathlib import Path
import shutil

class SafetyService:
    @staticmethod
    async def get_zones(project_id: int = None, site_id: int = None):
        return await SafetyRepository.get_zones(project_id, site_id)

    @staticmethod
    async def create_zone(data: ZoneCreate):
        now = datetime.now()
        zone_data = data.dict()
        zone_data.update({"created_at": now, "updated_at": now})
        return await SafetyRepository.create_zone(zone_data)

    @staticmethod
    async def update_zone(zone_id: int, data: ZoneUpdate):
        update_data = data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now()
        return await SafetyRepository.update_zone(zone_id, update_data)

    @staticmethod
    async def get_daily_danger_zones(date_str: str, zone_id: int = None):
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        return await SafetyRepository.get_daily_danger_zones(target_date, zone_id)

    @staticmethod
    async def create_daily_danger_zone(data: DailyDangerZoneCreate):
        try:
            target_date = datetime.strptime(data.date, "%Y-%m-%d").date()
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")
            
        danger_data = {
            "zone_id": data.zone_id,
            "date": target_date,
            "risk_type": data.risk_type,
            "description": data.description.strip()
        }
        return await SafetyRepository.create_daily_danger_zone(danger_data)

    @staticmethod
    async def delete_daily_danger_zone(danger_zone_id: int):
        return await SafetyRepository.delete_daily_danger_zone(danger_zone_id)

    @staticmethod
    async def generate_grid_for_site(site_id: int):
        """사이트에 대해 프로젝트 설정 기반으로 3D 그리드 생성"""
        from back.project.repository import ProjectRepository
        
        # 1. 사이트 및 프로젝트 정보 가져오기
        site = await ProjectRepository.get_site_by_id(site_id)
        if not site:
            return None
        
        project = await ProjectRepository.get_by_id(site["project_id"])
        if not project:
            return None
        
        # 그리드 설정 (기본값 세팅)
        # grid_spacing은 이제 미터(m) 단위임
        spacing_m = float(project.get("grid_spacing") or 10)
        rows = project.get("grid_rows") or 10
        cols = project.get("grid_cols") or 10
        base_lat = float(project.get("location_lat") or 37.5665)
        base_lng = float(project.get("location_lng") or 126.978)
        
        import math
        # 1m 당 위도/경도 변환 상수
        lat_degree_per_m = 1 / 111320
        lng_degree_per_m = 1 / (111320 * math.cos(base_lat * math.pi / 180))
        
        spacing_lat = spacing_m * lat_degree_per_m
        spacing_lng = spacing_m * lng_degree_per_m
        
        # 2. 층수 설정 (지하 ~ 지상 범위 생성)
        b_floors = int(project.get("basement_floors") or 0)
        g_floors = int(project.get("ground_floors") or 1)
        
        floors = []
        # 지하층 (B1, B2...)
        for b in range(b_floors, 0, -1):
            floors.append({"z": -b, "label": f"B{b}"})
        # 지상층 (1F, 2F...)
        for g in range(1, g_floors + 1):
            floors.append({"z": g, "label": f"{g}F"})
        
        new_zones = []
        for floor in floors:
            z = floor["z"]
            label = floor["label"]
            
            for r in range(rows):
                for c in range(cols):
                    # 좌표 계산 (중앙 정렬)
                    lat = base_lat + (r - (rows-1)/2) * spacing_lat
                    lng = base_lng + (c - (cols-1)/2) * spacing_lng
                    
                    new_zones.append({
                        "site_id": site_id,
                        "name": f"{label}-{r}-{c}",
                        "level": label,
                        "type": "INDOOR",
                        "lat": lat,
                        "lng": lng,
                        "grid_x": c,
                        "grid_y": r,
                        "grid_z": z
                    })
        
        # 3. 해당 현장의 기존 구역들 삭제 (초기화)
        await execute("DELETE FROM zones WHERE site_id = :site_id", {"site_id": site_id})
        
        # 4. 벌크 생성
        now = datetime.now()
        for zone in new_zones:
            zone["project_id"] = project["id"]
            zone["created_at"] = now
            zone["updated_at"] = now
            
        await SafetyRepository.bulk_create_zones(new_zones)
        return len(new_zones)

    # ==========================================
    # 근로자 위험 신고 (Worker Report System)
    # ==========================================
    
    @staticmethod
    async def create_danger_zone_report(data: DangerZoneReportCreate, reported_by: int):
        """근로자 위험 신고 생성"""
        try:
            target_date = datetime.strptime(data.date, "%Y-%m-%d").date()
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")
        
        report_data = {
            "zone_id": data.zone_id,
            "date": target_date,
            "risk_type": data.risk_type,
            "description": data.description.strip(),
            "reported_by": reported_by
        }
        # BaseResponseSchema가 자동으로 날짜 변환하므로 수동 변환 불필요
        return await SafetyRepository.create_danger_zone_report(report_data)
    
    @staticmethod
    async def save_report_image(report_id: int, file: UploadFile, uploaded_by: int):
        """신고 사진 저장 (파일 + DB)"""
        # 1. DB에 메타데이터 먼저 저장
        image_record = await SafetyRepository.create_danger_zone_image(
            danger_zone_id=report_id,
            image_name="",  # 임시, 아래에서 업데이트
            uploaded_by=uploaded_by
        )
        
        # 2. 파일명 생성: danger_zone_{report_id}_{image_id}.jpg
        file_ext = Path(file.filename).suffix.lower()
        image_name = f"danger_zone_{report_id}_{image_record['id']}{file_ext}"
        
        # 3. 파일 저장
        upload_dir = Path("back/static/danger_zone_images")
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / image_name
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 4. DB 업데이트 (파일명)
        await execute(
            "UPDATE danger_zone_images SET image_name = :image_name WHERE id = :image_id",
            {"image_name": image_name, "image_id": image_record['id']}
        )
        
        image_record['image_name'] = image_name
        return image_record
    
    @staticmethod
    async def get_pending_reports(project_id: int = None):
        """대기 중인 신고 목록"""
        return await SafetyRepository.get_pending_reports(project_id)
    
    @staticmethod
    async def approve_report(report_id: int, approved_by: int):
        """신고 승인"""
        return await SafetyRepository.approve_report(report_id, approved_by)
    
    @staticmethod
    async def reject_report(report_id: int, approved_by: int):
        """신고 반려"""
        return await SafetyRepository.reject_report(report_id, approved_by)
    
    @staticmethod
    async def get_report_images(report_id: int):
        """신고 사진 목록"""
        return await SafetyRepository.get_report_images(report_id)
