
import os
import requests
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def test_csi_final():
    service_key = os.getenv("KOSHA_API_KEY") # 사용자님은 하나의 키로 다 쓰시니까요
    if not service_key:
        print("❌ 인증키가 없습니다.")
        return

    print(f"📡 [CSI 국토안전관리원] 실시간 승인 확인 테스트 (Key: {service_key[:10]}...)")
    
    # 국토안전관리원_사고사례 정보조회 서비스
    url = "http://apis.data.go.kr/B552016/FacilAccidentService/getFacilAccidentList"
    
    params = {
        "pageNo": "1",
        "numOfRows": "5",
        "_type": "json"
    }

    qs = urllib.parse.urlencode(params)
    full_url = f"{url}?serviceKey={service_key}&{qs}"

    try:
        response = requests.get(full_url, timeout=10)
        print(f"📊 HTTP 상태 코드: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            if "SERVICE_KEY_IS_NOT_REGISTERED_ERROR" in content:
                print("❌ 결과: 아직 키가 등록되지 않음 (동기화 중)")
            elif "response" in content.lower():
                print("✅ 결과: 성공!!! CSI 데이터를 성공적으로 수신했습니다.")
                print(f"📝 응답 내용: {content[:300]}...")
            else:
                print(f"⚠️ 결과: 응답은 왔으나 내용 확인 필요: {content[:200]}")
        else:
            print(f"❌ 실패 (Status: {response.status_code})")
            print(f"📝 응답: {response.text[:200]}")

    except Exception as e:
        print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_csi_final()
