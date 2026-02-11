
import os
import requests
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class KoshaClient:
    """
    [CLIENT] 한국산업안전보건공단(KOSHA) 공공데이터 API 클라이언트
    - 재해사례 및 안전지침(KOSHA GUIDE) 원본 데이터를 수집합니다.
    """
    def __init__(self):
        self.service_key = os.getenv("KOSHA_API_KEY")
        if not self.service_key:
            raise ValueError("KOSHA_API_KEY(공공데이터포털 인증키)가 설정되지 않았습니다.")
            
        self.base_url = "http://apis.data.go.kr/B551181" # KOSHA API 기본 주소

    def fetch_disaster_cases(self, page_no: int = 1, num_rows: int = 10) -> List[Dict[str, Any]]:
        """
        국내 재해사례 정보를 조회합니다.
        """
        endpoint = f"{self.base_url}/getDisasterCaseList/getDisasterCaseList"
        params = {
            "serviceKey": self.service_key,
            "pageNo": page_no,
            "numOfRows": num_rows,
            "_type": "json" # JSON 형식 요청
        }
        
        response = requests.get(endpoint, params=params)
        
        if response.status_code != 200:
            raise Exception(f"KOSHA API 호출 실패: {response.status_code}")
            
        data = response.json()
        return data.get("response", {}).get("body", {}).get("items", {}).get("item", [])

    def fetch_kosha_guides(self, page_no: int = 1, num_rows: int = 10) -> List[Dict[str, Any]]:
        """
        KOSHA GUIDE(기술지원규정) 목록을 조회합니다.
        """
        # 기술 규정 API 엔드포인트는 실제 공공데이터포털 신청 후 확인된 URL이어야 함
        endpoint = f"{self.base_url}/getKoshaGuideList/getKoshaGuideList"
        params = {
            "serviceKey": self.service_key,
            "pageNo": page_no,
            "numOfRows": num_rows,
            "_type": "json"
        }
        
        response = requests.get(endpoint, params=params)
        if response.status_code != 200:
            raise Exception(f"KOSHA Guide API 호출 실패: {response.status_code}")
            
        return response.json().get("response", {}).get("body", {}).get("items", {}).get("item", [])
