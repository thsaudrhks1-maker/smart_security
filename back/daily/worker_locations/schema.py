
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WorkerLocationBase(BaseModel):
    """작업자 위치 전송 요청 기본 스키마"""
    worker_id: int = Field(..., description="작업자 ID (PK)")
    tracking_mode: str = Field(..., description="추적 모드 ('GPS' or 'BLE')", example="GPS")
    
    # GPS (tracking_mode='GPS')
    lat: Optional[float] = Field(None, description="위도 (GPS)")
    lng: Optional[float] = Field(None, description="경도 (GPS)")
    
    # BLE (tracking_mode='BLE')
    beacon_id: Optional[int] = Field(None, description="감지된 비콘 ID (PK)")
    rssi: Optional[int] = Field(None, description="신호 세기 (-dBm)")
    distance: Optional[float] = Field(None, description="추정 거리 (m)")

class WorkerLocationCreate(WorkerLocationBase):
    """위치 정보 생성 DTO"""
    pass

class WorkerLocationResponse(BaseModel):
    """위치 정보 저장 결과 및 Zone 판별 응답"""
    success: bool
    data_id: int
    matched_zone_id: Optional[int] = Field(None, description="판별된 구역 ID (없으면 null)")
    matched_zone_name: Optional[str] = Field(None, description="판별된 구역 명칭 (예: '1F-A구역')")
    alert_level: Optional[str] = Field("SAFE", description="위험도 (SAFE, WARNING, DANGER)")
    message: Optional[str] = None
