from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from back.common import BaseResponseSchema

class ZoneBase(BaseModel):
    name: str
    level: str
    type: str  # INDOOR, OUTDOOR, ROOF, PIT, DANGER
    lat: Optional[float] = None
    lng: Optional[float] = None
    grid_x: Optional[int] = None
    grid_y: Optional[int] = None
    grid_z: Optional[int] = None
    default_hazards: Optional[list] = None


class ZoneCreate(ZoneBase):
    project_id: int
    site_id: int


class ZoneUpdate(BaseModel):
    """구역 부분 수정 (작업 위치 탭에서 좌표·층·구역명·타입·특징 등)"""
    name: Optional[str] = None
    level: Optional[str] = None
    type: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    grid_x: Optional[int] = None
    grid_y: Optional[int] = None
    grid_z: Optional[int] = None
    default_hazards: Optional[list] = None


class ZoneRead(ZoneBase, BaseResponseSchema):
    id: int
    project_id: Optional[int] = None
    site_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# --- 일일 변동 위험 구역 (중장비, 화재 등 오늘만 해당하는 위험) ---
class DailyDangerZoneCreate(BaseModel):
    zone_id: int
    date: str  # YYYY-MM-DD
    risk_type: str  # HEAVY_EQUIPMENT, FIRE, FALL, ETC
    description: str


class DailyDangerZoneRead(BaseResponseSchema):
    id: int
    zone_id: int
    date: date  # date 타입 그대로 (자동 변환됨)
    risk_type: str
    description: str
    status: Optional[str] = "APPROVED"  # PENDING, APPROVED, REJECTED


# --- 근로자 위험 신고 (Worker Report System) ---
class DangerZoneReportCreate(BaseModel):
    """근로자 신고 생성"""
    zone_id: int
    risk_type: str  # HEAVY_EQUIPMENT, FIRE, FALL, ETC
    description: str
    date: str  # YYYY-MM-DD


class DangerZoneReportRead(BaseResponseSchema):
    """신고 조회"""
    id: int
    zone_id: int
    date: date  # date 타입 그대로 (자동 변환됨)
    risk_type: str
    description: str
    status: str  # PENDING, APPROVED, REJECTED
    reported_by: Optional[int] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None  # datetime 타입 그대로
    created_at: datetime  # datetime 타입 그대로
    # 추가 정보 (JOIN)
    zone_name: Optional[str] = None
    zone_level: Optional[str] = None
    reporter_name: Optional[str] = None


class DangerZoneImageRead(BaseResponseSchema):
    """신고 사진 메타데이터"""
    id: int
    danger_zone_id: int
    image_name: str
    uploaded_at: datetime  # datetime 타입 그대로
    uploaded_by: Optional[int] = None
