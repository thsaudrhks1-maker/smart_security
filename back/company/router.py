from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from back.database import get_db
from back.company.model import Company, Worker
from back.company.schema import WorkerRead, CompanyRead, CompanyCreate

router = APIRouter(tags=["company"])

@router.get("/company/workers", response_model=list[WorkerRead])
async def get_workers(company_id: int = None, status: str = None, db: AsyncSession = Depends(get_db)):
    query = select(Worker).options(selectinload(Worker.company))
    
    if company_id:
        query = query.where(Worker.company_id == company_id)
    if status:
        query = query.where(Worker.status == status)
        
    result = await db.execute(query)
    workers = result.scalars().all()
    
    response = []
    for w in workers:
        response.append(WorkerRead(
            id=w.id,
            name=w.name,
            company_id=w.company_id,
            trade=w.trade,
            status=w.status,
            qualification_tags=w.qualification_tags,
            company_name=w.company.name if w.company else "Unknown"
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
