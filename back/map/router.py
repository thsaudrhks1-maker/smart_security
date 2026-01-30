from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import uuid
import asyncio
import random

router = APIRouter(tags=["map"])

# --- In-Memory Data Store ---
class RiskZone(BaseModel):
    id: int
    name: str
    type: str  # equipment, opening, falling
    lat: float
    lng: float
    radius: float

class WorkerBox(BaseModel):
    id: int
    name: str
    role: str
    lat: float
    lng: float
    status: str # 'SAFE', 'DANGER'

# 초기 데이터
risks_db = [
    RiskZone(id=1, name="타워크레인 1호기", type="equipment", lat=37.5663, lng=126.9778, radius=25),
    RiskZone(id=2, name="지하 환기구 개구부", type="opening", lat=37.5668, lng=126.9783, radius=15),
]

workers_db = [
    WorkerBox(id=101, name="김반장", role="안전팀장", lat=37.5665, lng=126.9780, status="SAFE"),
    WorkerBox(id=102, name="이철근", role="철근공", lat=37.5663, lng=126.9778, status="DANGER"),
    WorkerBox(id=103, name="박전기", role="전기공", lat=37.5667, lng=126.9782, status="SAFE"),
    WorkerBox(id=104, name="최신호", role="신호수", lat=37.5666, lng=126.9781, status="SAFE"),
]

current_blueprint_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Blueprint_sample.svg/1200px-Blueprint_sample.svg.png"

# --- WebSocket for Worker Tracking ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Background Task to Simulate Worker Movement
async def simulate_worker_movement():
    while True:
        # 1초마다 움직임 시뮬레이션
        for worker in workers_db:
            # Random movement
            d_lat = (random.random() - 0.5) * 0.0001
            d_lng = (random.random() - 0.5) * 0.0001
            worker.lat += d_lat
            worker.lng += d_lng
            
            # Check Risk Zones
            status = "SAFE"
            for risk in risks_db:
                # Simple distance check (approximate)
                # 1 deg lat approx 111km. 0.0001 deg approx 11m.
                dist = ((worker.lat - risk.lat)**2 + (worker.lng - risk.lng)**2)**0.5
                # radius unit? Assuming radius in meters and map in lat/lng is tricky without conversion.
                # Heuristic: 0.0001 deg ~ 10m.
                # If radius is 20m, threshold is 0.0002
                threshold = risk.radius * 0.00001 
                if dist < threshold:
                    status = "DANGER"
                    break
            worker.status = status

        # Broadcast updates
        await manager.broadcast({
            "type": "WORKER_UPDATE",
            "data": [w.dict() for w in workers_db]
        })
        
        await asyncio.sleep(1)

# Start simulation on module load (Not ideal but works for simple script. 
# Better to start on startup event in main.py, but we'll trigger it via endpoint or handle in main)
# We will expose a start endpoint or leave it to main.py to run logic. 
# Actually, websocket endpoint can run a loop if it's the only one, but we have multiple clients.
# We will use startup event in main.py to run this background task.

# --- API Endpoints ---

@router.get("/map/risks", response_model=List[RiskZone])
def get_risks():
    return risks_db

@router.post("/map/risks", response_model=RiskZone)
def add_risk(risk: RiskZone):
    risk.id = len(risks_db) + 1
    risks_db.append(risk)
    return risk

@router.delete("/map/risks/{risk_id}")
def delete_risk(risk_id: int):
    global risks_db
    risks_db = [r for r in risks_db if r.id != risk_id]
    return {"status": "success"}

@router.post("/map/blueprint")
async def upload_blueprint(file: UploadFile = File(...)):
    global current_blueprint_url
    try:
        file_ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_ext}"
        save_path = f"back/static/blueprints/{filename}"
        
        # Ensure dir exists
        os.makedirs("back/static/blueprints", exist_ok=True)
        
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # URL assumes localhost:8000 serving static
        current_blueprint_url = f"http://localhost:8000/static/blueprints/{filename}"
        return {"url": current_blueprint_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/map/blueprint")
def get_blueprint():
    return {"url": current_blueprint_url}

@router.websocket("/ws/workers")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Client usually doesn't send much, just listens.
            # But we need to keep connection open.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
