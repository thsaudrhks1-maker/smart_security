from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from back.database import get_db
from back.company.model import Company, Worker
from back.company.schema import WorkerRead, CompanyRead

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
