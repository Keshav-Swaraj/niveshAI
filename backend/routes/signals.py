"""
Signals API routes for NiveshAI.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException
from models import get_all_signals, get_signals_by_symbol, dismiss_signal, signal_to_dict

router = APIRouter()


@router.get("/signals")
async def get_signals(limit: int = 50):
    """Get all signals sorted by confidence_score DESC."""
    signals = get_all_signals(limit=limit)
    return [signal_to_dict(s) for s in signals]


@router.get("/signals/type/{signal_type}")
async def get_signals_by_type(signal_type: str):
    """Get signals filtered by signal_type."""
    from models import get_db
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM signals WHERE UPPER(signal_type) = ? AND status != 'dismissed' ORDER BY confidence_score DESC, trigger_time DESC",
        (signal_type.upper(),)
    )
    rows = cursor.fetchall()
    conn.close()
    return [signal_to_dict(dict(r)) for r in rows]


@router.get("/signals/{symbol}")
async def get_symbol_signals(symbol: str):
    """Get signals for a specific stock symbol."""
    signals = get_signals_by_symbol(symbol.upper())
    return [signal_to_dict(s) for s in signals]


@router.post("/signals/{signal_id}/dismiss")
async def dismiss_signal_endpoint(signal_id: str):
    """Mark a signal as dismissed."""
    dismiss_signal(signal_id)
    return {"status": "ok", "message": f"Signal {signal_id} dismissed"}


@router.get("/market-brief")
async def get_market_brief():
    """Get AI-generated daily market brief (placeholder - uses cached or Gemini-generated content)."""
    # Return demo content for now — will be replaced with Gemini call in Task 4
    return {
        "bullets": [
            "FIIs turned net buyers today with ₹2,840 Cr inflow — first positive session in 5 days, Nifty50 held critical 23,200 support.",
            "IREDA bulk deal: Promoter (GoI) bought 2.1% stake — strong signal in renewable energy amid government capex push.",
            "Bajaj Finance RSI at 31 — oversold territory after 8% correction; MACD bullish cross forming on daily charts."
        ],
        "generated_at": "2024-12-10T09:15:00",
        "cached": True
    }
