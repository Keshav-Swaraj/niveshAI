"""
Portfolio API routes for NiveshAI.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

DEMO_PORTFOLIO_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "demo_portfolio.json")


def load_demo_portfolio():
    """Load demo portfolio from JSON file."""
    try:
        with open(DEMO_PORTFOLIO_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return [
            {"symbol": "RELIANCE", "qty": 50, "avg_price": 2800},
            {"symbol": "TCS", "qty": 20, "avg_price": 3900},
            {"symbol": "HDFCBANK", "qty": 30, "avg_price": 1650},
            {"symbol": "IREDA", "qty": 200, "avg_price": 215},
            {"symbol": "ZOMATO", "qty": 100, "avg_price": 142},
            {"symbol": "CDSL", "qty": 15, "avg_price": 1340},
        ]


@router.get("/portfolio")
async def get_portfolio():
    """Get demo portfolio holdings."""
    return load_demo_portfolio()


@router.get("/portfolio/signals")
async def get_portfolio_signals(holdings: str = "RELIANCE,TCS,HDFCBANK"):
    """Get signals for held stocks only."""
    from models import get_signals_by_symbol, signal_to_dict
    
    symbols = [s.strip().upper() for s in holdings.split(",")]
    all_signals = []
    
    for symbol in symbols:
        signals = get_signals_by_symbol(symbol)
        all_signals.extend([signal_to_dict(s) for s in signals])
    
    # Sort by confidence score
    all_signals.sort(key=lambda x: x.get("confidence_score") or 0, reverse=True)
    return all_signals


class PortfolioHolding(BaseModel):
    symbol: str
    qty: int
    avg_price: float


class PortfolioAnalyzeRequest(BaseModel):
    holdings: List[PortfolioHolding]


@router.post("/portfolio/analyze")
async def analyze_portfolio(request: PortfolioAnalyzeRequest):
    """Gemini analysis of the full portfolio."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
        
        holdings_text = ", ".join([
            f"{h.symbol} ({h.qty} shares @ ₹{h.avg_price})"
            for h in request.holdings
        ])
        
        model = genai.GenerativeModel("gemini-2.5-flash-lite-preview-06-17")
        response = model.generate_content(
            f"""Analyze this NSE stock portfolio for an Indian retail investor:
            Holdings: {holdings_text}
            
            Provide:
            1. Overall portfolio health assessment
            2. Sector concentration risks
            3. Top 2 opportunities to watch
            4. Top 2 risks to monitor
            
            Keep it concise and actionable. Format as JSON with keys: health, risks, opportunities, summary"""
        )
        
        return {"analysis": response.text, "holdings_count": len(request.holdings)}
    except Exception as e:
        return {
            "analysis": "Portfolio analysis unavailable. Please try again later.",
            "error": str(e)
        }
