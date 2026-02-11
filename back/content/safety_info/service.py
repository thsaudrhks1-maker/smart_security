
import json
from back.content.safety_info.repository import safety_info_repo
from back.clients.kosha_client import KoshaClient
from back.clients.gemini_client import gemini_client

class SafetyInfoService:
    def __init__(self):
        self.kosha = KoshaClient()
        self.ai = gemini_client

    async def sync_with_kosha(self, page=1, rows=10):
        """
        [Sync] 공공데이터(KOSHA) 수집 -> Gemini AI 가공/요약 -> DB 저장 통합 프로세스
        """
        # 1. 원본 데이터 수집
        raw_items = self.kosha.fetch_disaster_cases(page_no=page, num_rows=rows)
        if not raw_items:
            raise Exception("KOSHA API에서 데이터를 가져오지 못했습니다.")

        results = []
        for item in raw_items:
            title = item.get("title")
            content = item.get("content") or item.get("substance", "")
            category = item.get("disasterType", "미분류")
            
            if not title or not content:
                continue

            # 2. AI 1차 가공 (핵심 요약)
            # 검색 정확도를 높이기 위해 행정 문구를 제거하고 핵심만 요약합니다.
            processed_text = await self.ai.summarize_content(title, content, category)
            
            # 3. 가공된 텍스트로 임베딩 생성
            embedding = await self.ai.get_embedding(processed_text)
            
            # 4. 레포지토리를 통해 저장
            data = {
                "cat": category,
                "title": title,
                "desc": content, # 원본은 백업용으로 유지
                "meas": json.dumps([item.get("measures", "준수사항 확인")], ensure_ascii=False),
                "emb": embedding
            }
            res = await safety_info_repo.upsert_from_api(data)
            results.append(res)
        
        return results

    async def recommend_safety_info(self, task_description: str):
        """
        [AI Recommend] 작업 설명을 분석하여 유사한 안전 정보 추천
        """
        # 1. 현재 작업 내용 임베딩
        query_vector = await self.ai.get_embedding(task_description)
        
        # 2. 벡터 검색
        return await safety_info_repo.search_by_vector(query_vector)

safety_info_service = SafetyInfoService()
