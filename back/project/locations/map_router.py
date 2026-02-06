
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
import shutil
import os
import uuid
from typing import List, Optional
from back.project.locations.schema import RiskZone, WorkerBox

router = APIRouter()

# --- In-Memory 임시 저장소 (추후 DB 연동) ---
risks_db = []
current_blueprint_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Blueprint_sample.svg/1200px-Blueprint_sample.svg.png"

@router.get("/risks")
async def get_risks():
    return risks_db

@router.post("/blueprint")
async def upload_blueprint(file: UploadFile = File(...)):
    global current_blueprint_url
    try:
        file_ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_ext}"
        save_path = f"back/static/blueprints/{filename}"
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        current_blueprint_url = f"/static/blueprints/{filename}"
        return {"url": current_blueprint_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blueprint")
async def get_blueprint():
    return {"url": current_blueprint_url}

# --- WebSocket 관리자 ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try: await connection.send_json(message)
            except: pass

manager = ConnectionManager()

@router.websocket("/ws/workers")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
