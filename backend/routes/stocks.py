"""
Stocks API routes for NiveshAI.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter()


@router.get("/stocks/indices")
async def get_indices():
    """Get Nifty50 + Sensex live values."""
    try:
        from data.nse_fetcher import get_market_indices
        return await get_market_indices()
    except Exception as e:
        # Return demo data if fetcher fails
        return {
            "nifty50": {"value": 23450.64, "change": 234.50, "change_pct": 1.01},
            "sensex": {"value": 77301.20, "change": 498.30, "change_pct": 0.65},
            "bank_nifty": {"value": 49820.00, "change": 110.00, "change_pct": 0.22},
            "error": str(e)
        }


@router.get("/stocks/ohlcv/{symbol}")
async def get_ohlcv(symbol: str, period: str = "6mo", interval: str = "1d"):
    """Get OHLCV data for a symbol."""
    try:
        from data.yfinance_fetcher import get_ohlcv
        return await get_ohlcv(symbol.upper(), period, interval)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stocks/quote/{symbol}")
async def get_quote(symbol: str):
    """Get live quote for a symbol."""
    try:
        from data.nse_fetcher import get_live_quote
        return await get_live_quote(symbol.upper())
    except Exception as e:
        return {"symbol": symbol.upper(), "error": str(e), "price": None}


@router.get("/stocks/fundamentals/{symbol}")
async def get_fundamentals(symbol: str):
    """Get fundamentals for a symbol."""
    try:
        from data.yfinance_fetcher import get_fundamentals
        return await get_fundamentals(symbol.upper())
    except Exception as e:
        return {"symbol": symbol.upper(), "error": str(e)}


@router.get("/stocks/news/{symbol}")
async def get_stock_news(symbol: str):
    """Get latest news for a symbol."""
    try:
        from data.news_fetcher import get_company_news
        return await get_company_news(symbol.upper())
    except Exception as e:
        return []


@router.get("/stocks/financials/{symbol}")
async def get_financials(symbol: str):
    """Get quarterly financials for a symbol."""
    try:
        from data.yfinance_fetcher import get_financials
        return await get_financials(symbol.upper())
    except Exception as e:
        return {"symbol": symbol.upper(), "error": str(e)}


@router.get("/stocks/shareholding/{symbol}")
async def get_shareholding(symbol: str):
    """Get shareholding history for a symbol."""
    try:
        from data.yfinance_fetcher import get_shareholding_history
        return await get_shareholding_history(symbol.upper())
    except Exception as e:
        return {"symbol": symbol.upper(), "error": str(e)}


@router.get("/stocks/search")
async def search_stocks(q: str = Query(..., min_length=1)):
    """Search stocks by name or symbol."""
    # NSE popular stocks for search
    STOCKS = [
        {"symbol": "RELIANCE", "name": "Reliance Industries Limited", "sector": "Energy"},
        {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "IT"},
        {"symbol": "HDFCBANK", "name": "HDFC Bank Limited", "sector": "Banking"},
        {"symbol": "INFY", "name": "Infosys Limited", "sector": "IT"},
        {"symbol": "ICICIBANK", "name": "ICICI Bank Limited", "sector": "Banking"},
        {"symbol": "IREDA", "name": "Indian Renewable Energy Development Agency", "sector": "Finance"},
        {"symbol": "ZOMATO", "name": "Zomato Limited", "sector": "Consumer"},
        {"symbol": "DIXON", "name": "Dixon Technologies India Limited", "sector": "Electronics"},
        {"symbol": "CDSL", "name": "Central Depository Services Limited", "sector": "Finance"},
        {"symbol": "LTIM", "name": "LTIMindtree Limited", "sector": "IT"},
        {"symbol": "BAJFINANCE", "name": "Bajaj Finance Limited", "sector": "Finance"},
        {"symbol": "WIPRO", "name": "Wipro Limited", "sector": "IT"},
        {"symbol": "AXISBANK", "name": "Axis Bank Limited", "sector": "Banking"},
        {"symbol": "SBILIFE", "name": "SBI Life Insurance Company", "sector": "Insurance"},
        {"symbol": "TATAMOTORS", "name": "Tata Motors Limited", "sector": "Auto"},
        {"symbol": "MARUTI", "name": "Maruti Suzuki India Limited", "sector": "Auto"},
        {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical Industries", "sector": "Pharma"},
        {"symbol": "ADANIENT", "name": "Adani Enterprises Limited", "sector": "Infrastructure"},
        {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Limited", "sector": "Banking"},
        {"symbol": "LT", "name": "Larsen & Toubro Limited", "sector": "Infrastructure"},
    ]
    
    q_upper = q.upper()
    results = [
        s for s in STOCKS
        if q_upper in s["symbol"].upper() or q.lower() in s["name"].lower()
    ]
    return results[:10]


@router.get("/stocks/gainers")
async def get_gainers():
    """Get top gainers."""
    try:
        from data.nse_fetcher import get_top_gainers
        return await get_top_gainers()
    except Exception as e:
        return []


@router.get("/stocks/losers")
async def get_losers():
    """Get top losers."""
    try:
        from data.nse_fetcher import get_top_losers
        return await get_top_losers()
    except Exception as e:
        return []


@router.get("/test/{symbol}")
async def test_symbol(symbol: str):
    """
    Test endpoint — returns combined data from all fetchers for a given symbol.
    Designed to never crash — returns empty dict for any failed section.
    Test with: /api/test/RELIANCE, /api/test/IREDA, /api/test/ZOMATO
    """
    results = {
        "symbol": symbol.upper(),
        "ohlcv": [],
        "fundamentals": {},
        "financials": {},
        "quote": {},
        "news": [],
        "technicals": {},
        "bulk_deals": [],
        "errors": {}
    }
    
    # yfinance OHLCV
    try:
        from data.yfinance_fetcher import get_ohlcv
        results["ohlcv"] = await get_ohlcv(symbol.upper())
        results["ohlcv_count"] = len(results["ohlcv"])
    except Exception as e:
        results["errors"]["ohlcv"] = str(e)

    # Fundamentals
    try:
        from data.yfinance_fetcher import get_fundamentals
        results["fundamentals"] = await get_fundamentals(symbol.upper())
    except Exception as e:
        results["errors"]["fundamentals"] = str(e)
    
    # Financials
    try:
        from data.yfinance_fetcher import get_financials
        results["financials"] = await get_financials(symbol.upper())
    except Exception as e:
        results["errors"]["financials"] = str(e)

    # NSE live quote
    try:
        from data.nse_fetcher import get_live_quote
        results["quote"] = await get_live_quote(symbol.upper())
    except Exception as e:
        results["errors"]["quote"] = str(e)

    # News
    try:
        from data.news_fetcher import get_company_news
        results["news"] = await get_company_news(symbol.upper())
        results["news_count"] = len(results["news"])
    except Exception as e:
        results["errors"]["news"] = str(e)

    # Technical indicators
    try:
        import pandas as pd
        from data.yfinance_fetcher import get_ohlcv
        from data.technicals import calculate_indicators, detect_patterns
        
        ohlcv_data = results.get("ohlcv") or await get_ohlcv(symbol.upper())
        if ohlcv_data:
            df = pd.DataFrame(ohlcv_data)
            df.columns = [c.lower() for c in df.columns]
            results["technicals"] = calculate_indicators(df)
            results["patterns"] = detect_patterns(df, results.get("fundamentals", {}))
    except Exception as e:
        results["errors"]["technicals"] = str(e)

    # Bulk deals
    try:
        from data.nse_fetcher import get_bulk_deals
        all_deals = await get_bulk_deals()
        results["bulk_deals"] = [d for d in all_deals if d.get("symbol", "").upper() == symbol.upper()]
    except Exception as e:
        results["errors"]["bulk_deals"] = str(e)

    return results
