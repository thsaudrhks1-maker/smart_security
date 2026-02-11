
import os
import json
import asyncio
from back.clients.kosha_client import KoshaClient
from back.clients.csi_client import csi_client

async def probe_data():
    kosha = KoshaClient()
    
    print("\n" + "="*50)
    print("📡 [1. CSI 국토안전관리원 - 사고사례 데이터]")
    print("="*50)
    csi_data = csi_client.fetch_accident_cases(page_no=1, num_rows=1)
    if csi_data:
        print(json.dumps(csi_data[0], indent=2, ensure_ascii=False))
    else:
        print("❌ CSI 데이터를 가져오지 못했습니다.")

    print("\n" + "="*50)
    print("📡 [2. KOSHA 안전보건공단 - 국내재해사례]")
    print("="*50)
    # 아까 테스트에서 동기화 중이라 안 나왔을 수 있으니 빈 리스트여도 구조 설명 출력
    kosha_cases = kosha.fetch_disaster_cases(page_no=1, num_rows=1)
    if kosha_cases:
        print(json.dumps(kosha_cases[0], indent=2, ensure_ascii=False))
    else:
        print("⚠️ KOSHA 재해사례 데이터 없음 (동기화 중)")

    print("\n" + "="*50)
    print("📡 [3. KOSHA 안전보건공단 - 건설업 일별 중대재해]")
    print("="*50)
    # 날짜를 지정해서 찔러봄 (최근 날짜 예시: 20260210)
    import datetime
    yesterday = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y%m%d")
    daily_accidents = kosha.fetch_daily_accidents(date=yesterday)
    if daily_accidents:
        print(json.dumps(daily_accidents[0], indent=2, ensure_ascii=False))
    else:
        print(f"⚠️ {yesterday} 기준 KOSHA 중대재해 데이터 없음")

if __name__ == "__main__":
    asyncio.run(probe_data())
