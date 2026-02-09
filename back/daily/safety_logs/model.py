
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Date
from back.database import Base
from datetime import datetime

class daily_safety_logs(Base):
    """[DAILY] 안전 점검 기록"""
    __tablename__ = "daily_safety_logs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    log_type = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    plan_id = Column(Integer, ForeignKey("daily_work_plans.id", ondelete="SET NULL"), nullable=True)
    checklist_data = Column(JSON, nullable=True, comment="체크리스트 상세 내역")
    created_at = Column(DateTime, default=datetime.now)

class daily_danger_zones(Base):
    """[DAILY] 일일 동적 위험 구역 (신고 및 승인 프로세스 포함)"""
    __tablename__ = "daily_danger_zones"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("project_zones.id", ondelete="CASCADE"), nullable=False)
    danger_info_id = Column(Integer, ForeignKey("content_danger_info.id", ondelete="SET NULL"), nullable=True, comment="위험 요소 템플릿")
    date = Column(Date, nullable=False)
    risk_type = Column(String, nullable=True, comment="커스텀 위험 유형 (danger_info_id 없을 시)")
    description = Column(String, nullable=True)
    status = Column(String, default="PENDING", comment="PENDING(신고됨), APPROVED(승인됨), DIRECT(관리자직등록)")
    reporter_id = Column(Integer, ForeignKey("sys_users.id", ondelete="SET NULL"), nullable=True, comment="최초 신고자/등록자")

class daily_danger_images(Base):
    """[DAILY] 위험 구역 현장 사진 (ID 기반 관리 체계 전환)"""
    __tablename__ = "daily_danger_images"
    id = Column(Integer, primary_key=True, index=True)
    danger_zone_id = Column(Integer, ForeignKey("daily_danger_zones.id", ondelete="CASCADE"), nullable=False)
    danger_info_id = Column(Integer, nullable=True, comment="경로 생성을 위한 위험 요소 ID (De-normalization)")
    image_url = Column(String, nullable=False, comment="저장된 파일의 최종 이름 또는 부분 경로")
    note = Column(String, nullable=True, comment="사진 설명")
    created_at = Column(DateTime, default=datetime.now)
