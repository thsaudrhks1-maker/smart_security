
from fastapi import APIRouter
from back.content.repository import content_repository

router = APIRouter()

@router.get("/templates")
async def list_templates():
    return await content_repository.get_all_templates()

@router.get("/gear")
async def list_gear():
    return await content_repository.get_all_gear()
