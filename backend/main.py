"""
NiveshAI Backend — FastAPI Application
AI-powered stock market signal intelligence for Indian retail investors.
"""
import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env vars
load_dotenv("../.env")

# Import DB init
from models import init_db, get_all_signals, signal_to_dict
from websocket_manager import ws_manager

# Import routers
from routes.signals import router as signals_router
from routes.stocks import router as stocks_router
from routes.portfolio import router as portfolio_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🚀 NiveshAI Backend starting...")

    # Initialize SQLite database
    init_db()

    # Check if we need to seed demo data
    signals = get_all_signals(limit=1)
    if not signals:
        print("ℹ No signals found — running seed_demo.py...")
        try:
            from seed_demo import seed
            await seed()
        except Exception as e:
            print(f"⚠ Auto-seed failed: {e}. Run python seed_demo.py manually.")

    print("✓ NiveshAI Backend ready!")
    print(f"  → API docs:  http://localhost:8000/docs")
    print(f"  → WebSocket: ws://localhost:8000/ws/signals")
    print(f"  → Test:      http://localhost:8000/api/test/RELIANCE")

    yield

    print("NiveshAI Backend shutting down...")


app = FastAPI(
    title="NiveshAI API",
    description="AI-powered stock market signal intelligence for Indian retail investors",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow frontend on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(signals_router, prefix="/api")
app.include_router(stocks_router, prefix="/api")
app.include_router(portfolio_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "NiveshAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "signals": "/api/signals",
            "test": "/api/test/{symbol}",
            "market_brief": "/api/market-brief",
            "websocket": "ws://localhost:8000/ws/signals"
        }
    }


@app.get("/health")
async def health():
    conn_count = len(ws_manager.active_connections)
    signals = get_all_signals(limit=100)
    return {
        "status": "healthy",
        "websocket_connections": conn_count,
        "signal_count": len(signals)
    }


# WebSocket endpoint
@app.websocket("/ws/signals")
async def websocket_signals(websocket: WebSocket):
    """WebSocket endpoint for real-time signal updates."""
    await ws_manager.connect(websocket)

    try:
        # Send current signals on connect
        signals = get_all_signals()
        parsed_signals = [signal_to_dict(s) for s in signals]
        await ws_manager.send_personal(websocket, {
            "type": "initial_signals",
            "data": parsed_signals
        })

        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})

    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await ws_manager.disconnect(websocket)
