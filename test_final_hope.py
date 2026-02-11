
import os
import requests
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def test_screenshot_urls():
    service_key = os.getenv("KOSHA_API_KEY")
    
    print(f"🚀 [SCREENSHOT TEST] 스크린샷 기반 최종 검증 (Key: {service_key[:10]}...)")

    targets = [
        {
            "name": "CSI 사고사례 (첫 번째 사진)",
            "url": "https://apis.data.go.kr/B552016/FacilAccidentService/getFacilAccidentList",
            "params": {"pageNo": "1", "numOfRows": "5", "_type": "json"}
        },
        {
            "name": "KOSHA 재해사례 (두 번째 사진)",
            "url": "https://apis.data.go.kr/B552468/disaster_api02/getdisaster_api02",
            "params": {"pageNo": "1", "numOfRows": "5", "_type": "json"}
        },
        {
            "name": "KOSHA 건설업 중대재해 (세 번째 사진)",
            "url": "https://apis.data.go.kr/B552468/constDsstr01/getconstDsstr01",
            "params": {"pageNo": "1", "numOfRows": "5", "_type": "json"}
        }
    ]

    for t in targets:
        print(f"\n--- {t['name']} ---")
        qs = urllib.parse.urlencode(t['params'])
        # 인증키 직접 주입 (가장 확실한 방법)
        full_url = f"{t['url']}?serviceKey={service_key}&{qs}"
        
        try:
            print(f"📡 URL: {t['url']}")
            response = requests.get(full_url, timeout=10)
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                if "response" in response.text.lower():
                    print("✅ 성공!!! 드디어 데이터를 가져왔습니다!")
                    print(f"📝 데이터 샘플: {response.text[:200]}...")
                elif "SERVICE_KEY_IS_NOT_REGISTERED_ERROR" in response.text:
                    print("❌ 결과: 서비스키 미등록 (아직 동기화 중)")
                else:
                    print(f"⚠️ 결과: 응답은 왔으나 특이함\n{response.text[:200]}")
            else:
                print(f"❌ 실패 (Status: {response.status_code})")
                print(f"📝 내용: {response.text[:200]}")
        except Exception as e:
            print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_screenshot_urls()
