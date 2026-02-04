# -*- coding: utf-8 -*-
"""
장비/장구류 30종 마스터 데이터 (설명 + 안전수칙).
reset_scenario, seed_safety_resources 에서 공통 사용.
"""
# name, type, icon, description, safety_rules(리스트)
RESOURCES = [
    {"name": "안전모", "type": "PPE", "icon": "HardHat", "description": "현장 입장 시 필수 착용. 낙하·충격으로부터 두부 보호.", "safety_rules": ["끈 조임 확인", "챙 파손·균열 여부 점검", "착용 후 고정 상태 확인"]},
    {"name": "안전화", "type": "PPE", "icon": "Footprints", "description": "미끄럼·낙하물·발 밟힘 방지용 보호화.", "safety_rules": ["끈 단단히 묶기", "굽·창 파손 여부 확인", "작업장에 맞는 규격 착용"]},
    {"name": "방진마스크", "type": "PPE", "icon": "Mask", "description": "분진·먼지 흡입 방지. 철거·목공·타일 절단 시 착용.", "safety_rules": ["필터 교체 주기 확인", "얼굴 밀착 여부 점검", "호흡 저항 확인"]},
    {"name": "보안경", "type": "PPE", "icon": "Glasses", "description": "이물·파편·분진으로부터 눈 보호.", "safety_rules": ["렌즈 흠집·오염 확인", "끈 조절로 미끄러짐 방지"]},
    {"name": "절연장갑", "type": "PPE", "icon": "Hand", "description": "전기 작업 시 감전 방지용 절연 장갑.", "safety_rules": ["절연 등급·유효기간 확인", "찢어짐·오염 없음 점검", "착용 전 공기 주입 검사"]},
    {"name": "일반 작업장갑", "type": "PPE", "icon": "Hand", "description": "절삭·이물·열로부터 손 보호.", "safety_rules": ["손 크기에 맞는 사이즈", "손상·오염 시 교체"]},
    {"name": "그네형 안전대", "type": "PPE", "icon": "Anchor", "description": "고소 작업 시 낙하 방지. 몸에 착용 후 고정점에 연결.", "safety_rules": ["D링·로프 파손 여부 점검", "착용 위치·조임 확인", "고정점 강도 확인"]},
    {"name": "착탈형 안전대", "type": "PPE", "icon": "Anchor", "description": "제한 구역·고소 작업 시 착용. 빠른 착탈 가능.", "safety_rules": ["벨트 휨·균열 점검", "걸쇠 잠금 확인"]},
    {"name": "방독마스크", "type": "PPE", "icon": "Mask", "description": "유해가스·증기·도료 분무 시 호흡 보호.", "safety_rules": ["필터 종류·교체일 확인", "얼굴 밀착 테스트"]},
    {"name": "화학물질용 장갑", "type": "PPE", "icon": "Hand", "description": "용제·접착제·도료 등 화학물질 접촉 시 착용.", "safety_rules": ["재질·내화성 확인", "찢어짐 시 즉시 교체"]},
    {"name": "무릎보호대", "type": "PPE", "icon": "Shield", "description": "타일·바닥 작업 시 무릎 보호.", "safety_rules": ["패드 위치·조임 확인", "습기·오염 시 건조"]},
    {"name": "귀마개", "type": "PPE", "icon": "Ear", "description": "고소음 구역에서 청력 보호.", "safety_rules": ["삽입 깊이·밀착 확인", "위생 관리"]},
    {"name": "안전조끼", "type": "PPE", "icon": "Vest", "description": "가시성 확보·차량·장비 구역 보행 시 착용.", "safety_rules": ["반사띠 손상 여부", "밝은 색 유지"]},
    {"name": "용접면", "type": "PPE", "icon": "Shield", "description": "용접·절단 시 눈·얼굴 보호.", "safety_rules": ["필터 등급·깜빡임 확인", "헬멧과 병용"]},
    {"name": "고글", "type": "PPE", "icon": "Glasses", "description": "비산물·스패터·화학물로부터 눈 보호.", "safety_rules": ["측면 보호 여부", "안개 방지 코팅"]},
    {"name": "호이스트", "type": "PPE", "icon": "Package", "description": "물건 인양·고정용. 수동/전동.", "safety_rules": ["와이어·훅 파손 점검", "하중 한도 준수", "고정점 확인"]},
    {"name": "안전망", "type": "PPE", "icon": "Grid", "description": "낙하 방지용 그물. 상부·외부 작업 구역 설치.", "safety_rules": ["망 파손·이음 확인", "지지대 강도 점검"]},
    {"name": "소화기", "type": "PPE", "icon": "Flame", "description": "초기 화재 진압용. 현장·용접 구역 비치.", "safety_rules": ["유효기간·압력 확인", "사용법 숙지", "비치 위치 파악"]},
    {"name": "15톤 덤프", "type": "HEAVY", "icon": "Truck", "description": "토사·잔재물 운반용 덤프트럭.", "safety_rules": ["하중 한도 준수", "적재물 고정", "후진 시 보조원 배치"]},
    {"name": "굴착기", "type": "HEAVY", "icon": "Digger", "description": "토목·철거·굴착 작업용.", "safety_rules": ["반경 내 출입 통제", "경로·지반 확인", "신호수 배치"]},
    {"name": "타워크레인", "type": "HEAVY", "icon": "Crane", "description": "구조물·자재 인양용 타워크레인.", "safety_rules": ["하중·반경 한도 준수", "와이어·훅 점검", "기상 조건 확인"]},
    {"name": "이동식 크레인", "type": "HEAVY", "icon": "Crane", "description": "현장 이동형 크레인. 인양·배치 작업.", "safety_rules": ["지반·아웃트리거 확인", "접근 금지 구역 설정", "신호 통일"]},
    {"name": "지게차", "type": "HEAVY", "icon": "Forklift", "description": "자재·장비 이송용.", "safety_rules": ["하중·높이 한도", "경로 보행자 통제", "경사·미끄럼 주의"]},
    {"name": "콘크리트 펌프카", "type": "HEAVY", "icon": "Truck", "description": "콘크리트 타설용 펌프 장비.", "safety_rules": ["호스 고정·파손 점검", "압력 한도", "세척·정리"]},
    {"name": "A형 사다리", "type": "TOOL", "icon": "Ladder", "description": "단순 고소 접근용. 2m 이하 등반.", "safety_rules": ["각도·고정 확인", "한 사람만 승용", "상단에서 작업 금지"]},
    {"name": "이동식 비계", "type": "TOOL", "icon": "Ladder", "description": "작업 발판·이동 비계.", "safety_rules": ["잠금장치·바닥판 확인", "하중 한도", "이동 시 인원 하차"]},
    {"name": "전동 드릴", "type": "TOOL", "icon": "Drill", "description": "천공·고정 작업용 전동 공구.", "safety_rules": ["케이블·절연 확인", "비트 고정", "보호고글 착용"]},
    {"name": "용접기", "type": "TOOL", "icon": "Weld", "description": "금속 용접·절단용.", "safety_rules": ["접지·케이블 점검", "화기 주변 가연물 제거", "환기·소화기 비치"]},
    {"name": "리프트/승강기", "type": "TOOL", "icon": "Package", "description": "자재·인원 수직 이송용.", "safety_rules": ["정기 검사 유효", "하중·인원 제한", "비상 정지 확인"]},
    {"name": "타카/톱", "type": "TOOL", "icon": "Scissors", "description": "절단·목공용 공구.", "safety_rules": ["날 손상·고정 확인", "가드 장착", "작업 후 전원 차단"]},
]

# 공종(work_type) -> 필요한 장비 이름 리스트
TEMPLATE_RESOURCE_NAMES = {
    "철거/해체 작업": ["안전모", "안전화", "방진마스크", "보안경", "소화기", "굴착기", "A형 사다리"],
    "벽돌 조적 및 미장": ["안전모", "안전화", "일반 작업장갑", "A형 사다리", "이동식 비계"],
    "전기 배선/배관": ["안전모", "안전화", "절연장갑", "전동 드릴", "리프트/승강기"],
    "수도 배관 설비": ["안전모", "안전화", "용접면", "용접기"],
    "목공(천장/벽체)": ["안전모", "안전화", "방진마스크", "타카/톱"],
    "타일 시공": ["안전모", "일반 작업장갑", "무릎보호대", "A형 사다리"],
    "도장(페인트)": ["방독마스크", "화학물질용 장갑", "고글", "소화기"],
    "도배 및 바닥재": ["안전화", "일반 작업장갑", "A형 사다리"],
}
