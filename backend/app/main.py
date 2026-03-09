import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.services.flights import fetch_flights
from app.services.disasters import fetch_disasters
from app.services.satellites import fetch_iss_position

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Global Nexus Tracker API",
    description="Real-time planetary data streaming backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"[WS] Client connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
        logger.info(f"[WS] Client disconnected. Total: {len(self.active)}")

    async def broadcast(self, data: dict):
        payload = json.dumps(data)
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()

# --- Background streaming task ---
async def stream_data():
    """Continuously fetch all data and broadcast to WebSocket clients."""
    while True:
        if manager.active:
            try:
                flights = await fetch_flights()
                disasters = await fetch_disasters()
                iss = await fetch_iss_position()
                await manager.broadcast({
                    "type": "FULL_UPDATE",
                    "flights": flights,
                    "disasters": disasters,
                    "iss": iss,
                })
            except Exception as e:
                logger.error(f"[Stream] Error: {e}")
        await asyncio.sleep(15)  # Push updates every 15 seconds

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(stream_data())
    logger.info("[Nexus] Backend started. WebSocket streaming active.")

@app.websocket("/ws/live")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        # Send an immediate snapshot on connect
        flights = await fetch_flights()
        disasters = await fetch_disasters()
        iss = await fetch_iss_position()
        await ws.send_text(json.dumps({
            "type": "FULL_UPDATE",
            "flights": flights,
            "disasters": disasters,
            "iss": iss,
        }))
        while True:
            # Keep alive — client can send pings
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text(json.dumps({"type": "PONG"}))
    except WebSocketDisconnect:
        manager.disconnect(ws)
