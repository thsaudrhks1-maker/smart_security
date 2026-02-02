from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class Project(Base):
    """
    프로젝트 (공사 프로젝트 최상위 엔티티)
    
    역할:
    - 5억~10억 규모 건설 프로젝트 기본 정보 관리
    - 모든 현장(Site), 협력사(Company), 작업자(Worker)의 최상위 컨테이너
    
    생성자: 소장/관리자
    사용자: 안전관리자, 작업자 (본인이 속한 프로젝트만 접근)
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    
    # 프로젝트 기본 정보
    name = Column(String, nullable=False, comment="공사명 (예: OO아파트 신축공사)")
    
    # 위치 정보
    location_address = Column(String, nullable=True, comment="공사 주소")
    location_lat = Column(Float, nullable=True, comment="위도 (지도용)")
    location_lng = Column(Float, nullable=True, comment="경도 (지도용)")
    
    # 발주/시공사 정보
    client_company = Column(String, nullable=True, comment="발주처 (예: OO건설)")
    constructor_company = Column(String, nullable=True, comment="시공사 (예: XX종합건설)")
    
    # 공사 상세
    project_type = Column(String, nullable=True, comment="공사 유형 (신축/리모델링/토목 등)")
    budget_amount = Column(Integer, nullable=True, comment="공사 금액 (원)")
    
    # 공사 기간
    start_date = Column(String, nullable=True, comment="착공일 (YYYY-MM-DD)")
    end_date = Column(String, nullable=True, comment="준공 예정일 (YYYY-MM-DD)")
    
    # 담당자 (FK)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="담당 소장 User ID")
    safety_manager_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="안전관리자 User ID")
    
    # 프로젝트 상태
    status = Column(String, default="PLANNED", comment="PLANNED(계획)/ACTIVE(진행 중)/DONE(완료)")
    
    created_at = Column(DateTime, default=datetime.now)
    
    # 관계 (Relationships)
    # sites = relationship("Site", back_populates="project")
    # companies = relationship("Company", back_populates="project")
    # workers = relationship("Worker", back_populates="project")
    
    # 주의: 관계는 Site/Company/Worker 모델에 project_id 추가 후 활성화
