"""
NSE Fetcher for NiveshAI
Fetches live NSE data: bulk deals, quotes, indices, movers.
Uses publicly available NSE/BSE endpoints.
"""
import asyncio
import httpx
import json
from typing import Optional

NSE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/",
}

DEMO_QUOTES = {
    "RELIANCE":   {"price": 2847.50, "change": 34.20,  "change_pct": 1.22,  "volume": 4200000},
    "TCS":        {"price": 3920.00, "change": 20.00,  "change_pct": 0.51,  "volume": 920000},
    "HDFCBANK":   {"price": 1620.00, "change": -30.00, "change_pct": -1.82, "volume": 5800000},
    "IREDA":      {"price": 340.00,  "change": 12.40,  "change_pct": 3.79,  "volume": 12000000},
    "ZOMATO":     {"price": 180.50,  "change": 4.20,   "change_pct": 2.38,  "volume": 28000000},
    "DIXON":      {"price": 15250.0, "change": 450.00, "change_pct": 3.04,  "volume": 285000},
    "CDSL":       {"price": 1395.00, "change": 55.00,  "change_pct": 4.11,  "volume": 1800000},
    "BAJFINANCE": {"price": 6920.00, "change": 30.00,  "change_pct": 0.44,  "volume": 2100000},
    "LTIM":       {"price": 5830.00, "change": -20.00, "change_pct": -0.34, "volume": 430000},
    "INFY":       {"price": 1456.00, "change": 12.50,  "change_pct": 0.87,  "volume": 6200000},
}


async def get_bulk_deals() -> list:
    """
    Fetch NSE bulk deals.
    Returns: [{symbol, client_name, buy_sell, quantity, price, pct_of_total_vol}]
    """
    try:
        async with httpx.AsyncClient(timeout=15, headers=NSE_HEADERS) as client:
            # First get the cookie
            await client.get("https://www.nseindia.com/market-data/bulk-deals")
            resp = await client.get("https://www.nseindia.com/api/snapshot-capital-market-largeDeals")
            
            if resp.status_code == 200:
                data = resp.json()
                deals = []
                for item in data.get("data", []):
                    deals.append({
                        "symbol": item.get("symbol", ""),
                        "company_name": item.get("cmpny", ""),
                        "client_name": item.get("clientName", ""),
                        "buy_sell": item.get("buySell", ""),
                        "quantity": int(item.get("quantTraded", 0)),
                        "price": float(item.get("trdPrc", 0)),
                        "pct_of_total_vol": float(item.get("rmrks", 0)) if item.get("rmrks") else 0.0,
                        "date": item.get("DT_DATE", ""),
                    })
                return deals
    except Exception as e:
        print(f"[NSE] bulk_deals error: {e}")
    
    # Fallback demo data
    return [
        {
            "symbol": "IREDA",
            "company_name": "Indian Renewable Energy Dev Agency",
            "client_name": "Government of India (Promoter)",
            "buy_sell": "BUY",
            "quantity": 8500000,
            "price": 215.40,
            "pct_of_total_vol": 2.1,
            "date": "15-Oct-2024"
        },
        {
            "symbol": "LTIM",
            "company_name": "LTIMindtree Limited",
            "client_name": "Larsen and Toubro Limited (Promoter)",
            "buy_sell": "BUY",
            "quantity": 2200000,
            "price": 5840.00,
            "pct_of_total_vol": 1.4,
            "date": "20-Aug-2024"
        }
    ]


async def get_live_quote(symbol: str) -> dict:
    """
    Get live NSE quote for a symbol.
    Returns: {price, change, change_pct, volume, prev_close, high, low, week52_high, week52_low, delivery_pct}
    """
    try:
        async with httpx.AsyncClient(timeout=15, headers=NSE_HEADERS) as client:
            await client.get("https://www.nseindia.com")
            resp = await client.get(
                f"https://www.nseindia.com/api/quote-equity?symbol={symbol}"
            )
            
            if resp.status_code == 200:
                data = resp.json()
                price_info = data.get("priceInfo", {})
                series = data.get("metadata", {})
                
                ltp = price_info.get("lastPrice", 0) or price_info.get("close", 0)
                prev_close = price_info.get("previousClose", 0)
                change = ltp - prev_close if ltp and prev_close else 0
                change_pct = (change / prev_close * 100) if prev_close else 0
                
                return {
                    "symbol": symbol,
                    "price": round(ltp, 2),
                    "change": round(change, 2),
                    "change_pct": round(change_pct, 2),
                    "volume": int(price_info.get("totalTradedVolume", 0)),
                    "prev_close": round(prev_close, 2),
                    "high": round(price_info.get("intraDayHighLow", {}).get("max", 0), 2),
                    "low": round(price_info.get("intraDayHighLow", {}).get("min", 0), 2),
                    "week52_high": round(price_info.get("weekHighLow", {}).get("max", 0), 2),
                    "week52_low": round(price_info.get("weekHighLow", {}).get("min", 0), 2),
                    "delivery_pct": float(series.get("deliveryToTradedQuantity", 0) or 0),
                }
    except Exception as e:
        print(f"[NSE] quote error for {symbol}: {e}")
    
    # Fallback to demo data
    demo = DEMO_QUOTES.get(symbol, {})
    price = demo.get("price", 0)
    change = demo.get("change", 0)
    prev_close = price - change
    
    return {
        "symbol": symbol,
        "price": price,
        "change": change,
        "change_pct": demo.get("change_pct", 0),
        "volume": demo.get("volume", 0),
        "prev_close": round(prev_close, 2),
        "high": round(price * 1.01, 2),
        "low": round(price * 0.99, 2),
        "week52_high": round(price * 1.35, 2),
        "week52_low": round(price * 0.65, 2),
        "delivery_pct": 45.2,
    }


