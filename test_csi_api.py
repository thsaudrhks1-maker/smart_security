
import os
import requests
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def test_csi_api():
    """
    국토안전관리원(CSI) 사고사례 API 유효성 테스트
    """
    service_key = os.getenv("CSI_API_KEY")
    if not service_key or "your_" in service_key:
        # CSI 키가 없으면 KOSHA 키로 시도 (둘 다 공공데이터포털용이므로 동일할 가능성 높음)
        service_key = os.getenv("KOSHA_API_KEY")

    if not service_key:
        print("❌ 테스트를 위한 API 키가 .env에 없습니다.")
        return

    print(f"🚀 [CSI] 국토안전관리원 사고사례 API 테스트 시작 (Key: {service_key[:10]}...)")

    # 국토안전관리원 사고사례 정보조회 서비스
    url = "http://apis.data.go.kr/B552016/FacilAccidentService/getFacilAccidentList"
    
    params = {
        "pageNo": "1",
        "numOfRows": "5",
        "_type": "json"
    }

    # 인코딩 이슈 방지를 위해 수동 조립
    qs = urllib.parse.urlencode(params)
    full_url = f"{url}?serviceKey={service_key}&{qs}"

    try:
        response = requests.get(full_url, timeout=10)
        print(f"📊 HTTP 상태 코드: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            if "response" in content.lower():
                print("✅ 성공! 국토안전관리원 데이터를 성공적으로 수신했습니다.")
                print(f"📝 응답 샘플: {content[:300]}...")
            else:
                print(f"⚠️ 결과: 성공했지만 데이터가 비어있거나 형식이 다름")
                print(f"📝 응답 내용: {content[:300]}...")
        else:
            print(f"❌ 실패 (Status: {response.status_code})")
            print(f"📝 상세: {response.text[:200]}")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    test_csi_api()
