
import os
import requests
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def test_raw_api_call():
    service_key = os.getenv("KOSHA_API_KEY")
    if not service_key:
        print("❌ KOSHA_API_KEY가 없습니다.")
        return

    print(f"🚀 [RAW TEST] 원본 URL 주입 테스트 시작 (Key: {service_key[:10]}...)")

    targets = [
        {
            "name": "KOSHA 재해사례 (B551181)",
            "url": "http://apis.data.go.kr/B551181/getDisasterCaseList/getDisasterCaseList",
            "params": {"pageNo": "1", "numOfRows": "1", "_type": "json", "callApiId": "국내재해사례 게시판 조회"}
        },
        {
            "name": "CSI 사고사례 (B552016)",
            "url": "http://apis.data.go.kr/B552016/FacilAccidentService/getFacilAccidentList",
            "params": {"pageNo": "1", "numOfRows": "1", "_type": "json"}
        },
        {
            "name": "KOSHA 건설업 중대재해 (B552468)",
            "url": "http://apis.data.go.kr/B552468/constDsstr01/getConstDsstr01",
            "params": {"pageNo": "1", "numOfRows": "1", "_type": "json", "callApiId": "1010"}
        }
    ]

    for t in targets:
        print(f"\n--- {t['name']} ---")
        # requests가 키를 인코딩하지 않게 URL에 직접 박음
        base_url = t['url']
        params_str = urllib.parse.urlencode(t['params'])
        # 공공데이터포털은 Decoding 키를 사용할 때 URL에 직접 넣는 것이 가동률이 높음
        full_url = f"{base_url}?serviceKey={service_key}&{params_str}"
        
        try:
            print(f"📡 Request URL: {base_url}...")
            response = requests.get(full_url, timeout=10)
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                if "SERVICE_KEY_IS_NOT_REGISTERED_ERROR" in response.text:
                    print("❌ 결과: 서비스키 미등록 (서버 동기화 대기 중)")
                elif "response" in response.text.lower():
                    print("✅ 결과: 성공! 데이터 수신 완료")
                else:
                    print(f"⚠️ 결과: 알 수 없는 응답\n{response.text[:200]}")
            else:
                print(f"❌ 실패 (Status: {response.status_code})\n{response.text[:200]}")
        except Exception as e:
            print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_raw_api_call()
