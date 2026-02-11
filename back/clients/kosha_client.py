
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
            raise ValueError("KOSHA_API_KEY가 설정되지 않았습니다.")
            
        # [스크린샷 기반 신규 베이스 주소]
        self.base_url = "https://apis.data.go.kr/B552468"

    def fetch_disaster_cases(self, page_no: int = 1, num_rows: int = 10) -> List[Dict[str, Any]]:
        """
        국내 재해사례 게시판 정보 조회 (disaster_api02/getdisaster_api02)
        """
        endpoint = f"{self.base_url}/disaster_api02/getdisaster_api02"
        params = {
            "serviceKey": self.service_key,
            "pageNo": page_no,
            "numOfRows": num_rows,
            "_type": "json"
        }
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            data = response.json()
            return data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
        except Exception as e:
            print(f"❌ KOSHA 재해사례 조회 오류: {e}")
            return []

    def fetch_daily_accidents(self, date: str = None) -> List[Dict[str, Any]]:
        """
        건설업 일별 중대재해 현황 조회 (constDsstr01/getconstDsstr01)
        :param date: YYYYMMDD 형식의 날짜 (미입력 시 최신)
        """
        import datetime
        if not date:
            date = datetime.datetime.now().strftime("%Y%m%d")

        endpoint = f"{self.base_url}/constDsstr01/getconstDsstr01"
        params = {
            "serviceKey": self.service_key,
            "search_date": date, # 스크린샷 기반 파라미터 유추 (일자 이용)
            "_type": "json"
        }
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            data = response.json()
            items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
            return items if isinstance(items, list) else ([items] if items else [])
        except Exception as e:
            print(f"❌ KOSHA 일별 중대재해 조회 오류: {e}")
            return []

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
