from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from back.safety.schema import (
    ZoneRead, ZoneCreate, ZoneUpdate, 
    DailyDangerZoneCreate, DailyDangerZoneRead,
    DangerZoneReportCreate, DangerZoneReportRead, DangerZoneImageRead
)
from back.safety.service import SafetyService
from back.auth.dependencies import get_current_user
from back.auth.model import User
from typing import List, Optional
import shutil
from pathlib import Path

router = APIRouter(prefix="/safety", tags=["safety"])

@router.get("/zones", response_model=List[ZoneRead])
async def get_zones(project_id: Optional[int] = None, site_id: Optional[int] = None):
    """구역 목록 조회 (프로젝트별 또는 현장별 선택)"""
    return await SafetyService.get_zones(project_id, site_id)

@router.post("/zones", response_model=ZoneRead, status_code=201)
async def create_zone(zone: ZoneCreate):
    """구역(Zone) 생성"""
    return await SafetyService.create_zone(zone)

@router.put("/zones/{zone_id}", response_model=ZoneRead)
async def update_zone(zone_id: int, body: ZoneUpdate):
    """구역 수정"""
    zone = await SafetyService.update_zone(zone_id, body)
    if not zone:
        raise HTTPException(status_code=404, detail="구역을 찾을 수 없습니다.")
    return zone

@router.get("/daily-danger-zones", response_model=List[DailyDangerZoneRead])
async def get_daily_danger_zones(date: str, zone_id: Optional[int] = None):
    """일일 변동 위험 구역 목록 조회 (모든 상태 포함)"""
    rows = await SafetyService.get_daily_danger_zones(date, zone_id)
    return [
        DailyDangerZoneRead(
            id=r["id"], 
            zone_id=r["zone_id"], 
            date=str(r["date"]), 
            risk_type=r["risk_type"], 
            description=r["description"],
            status=r.get("status", "APPROVED")
        ) for r in rows
    ]

@router.post("/daily-danger-zones", response_model=DailyDangerZoneRead, status_code=201)
async def create_daily_danger_zone(body: DailyDangerZoneCreate):
    """일일 변동 위험 구역 등록"""
    r = await SafetyService.create_daily_danger_zone(body)
    return DailyDangerZoneRead(
        id=r["id"],
        zone_id=r["zone_id"],
        date=str(r["date"]),
        risk_type=r["risk_type"],
        description=r["description"]
    )

@router.delete("/daily-danger-zones/{danger_zone_id}", status_code=204)
async def delete_daily_danger_zone(danger_zone_id: int):
    """일일 변동 위험 구역 삭제"""
    success = await SafetyService.delete_daily_danger_zone(danger_zone_id)
    if not success:
        raise HTTPException(status_code=404, detail="해당 위험 구역을 찾을 수 없습니다.")
    return None

@router.post("/sites/{site_id}/generate-grid")
async def generate_site_grid(site_id: int):
    """프로젝트 설정 기반으로 사이트 그리드(Zone) 대량 생성"""
    count = await SafetyService.generate_grid_for_site(site_id)
    if count is None:
        raise HTTPException(status_code=404, detail="사이트 또는 프로젝트 정보를 찾을 수 없습니다.")
    return {"status": "success", "generated_count": count}


# ==========================================
# 근로자 위험 신고 (Worker Report System)
# ==========================================

@router.post("/reports", response_model=DangerZoneReportRead, status_code=201)
async def create_danger_report(
    body: DangerZoneReportCreate,
    current_user: User = Depends(get_current_user)
):
    """근로자 위험 신고 생성 (status='PENDING')"""
    report = await SafetyService.create_danger_zone_report(body, current_user.id)
    return report


@router.post("/reports/{report_id}/images", status_code=201)
async def upload_report_image(
    report_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """신고 사진 업로드"""
    # 파일 확장자 확인
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif"]
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    # 사진 저장 (파일명: danger_zone_{report_id}_{image_id}.jpg)
    image_record = await SafetyService.save_report_image(report_id, file, current_user.id)
    
    return {
        "status": "success",
        "image_id": image_record["id"],
        "image_name": image_record["image_name"]
    }


@router.get("/reports/pending", response_model=List[DangerZoneReportRead])
async def get_pending_reports(
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    """대기 중인 신고 목록 조회 (관리자용)"""
    reports = await SafetyService.get_pending_reports(project_id)
    return reports


@router.post("/reports/{report_id}/approve", response_model=DangerZoneReportRead)
async def approve_report(
    report_id: int,
    current_user: User = Depends(get_current_user)
):
    """신고 승인 (PENDING → APPROVED)"""
    report = await SafetyService.approve_report(report_id, current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="신고를 찾을 수 없습니다.")
    return report


@router.post("/reports/{report_id}/reject", response_model=DangerZoneReportRead)
async def reject_report(
    report_id: int,
    current_user: User = Depends(get_current_user)
):
    """신고 반려 (PENDING → REJECTED)"""
    report = await SafetyService.reject_report(report_id, current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="신고를 찾을 수 없습니다.")
    return report


@router.get("/reports/{report_id}/images", response_model=List[DangerZoneImageRead])
async def get_report_images(report_id: int):
    """신고 사진 목록 조회"""
    images = await SafetyService.get_report_images(report_id)
    return images
