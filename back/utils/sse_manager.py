import asyncio
import json
from typing import Dict, List

class SSENoticeManager:
    def __init__(self):
        # project_id별 관리되는 큐 목록
        self.project_queues: Dict[int, List[asyncio.Queue]] = {}

    def subscribe(self, project_id: int) -> asyncio.Queue:
        """새로운 구독자(근로자)를 위한 큐 생성"""
        queue = asyncio.Queue()
        if project_id not in self.project_queues:
            self.project_queues[project_id] = []
        self.project_queues[project_id].append(queue)
        return queue

    def unsubscribe(self, project_id: int, queue: asyncio.Queue):
        """구독 해지 시 큐 제거"""
        if project_id in self.project_queues:
            if queue in self.project_queues[project_id]:
                self.project_queues[project_id].remove(queue)

    async def broadcast(self, project_id: int, data: dict):
        """특정 프로젝트의 모든 구독자에게 메시지 전송"""
        if project_id in self.project_queues:
            # 메시지 포맷팅
            message = json.dumps(data)
            for queue in self.project_queues[project_id]:
                await queue.put(message)

# 싱글톤 인스턴스
sse_notice_manager = SSENoticeManager()
