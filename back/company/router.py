from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from back.database import get_db
from back.company.model import Company
from back.auth.model import User
from back.company.schema import WorkerRead, CompanyRead, CompanyCreate

router = APIRouter(tags=["company"])

@router.get("/company/workers", response_model=list[WorkerRead])
async def get_workers(company_id: int = None, status: str = None, db: AsyncSession = Depends(get_db)):
    # Worker 모델 대신 User 모델(role='worker') 조회
    query = select(User).options(selectinload(User.company)).where(User.role == "worker")
    
    if company_id:
        query = query.where(User.company_id == company_id)
    # status는 현재 User 모델에 없으므로 (ProjectMember에 있음) 일단 제외하거나, 추후 로직 추가 필요.
    # if status:
        # query = query.where(User.status == status)
        
    result = await db.execute(query)
    users = result.scalars().all()
    
    response = []
    for u in users:
        # WorkerRead 스키마 매핑
        response.append(WorkerRead(
            id=u.id,
            name=u.full_name, # name -> full_name
            company_id=u.company_id,
            trade=u.job_type if u.job_type else "미지정", # trade -> job_type
            status="OFF_SITE", # 임시 값 (ProjectMember 조인 필요)
            qualification_tags=None, # User 모델에 태그 필드 없으면 None
            company_name=u.company.name if u.company else "Unknown"
        ))
    return response

@router.get("/company", response_model=list[CompanyRead])
async def get_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company))
    return result.scalars().all()

@router.post("/company", response_model=CompanyRead, status_code=201)
async def create_company(company: CompanyCreate, db: AsyncSession = Depends(get_db)):
    # 중복 체크
    result = await db.execute(select(Company).where(Company.name == company.name))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="이미 등록된 업체명입니다.")
        
    new_company = Company(**company.dict())
    db.add(new_company)
    try:
        await db.commit()
        await db.refresh(new_company)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    return new_company
