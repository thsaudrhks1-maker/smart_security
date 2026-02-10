
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from back.database import get_db
from typing import List

from back.daily.worker_locations.schema import WorkerLocationCreate, WorkerLocationResponse
from back.daily.worker_locations.service import create_worker_location

router = APIRouter(prefix="/api/daily/worker/location", tags=["[DAILY] 작업자 위치 관제"])

@router.post("", response_model=WorkerLocationResponse, summary="작업자 위치 전송 (GPS/BLE)")
async def report_location(
    location_data: WorkerLocationCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    작업자 앱에서 5~10초 간격으로 위치 정보를 전송함.
    - tracking_mode: 'GPS' 또는 'BLE'
    - lat, lng: GPS 좌표 (BLE일 경우 null)
    - beacon_id: 감지된 비콘 ID (GPS일 경우 null)
    """
    try:
        result = await create_worker_location(db, location_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
