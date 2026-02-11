
import os
import requests
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class CsiClient:
    """
    [CLIENT] 건설공사 안전관리 종합정보망 (CSI) / 국토안전관리원 API 클라이언트
    - 아차사고(Near Miss) 및 건설사고 사례 데이터를 수집합니다.
    """
    def __init__(self):
        # [API 키 통합] 공공데이터포털 통합 키 사용
        self.service_key = os.getenv("KOSHA_API_KEY")
        if not self.service_key:
            raise ValueError("KOSHA_API_KEY가 설정되지 않았습니다.")
            
        # [복구] 시설사고(대형사고) 데이터 소스
        self.base_url = "https://apis.data.go.kr/B552016/FacilAccidentService"

    def fetch_accident_cases(self, page_no: int = 1, num_rows: int = 10) -> List[Dict[str, Any]]:
        """
        [CSI] 시설물 사고 사례 정보를 조회합니다.
        """
        endpoint = f"{self.base_url}/getFacilAccidentList"
        params = {
            "serviceKey": self.service_key,
            "pageNo": page_no,
            "numOfRows": num_rows,
            "_type": "json"
        }
        
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            if response.status_code != 200:
                print(f"⚠️ CSI API 호출 실패 (Status: {response.status_code})")
                return []
                
            data = response.json()
            # 공공데이터포털 표준 응답 구조 파싱
            items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
            
            # 단일 항목만 올 경우 리스트로 변환
            if isinstance(items, dict):
                items = [items]
            return items
            
        except Exception as e:
            print(f"❌ CSI API 연동 중 오류: {e}")
            return []

csi_client = CsiClient()
