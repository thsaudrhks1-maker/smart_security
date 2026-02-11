
import os
import requests
import datetime
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def run_unified_test():
    service_key = os.getenv("KOSHA_API_KEY")
    if not service_key:
        print("❌ 인증키가 .env에 없습니다.")
        return

    print(f"🔍 [INTEGRATION TEST] 인증키 검증 시작 (Key: {service_key[:10]}...)")

    # 1. 기상청 테스트
    print("\n--- [1. 기상청 API] ---")
    weather_url = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
    now = datetime.datetime.now()
    weather_params = {
        "serviceKey": service_key,
        "pageNo": "1",
        "numOfRows": "1",
        "dataType": "JSON",
        "base_date": now.strftime("%Y%m%d"),
        "base_time": "0500",
        "nx": "55",
        "ny": "127"
    }
    try:
        res = requests.get(weather_url, params=weather_params, timeout=5)
        if res.status_code == 200 and "NORMAL_SERVICE" in res.text:
            print("✅ 기상청: 성공!")
        else:
            print(f"❌ 기상청: 실패 ({res.status_code})")
    except Exception as e:
        print(f"❌ 기상청: 오류 {e}")

    # 2. KOSHA 테스트
    print("\n--- [2. KOSHA 재해사례 API] ---")
    kosha_url = "http://apis.data.go.kr/B551181/getDisasterCaseList/getDisasterCaseList"
    kosha_params = {
        "serviceKey": service_key,
        "callApiId": "국내재해사례 게시판 조회",
        "pageNo": "1",
        "numOfRows": "1",
        "_type": "json"
    }
    try:
        qs = urllib.parse.urlencode(kosha_params)
        full_url = f"{kosha_url}?{qs}"
        res = requests.get(full_url, timeout=5)
        if res.status_code == 200:
            print("✅ KOSHA: 성공!")
        else:
            print(f"❌ KOSHA: 여전히 {res.status_code} 에러")
    except Exception as e:
        print(f"❌ KOSHA: 오류 {e}")

if __name__ == "__main__":
    run_unified_test()
