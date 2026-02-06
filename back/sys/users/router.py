
from fastapi import APIRouter, HTTPException
from back.sys.users.schema import UserLogin
from back.sys.users.service import users_service

router = APIRouter()

@router.post("/login")
async def login(req: UserLogin):
    user = await users_service.authenticate(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="인증 실패")
    return {"status": "ok", "user": user}
