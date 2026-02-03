from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Time, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from back.database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"       # 출근
    LATE = "LATE"             # 지각
    LEAVE_EARLY = "LEAVE_EARLY" # 조퇴
    ABSENT = "ABSENT"         # 결근

class Attendance(Base):
    """
    출역 관리 (Attendance)
    - CSV 'commute_list' 참조하여 구현
    - 근로자의 일일 출퇴근 기록
    """
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    
    # 핵심 관계
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="근로자 ID")
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, comment="투입된 프로젝트 ID")
    
    # 날짜 및 시간
    date = Column(Date, nullable=False, index=True, comment="출역일 (YYYY-MM-DD)")
    
    check_in_time = Column(DateTime, nullable=True, comment="출근 시간")
    check_out_time = Column(DateTime, nullable=True, comment="퇴근 시간")
    
    # 인증 방식 및 상태
    check_in_method = Column(String, default="APP", comment="출근 인증 방식 (APP, QR, FACE, MANUAL)")
    status = Column(String, default="PRESENT", comment="상태 (PRESENT, LATE, LEAVE_EARLY)")
    
    # 현장 작업 내용 (간략)
    work_type_id = Column(Integer, nullable=True, comment="당일 공종 (선택 사항)")
    
    # 메타 데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계 설정
    user = relationship("User", back_populates="attendances")
    project = relationship("Project")
