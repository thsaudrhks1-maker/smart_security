
import json
from back.content.safety_info.repository import safety_info_repo
from back.clients.gemini_client import gemini_client

class SafetyInfoService:
    def __init__(self):
        self.ai = gemini_client

    # KOSHA 동기화 기능은 제거됨 (CSI로 통합)

    async def recommend_safety_info(self, task_description: str):
        """
        [AI Recommend] 작업 설명을 분석하여 유사한 안전 정보 추천
        """
        # 1. 현재 작업 내용 임베딩
        query_vector = await self.ai.get_embedding(task_description)
        
        # 2. 벡터 검색
        return await safety_info_repo.search_by_vector(query_vector)

safety_info_service = SafetyInfoService()
