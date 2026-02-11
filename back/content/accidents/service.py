import json
from datetime import datetime
from back.clients.csi_client import csi_client
from back.clients.gemini_client import gemini_client
from back.content.accidents.repository import accident_repo

class AccidentService:
    def __init__(self):
        self.csi = csi_client
        self.ai = gemini_client

    async def sync_csi_accidents(self, target_count: int = 20):
        """
        [CSI] 국토안전관리원 데이터 수집 + AI 가공 + DB 저장
        2010년 이후 데이터가 목표 개수만큼 수집될 때까지 페이지를 넘기며 시도
        """
        print(f"🚀 [CSI Sync] 2010년 이후 데이터 {target_count}건 수집 시작...")
        
        results = []
        page = 1
        max_pages = 30  # 최대 30페이지까지 시도
        
        while len(results) < target_count and page <= max_pages:
            print(f"� 페이지 {page} 조회 중... (현재 수집: {len(results)}/{target_count})")
            raw_items = csi_client.fetch_accident_cases(page_no=page, num_rows=20)
            
            if not raw_items:
                print(f"⚠️ 페이지 {page}에 데이터가 없습니다. 수집 종료.")
                break
            
            for item in raw_items:
                if len(results) >= target_count:
                    break
                    
                try:
                    # 1. 기본 정보 추출
                    title = (item.get("accdntNm") or item.get("accNm") or "사고사례").strip()
                    desc_raw = item.get("accdntContent") or item.get("accContent") or ""
                    cause_raw = item.get("accdntCauseDetail") or item.get("accCause") or ""
                    
                    # 한국어 데이터만
                    nation = item.get("nationNm", "")
                    if nation and nation != "대한민국":
                        continue
                    
                    # 설명이 너무 짧으면 스킵
                    desc = desc_raw.strip()
                    cause = cause_raw.strip()
                    if len(desc) < 20 and len(cause) < 20:
                        continue
                    
                    # 날짜 추출 및 2010년 필터링
                    occ_date_raw = item.get("accdntYmd") or item.get("occYmd") or ""
                    occ_at = None
                    try:
                        date_str = occ_date_raw.replace("-", "").replace(".", "")
                        if len(date_str) >= 4:
                            year = int(date_str[:4])
                            # [2010년 이후 데이터만 수집]
                            if year < 2010:
                                continue
                            
                            if len(date_str) == 8:
                                occ_at = datetime.strptime(date_str[:8], "%Y%m%d").date()
                            else:
                                occ_at = datetime(year, 1, 1).date()
                        else:
                            occ_at = datetime.now().date()
                    except:
                        occ_at = datetime.now().date()
                    
                    # External ID 생성
                    import hashlib
                    ext_id = hashlib.md5(f"CSI_{title}_{occ_date_raw}".encode()).hexdigest()
                    
                    category = item.get("facilKindNm") or item.get("accClsf") or "미분류"
                    loc = item.get("facilAddr") or item.get("accAddr") or ""

                    # 2. Gemini AI 가공
                    summary = await self.ai.summarize_content(title, desc, category)
                    embedding = await self.ai.get_embedding(summary)
                    
                    # 3. DB 저장
                    data = {
                        "source": "CSI",
                        "ext_id": ext_id,
                        "cat": category,
                        "title": title,
                        "desc": desc,
                        "cause": cause if cause else "상세내용 참조",
                        "loc": loc,
                        "date": occ_at,
                        "summary": summary,
                        "emb": embedding
                    }
                    
                    res = await accident_repo.upsert_accident(data)
                    results.append(res)
                    print(f"✅ [{len(results)}/{target_count}] {title} ({occ_at})")

                except Exception as e:
                    print(f"❌ 항목 처리 오류: {e}")
            
            page += 1

        print(f"\n🎉 수집 완료! 총 {len(results)}건 저장됨")
        return results

accident_service = AccidentService()
