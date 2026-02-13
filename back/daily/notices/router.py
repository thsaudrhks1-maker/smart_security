from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from back.daily.notices.repository import notices_repository
from back.utils.sse_manager import sse_notice_manager
import asyncio
import json
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class PushAlertRequest(BaseModel):
    project_id: int
    user_ids: List[int] # 빈 배열이면 전체 전송
    title: str
    content: str
    alert_type: Optional[str] = "NORMAL" # NORMAL, URGENT, SAFETY_CHECK

class NoticeCreate(BaseModel):
    project_id: int
    date: Optional[str] = None
    title: str
    content: str
    notice_type: Optional[str] = "NORMAL" # NORMAL, IMPORTANT, EMERGENCY
    notice_role: Optional[str] = None      # ADMIN, MANAGER, PARTNER
    created_by: Optional[int] = None

@router.get("")
async def list_notices(project_id: Optional[int] = None, date: Optional[str] = None):
    notices = await notices_repository.get_all_notices(project_id, date)
    return {"success": True, "data": notices}

@router.post("")
async def create_notice(req: NoticeCreate):
    notice = await notices_repository.create_notice(req.model_dump())
    
    # [REAL-TIME] SSE로 신규 공지 즉시 전송
    await sse_notice_manager.broadcast(notice["project_id"], {
        "type": "NEW_NOTICE",
        "data": notice
    })
    
    return {"success": True, "data": notice}

@router.get("/latest-emergency/{project_id}")
async def get_latest_emergency(project_id: int):
    alert = await notices_repository.get_latest_emergency(project_id)
    return {"success": True, "data": alert}

@router.post("/{notice_id}/read")
async def mark_as_read(notice_id: int, user_id: int):
    result = await notices_repository.mark_as_read(notice_id, user_id)
    return {"success": True, "data": result}

@router.get("/{notice_id}/read-status")
async def get_read_status(notice_id: int):
    status = await notices_repository.get_read_status(notice_id)
    return {"success": True, "data": status}

@router.post("/push-alert")
async def push_alert(req: PushAlertRequest):
    """실시간 개인/단체 알림 발송 (SSE 이용)"""
    if not req.user_ids:
        # 전체 방송
        await sse_notice_manager.broadcast(req.project_id, {
            "type": "PUSH_ALERT",
            "data": {
                "title": req.title,
                "content": req.content,
                "alert_type": req.alert_type
            }
        })
    else:
        # 개별 발송
        for uid in req.user_ids:
            await sse_notice_manager.send_to_user(req.project_id, uid, {
                "type": "PUSH_ALERT",
                "data": {
                    "title": req.title,
                    "content": req.content,
                    "alert_type": req.alert_type
                }
            })
    
    return {"success": True, "message": f"{len(req.user_ids) or '전체'} 명에게 알림을 전송했습니다."}

# [SSE] 공지 및 알림 실시간 단방향 수신 엔드포인트
@router.get("/sse/{project_id}/{user_id}")
async def sse_endpoint(project_id: int, user_id: int):
    async def event_generator():
        queue = sse_notice_manager.subscribe(project_id, user_id)
        try:
            while True:
                # 큐에서 메시지 대기
                data = await queue.get()
                yield f"data: {data}\n\n"
        except asyncio.CancelledError:
            sse_notice_manager.unsubscribe(project_id, user_id, queue)
            raise

    return StreamingResponse(event_generator(), media_type="text/event-stream")
