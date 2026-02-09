from typing import List, Dict
from fastapi import WebSocket

class NoticeNamespaceManager:
    def __init__(self):
        # project_id별 연결된 클라이언트 관리
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: int):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: int):
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)

    async def broadcast(self, project_id: int, message: dict):
        """특정 프로젝트의 모든 클라이언트에게 메시지 전송"""
        if project_id in self.active_connections:
            for connection in self.active_connections[project_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # 연결이 끊긴 경우 등 예외 처리
                    pass

# 싱글톤 인스턴스
notice_ws_manager = NoticeNamespaceManager()
