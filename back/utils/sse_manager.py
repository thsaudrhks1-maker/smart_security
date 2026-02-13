import asyncio
import json
from typing import Dict, List

class SSENoticeManager:
    def __init__(self):
        # project_id별 -> user_id별 -> 큐 목록
        self.project_queues: Dict[int, Dict[int, List[asyncio.Queue]]] = {}

    def subscribe(self, project_id: int, user_id: int) -> asyncio.Queue:
        """새로운 구독자(근로자)를 위한 큐 생성"""
        queue = asyncio.Queue()
        if project_id not in self.project_queues:
            self.project_queues[project_id] = {}
        
        if user_id not in self.project_queues[project_id]:
            self.project_queues[project_id][user_id] = []
            
        self.project_queues[project_id][user_id].append(queue)
        return queue

    def unsubscribe(self, project_id: int, user_id: int, queue: asyncio.Queue):
        """구독 해지 시 큐 제거"""
        if project_id in self.project_queues:
            if user_id in self.project_queues[project_id]:
                if queue in self.project_queues[project_id][user_id]:
                    self.project_queues[project_id][user_id].remove(queue)
                if not self.project_queues[project_id][user_id]:
                    del self.project_queues[project_id][user_id]

    async def send_to_user(self, project_id: int, user_id: int, data: dict):
        """특정 프로젝트의 특정 사용자에게 메시지 전송"""
        if project_id in self.project_queues and user_id in self.project_queues[project_id]:
            message = json.dumps(data, default=str)
            for queue in self.project_queues[project_id][user_id]:
                await queue.put(message)

    async def broadcast(self, project_id: int, data: dict):
        """특정 프로젝트의 모든 구독자에게 메시지 전송"""
        if project_id in self.project_queues:
            message = json.dumps(data, default=str)
            for user_queues in self.project_queues[project_id].values():
                for queue in user_queues:
                    await queue.put(message)

# 싱글톤 인스턴스
sse_notice_manager = SSENoticeManager()
