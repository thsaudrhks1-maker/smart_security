
from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import List, Optional
import os
import uuid
from datetime import date as dt_date
from back.daily.safety_logs.repository import safety_logs_repository

router = APIRouter()

# 업로드 루트 경로 설정 (Flat 구조)
UPLOAD_DIR = "uploads/daily_danger_images"

@router.get("/")
async def get_safety_logs(project_id: int, date: str):
    return await safety_logs_repository.get_by_project(project_id, dt_date.fromisoformat(date))

@router.post("/report")
async def report_danger(
    project_id: int = Form(...),
    zone_id: int = Form(...),
    user_id: int = Form(...), # 추가
    status: str = Form("PENDING"), # 추가: PENDING or DIRECT
    danger_info_id: Optional[int] = Form(None),
    risk_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    files: List[UploadFile] = File([])
):
    """
    [REAL-WORLD] 위험 지역 신고 및 사진 업로드
    """
    # 1. 위험 구역 생성
    danger_zone = await safety_logs_repository.create_danger_zone({
        "project_id": project_id,
        "zone_id": zone_id,
        "user_id": user_id,
        "status": status,
        "date": dt_date.today().isoformat(),
        "danger_info_id": danger_info_id,
        "risk_type": risk_type,
        "description": description
    })
    
    if not danger_zone:
        return {"success": False, "message": "위험 구역 생성 실패"}

    danger_zone_id = danger_zone["id"]
    saved_images = []

    # 2. 사진 저장 (Flat 구조: uploads/daily_danger_images/파일명)
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    from back.database import execute

    for file in files:
        # 파일명 규칙: danger_zone_id + uuid
        ext = os.path.splitext(file.filename)[1]
        filename = f"{danger_zone_id}_{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # DB 기록 (파일명만 저장)
        img_sql = """
            INSERT INTO daily_danger_images (danger_zone_id, danger_info_id, image_url, created_at)
            VALUES (:dzid, :diid, :url, NOW())
        """
        await execute(img_sql, {
            "dzid": danger_zone_id,
            "diid": danger_info_id,
            "url": filename  # 파일명만 저장
        })
        saved_images.append(filename)

    return {
        "success": True, 
        "data": {
            "danger_zone": danger_zone,
            "images": saved_images
        }
    }

@router.put("/approve/{danger_id}")
async def approve_danger(danger_id: int):
    """신고된 위험 구역 승인 처리"""
    success = await safety_logs_repository.approve_hazard(danger_id)
    return {"success": success}

@router.delete("/danger/{danger_id}")
async def delete_danger(danger_id: int):
    """위험 구역 제거 (물리 파일 포함)"""
    success = await safety_logs_repository.delete_danger_zone(danger_id)
    return {"success": success}
