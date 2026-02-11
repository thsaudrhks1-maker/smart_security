
import json
from datetime import datetime
from back.clients.csi_client import csi_client
from back.clients.kosha_client import KoshaClient
from back.clients.gemini_client import gemini_client
from back.content.accidents.repository import accident_repo

class AccidentService:
    def __init__(self):
        self.kosha = KoshaClient()
        self.ai = gemini_client

    async def sync_csi_accidents(self, rows: int = 20):
        """
        [CSI] 국토안전관리원 데이터 수집 + AI 가공 + DB 저장
        """
        print(f"🚀 [CSI Sync] {rows}건의 사고 사례 동기화 시작...")
        raw_items = csi_client.fetch_accident_cases(num_rows=rows)
        
        if not raw_items:
            print("⚠️ CSI에서 가져온 데이터가 없습니다.")
            return []

        results = []
        for item in raw_items:
            try:
                # 1. 데이터 파싱 (CSI 실제 응답 키 기준: accdntNm, accdntYmd, accdntOccrrncCn 등)
                title = item.get("accdntNm") or item.get("accNm") or "사고명 미상"
                occ_date_raw = item.get("accdntYmd") or item.get("accDate") or ""
                
                # 고유 ID 생성 (accId가 없으면 제목+날짜 해시)
                ext_id = item.get("accId")
                if not ext_id:
                    import hashlib
                    ext_id = hashlib.md5(f"CSI_{title}_{occ_date_raw}".encode()).hexdigest()
                
                desc = item.get("accdntOccrrncCn") or item.get("accContent") or ""
                cause = item.get("accdntCauseCn") or item.get("accCause") or ""
                category = item.get("facilKindNm") or item.get("accClsf") or "미분류"
                loc = item.get("facilAddr") or item.get("accAddr") or ""
                
                # 날짜 변환 (YYYYMMDD 또는 YYYY-MM-DD -> date object)
                occ_at = None
                try:
                    date_str = occ_date_raw.replace("-", "")
                    if len(date_str) == 8:
                        occ_at = datetime.strptime(date_str, "%Y%m%d").date()
                    elif len(date_str) == 4: # 연도만 있는 경우
                        occ_at = datetime.strptime(date_str, "%Y").date()
                    else:
                        occ_at = datetime.now().date()
                except:
                    occ_at = datetime.now().date()

                # 2. Gemini AI 가공 (핵심 요리!)
                # 사고 경위와 원인을 주고, 근로자에게 전달할 '오늘의 한마디'를 생성합니다.
                prompt = (
                    f"사고명: {title}\n"
                    f"유구: {category}\n"
                    f"사고내용: {desc}\n"
                    f"사고원인: {cause}\n\n"
                    "위 건설현장 사고 사례를 바탕으로, 현장 근로자들에게 아침 TBM 시간에 전달할 '실무적인 안전 수칙 한마디'와 "
                    "간단한 요약을 작성해줘. 법적인 말보다는 '어제 옆 단지에서 이런 일이 있었으니 조심하자'는 톤으로 부탁해."
                )
                
                summary = await self.ai.summarize_content(title, desc + " " + cause, category)
                embedding = await self.ai.get_embedding(summary)

                # 3. DB 저장
                data = {
                    "source": "CSI",
                    "ext_id": ext_id,
                    "cat": category,
                    "title": title,
                    "desc": desc,
                    "cause": cause,
                    "loc": loc,
                    "date": occ_at,
                    "summary": summary,
                    "emb": embedding
                }
                
                res = await accident_repo.upsert_accident(data)
                results.append(res)
                print(f"✅ 저장 완료: {title}")

            except Exception as e:
                print(f"❌ 개별 항목 처리 오류 ({item.get('accNm')}): {e}")

        return results

accident_service = AccidentService()
