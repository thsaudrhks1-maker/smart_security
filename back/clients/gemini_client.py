
import os
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# .env 파일을 절대 경로로 로드하여 경로 문제 방지
env_path = os.path.join(os.getcwd(), '.env')
load_dotenv(env_path)

class GeminiClient:
    """
    [CLIENT] Google Generative AI (Gemini) API 연동 클라이언트
    """
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError(f"GOOGLE_API_KEY가 설정되지 않았습니다. (Path: {env_path})")
        
        genai.configure(api_key=self.api_key)
        # 사용자 요청: 비용 효율적인 최신 모델 사용 (gemini-2.5-flash)
        # 정확한 모델 명칭 확인 결과: models/gemini-2.5-flash
        self.text_model = genai.GenerativeModel('models/gemini-2.5-flash')
        # 임베딩 모델도 리스트에 있는 정확한 명칭으로 변경
        self.embedding_model = "models/gemini-embedding-001" 

    async def get_embedding(self, text: str) -> List[float]:
        """
        [Embedding] 텍스트의 임베딩 벡터를 반환합니다. (768차원 고정)
        """
        try:
            # 768차원을 명시적으로 요청 (지원 모델의 경우)
            kwargs = {
                "model": self.embedding_model,
                "content": text,
                "task_type": "retrieval_document",
                "title": "Safety Content Embedding"
            }
            
            # 최신 모델(004 등) 대응을 위해 차원 파라미터 시도
            if "004" in self.embedding_model:
                kwargs["output_dimensionality"] = 768

            result = genai.embed_content(**kwargs)
            embedding = result['embedding']
            
            # [안전장치] 만약 그래도 3072가 온다면 768로 슬라이싱 (성능 차이 미미)
            return embedding[:768]
            
        except Exception as e:
            raise Exception(f"Gemini Embedding API 호출 실패: {str(e)}")

    async def summarize_content(self, title: str, content: str, category: str) -> str:
        """
        [Text Gen] 안전 콘텐츠를 검색에 최적화된 형태로 요약/가공합니다.
        """
        prompt = f"""
        당신은 건설 현장 안전 전문가입니다. 
        다음 안전 정보를 검색 및 AI 분석에 최적화된 핵심 지문으로 요약하세요.
        행정적인 용어나 불필요한 수식어는 제거하고, 
        '어떤 상황에서(상황)', '어떤 위험이 있고(위험)', '어떻게 조치해야 하는지(대책)'를 중심으로 
        500자 이내의 명확한 문장으로 작성하세요.

        [카테고리]: {category}
        [제목]: {title}
        [상세내용]: {content}
        """
        
        try:
            response = self.text_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            raise Exception(f"Gemini Text Generation 실패: {str(e)}")

    async def analyze_image(self, image_data: bytes, prompt: str) -> str:
        """
        [Multimodal] 현장 사진을 분석하여 위험 요소를 탐지합니다.
        """
        try:
            # 멀티모달 분석 (이미지 + 텍스트)
            response = self.text_model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_data}])
            return response.text.strip()
        except Exception as e:
            raise Exception(f"Gemini Vision 분석 실패: {str(e)}")

gemini_client = GeminiClient()