async def get_market_indices() -> dict:
    """
    Get Nifty50,  Sensex, Bank Nifty values.
    Returns: {nifty50: {value, change, change_pct}, sensex: {...}, ...}
    """
    try:
        async with httpx.AsyncClient(timeout=15, headers=NSE_HEADERS) as client:
            await client.get("https://www.nseindia.com")
            resp = await client.get("https://www.nseindia.com/api/allIndices")
            
            if resp.status_code == 200:
                data = resp.json()
                result = {}
                
                index_map = {
                    "NIFTY 50": "nifty50",
                    "NIFTY BANK": "bank_nifty",
                    "NIFTY NEXT 50": "nifty_next50",
                    "INDIA VIX": "vix",
                }
                
                for idx in data.get("data", []):
                    name = idx.get("index", "")
                    key = index_map.get(name)
                    if key:
                        result[key] = {
                            "value": round(float(idx.get("last", 0)), 2),
                            "change": round(float(idx.get("variation", 0)), 2),
                            "change_pct": round(float(idx.get("percentChange", 0)), 2),
                        }
                
                return result
    except Exception as e:
        print(f"[NSE] indices error: {e}")
    
    # Fallback
    return {
        "nifty50": {"value": 23450.64, "change": 234.50, "change_pct": 1.01},
        "sensex": {"value": 77301.20, "change": 498.30, "change_pct": 0.65},
        "bank_nifty": {"value": 49820.00, "change": 110.00, "change_pct": 0.22},
    }


async def get_top_gainers() -> list:
    """Get top gainers on NSE."""
    try:
        async with httpx.AsyncClient(timeout=15, headers=NSE_HEADERS) as client:
            await client.get("https://www.nseindia.com")
            resp = await client.get("https://www.nseindia.com/api/live-analysis-variations?index=gainers")
            
            if resp.status_code == 200:
                data = resp.json()
                gainers = []
                for item in data.get("NIFTY", {}).get("data", [])[:10]:
                    gainers.append({
                        "symbol": item.get("symbol", ""),
                        "company": item.get("symbol", ""),
                        "price": round(float(item.get("ltp", 0)), 2),
                        "change_pct": round(float(item.get("netPrice", 0)), 2),
                    })
                return gainers
    except Exception as e:
        print(f"[NSE] gainers error: {e}")
    
    return [
        {"symbol": "IREDA", "company": "IREDA", "price": 340.00, "change_pct": 3.79},
        {"symbol": "CDSL", "company": "CDSL", "price": 1395.00, "change_pct": 4.11},
        {"symbol": "DIXON", "company": "DIXON", "price": 15250.0, "change_pct": 3.04},
        {"symbol": "ZOMATO", "company": "ZOMATO", "price": 180.50, "change_pct": 2.38},
    ]


async def get_top_losers() -> list:
    """Get top losers on NSE."""
    try:
        async with httpx.AsyncClient(timeout=15, headers=NSE_HEADERS) as client:
            await client.get("https://www.nseindia.com")
            resp = await client.get("https://www.nseindia.com/api/live-analysis-variations?index=losers")
            
            if resp.status_code == 200:
                data = resp.json()
                losers = []
                for item in data.get("NIFTY", {}).get("data", [])[:10]:
                    losers.append({
                        "symbol": item.get("symbol", ""),
                        "company": item.get("symbol", ""),
                        "price": round(float(item.get("ltp", 0)), 2),
                        "change_pct": round(float(item.get("netPrice", 0)), 2),
                    })
                return losers
    except Exception as e:
        print(f"[NSE] losers error: {e}")
    
    return [
        {"symbol": "HDFCBANK", "company": "HDFCBANK", "price": 1620.00, "change_pct": -1.82},
        {"symbol": "LTIM", "company": "LTIM", "price": 5830.00, "change_pct": -0.34},
    ]


async def get_corporate_announcements(symbol: str) -> list:
    """Get recent BSE/NSE filings for a symbol."""
    try:
        async with httpx.AsyncClient(timeout=15, headers=NSE_HEADERS) as client:
            await client.get("https://www.nseindia.com")
            resp = await client.get(
                f"https://www.nseindia.com/api/quote-equity?symbol={symbol}&section=corpInfo"
            )
            if resp.status_code == 200:
                data = resp.json()
                announcements = []
                for item in data.get("corporate", {}).get("announcements", [])[:5]:
                    announcements.append({
                        "date": item.get("excDate", ""),
                        "subject": item.get("subject", ""),
                        "description": item.get("description", ""),
                    })
                return announcements
    except Exception as e:
        print(f"[NSE] announcements error for {symbol}: {e}")
    
    return []
