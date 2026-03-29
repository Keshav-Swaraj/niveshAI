"""
Context Fetcher for NiveshAI
Enriches a raw signal with fundamentals, news, technicals, and historical data.
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def enrich_signal(symbol: str, signal_type: str, raw_data: dict) -> dict:
    """
    Fetches all context needed for AI synthesis:
    - fundamentals from yfinance_fetcher
    - last 5 news articles from news_fetcher
    - technical indicators from technicals.py
    - historical success rate for this signal pattern
    - last shareholding pattern change
    Returns: combined enriched dict
    """
    enriched = {
        "symbol": symbol,
        "signal_type": signal_type,
        "raw_data": raw_data,
        "fundamentals": {},
        "news": [],
        "technicals": {},
        "patterns": [],
        "historical_success": {},
        "shareholding": {},
    }

    # Fundamentals
    try:
        from data.yfinance_fetcher import get_fundamentals
        enriched["fundamentals"] = await get_fundamentals(symbol)
    except Exception as e:
        print(f"[context] fundamentals error for {symbol}: {e}")

    # News
    try:
        from data.news_fetcher import get_company_news
        enriched["news"] = await get_company_news(symbol, limit=5)
    except Exception as e:
        print(f"[context] news error for {symbol}: {e}")

    # Technicals
    try:
        from data.yfinance_fetcher import get_ohlcv
        from data.technicals import calculate_indicators, detect_patterns
        import pandas as pd

        ohlcv = await get_ohlcv(symbol, period="6mo")
        if ohlcv:
            df = pd.DataFrame(ohlcv)
            df.columns = [c.lower() for c in df.columns]
            enriched["technicals"] = calculate_indicators(df)
            enriched["patterns"] = detect_patterns(df, enriched["fundamentals"])
    except Exception as e:
        print(f"[context] technicals error for {symbol}: {e}")

    # Historical success rate for this signal type
    try:
        from data.technicals import calculate_historical_success_rate
        pattern = raw_data.get("pattern", signal_type)
        enriched["historical_success"] = calculate_historical_success_rate(pattern, symbol)
    except Exception as e:
        print(f"[context] historical_success error for {symbol}: {e}")

    # Shareholding
    try:
        from data.yfinance_fetcher import get_shareholding_history
        enriched["shareholding"] = await get_shareholding_history(symbol)
    except Exception as e:
        print(f"[context] shareholding error for {symbol}: {e}")

    return enriched
