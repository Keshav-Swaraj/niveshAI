"""
Signal Monitor Agent for NiveshAI
Detects signals across the NSE universe and stores them in the DB.
Runs on schedule via Inngest.
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from models import insert_signal, get_db

WATCHLIST = [
    "RELIANCE", "TCS", "HDFCBANK", "IREDA", "ZOMATO",
    "DIXON", "CDSL", "LTIM", "BAJFINANCE", "INFY"
]


def create_signal(symbol: str, company_name: str, signal_type: str, raw_data: dict) -> str:
    """
    Create and store a new signal in the DB.
    Returns signal_id.
    """
    signal_id = insert_signal(
        symbol=symbol,
        company_name=company_name,
        signal_type=signal_type,
        trigger_time=datetime.now().isoformat(),
        raw_data=raw_data,
        status="new"
    )
    print(f"✓ Signal created: {symbol} - {signal_type} (id: {signal_id[:8]}...)")
    return signal_id


def _is_duplicate_signal(symbol: str, signal_type: str, hours: int = 24) -> bool:
    """Check if a similar signal was created in the last N hours."""
    from datetime import timedelta
    cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) FROM signals WHERE symbol = ? AND signal_type = ? AND trigger_time > ?",
        (symbol, signal_type, cutoff)
    )
    count = cursor.fetchone()[0]
    conn.close()
    return count > 0


async def run_signal_monitor():
    """
    Main signal monitor function.
    Runs every 60 minutes during market hours (9:15 AM - 3:30 PM IST).
    
    Steps:
    1. Fetch today's bulk deals and create BULK_DEAL signals
    2. Fetch live quotes for watchlist stocks
    3. Run detect_patterns() on each watchlist stock
    4. Create signals for detected patterns
    5. Check for volume spikes
    """
    print(f"[Signal Monitor] Running at {datetime.now().strftime('%H:%M:%S IST')}")
    
    signals_created = []
    
    # Step 1: Bulk Deals
    try:
        from data.nse_fetcher import get_bulk_deals
        bulk_deals = await get_bulk_deals()
        
        for deal in bulk_deals:
            symbol = deal.get("symbol", "")
            if not symbol:
                continue
            
            # Filter: quantity > 0.5% of daily volume (significant)
            pct = deal.get("pct_of_total_vol", 0) or 0
            quantity = deal.get("quantity", 0) or 0
            
            if pct >= 0.5 or quantity >= 100000:
                if not _is_duplicate_signal(symbol, "BULK_DEAL"):
                    sig_id = create_signal(
                        symbol=symbol,
                        company_name=deal.get("company_name", symbol),
                        signal_type="BULK_DEAL",
                        raw_data=deal
                    )
                    signals_created.append(sig_id)
    
    except Exception as e:
        print(f"[Signal Monitor] Bulk deals error: {e}")
    
    # Step 2 & 3: Watchlist pattern detection
    try:
        from data.yfinance_fetcher import get_ohlcv, get_fundamentals
        from data.technicals import detect_patterns, calculate_indicators
        import pandas as pd
        
        for symbol in WATCHLIST:
            try:
                # Fetch OHLCV
                ohlcv = await get_ohlcv(symbol, period="1y")
                if not ohlcv:
                    continue
                
                df = pd.DataFrame(ohlcv)
                df.columns = [c.lower() for c in df.columns]
                
                # Fundamentals for 52-week levels
                fundamentals = await get_fundamentals(symbol)
                
                # Calculate indicators
                indicators = calculate_indicators(df)
                
                # Detect patterns
                patterns = detect_patterns(df, fundamentals)
                
                print(f"  {symbol}: {patterns}")
                
                # Create signals for key patterns
                signal_pattern_map = {
                    "golden_cross": "GOLDEN_CROSS",
                    "death_cross": "GOLDEN_CROSS",  # We'll use same type, differentiated in raw_data
                    "oversold_rsi": "OVERSOLD_RSI",
                    "overbought_rsi": "OVERSOLD_RSI",
                    "volume_spike_3x": "VOLUME_SPIKE",
                    "breakout_52w": "BREAKOUT",
                    "macd_bullish_cross": "BREAKOUT",
                    "near_52w_low": "OVERSOLD_RSI",
                }
                
                for pattern in patterns:
                    signal_type = signal_pattern_map.get(pattern)
                    if not signal_type:
                        continue
                    
                    if not _is_duplicate_signal(symbol, signal_type, hours=24):
                        sig_id = create_signal(
                            symbol=symbol,
                            company_name=fundamentals.get("company_name", symbol),
                            signal_type=signal_type,
                            raw_data={
                                "pattern": pattern,
                                "price": indicators.get("current_price"),
                                "rsi": indicators.get("rsi"),
                                "volume": indicators.get("current_volume"),
                                "avg_volume_20d": indicators.get("volume_sma_20"),
                                "sma_50": indicators.get("sma_50"),
                                "sma_200": indicators.get("sma_200"),
                                "macd": indicators.get("macd"),
                                "macd_signal": indicators.get("macd_signal"),
                            }
                        )
                        signals_created.append(sig_id)
                
            except Exception as e:
                print(f"[Signal Monitor] Error processing {symbol}: {e}")
                continue
    
    except Exception as e:
        print(f"[Signal Monitor] Watchlist processing error: {e}")
    
    print(f"[Signal Monitor] Complete. Created {len(signals_created)} new signals.")
    
    # Broadcast new signals via WebSocket
    if signals_created:
        try:
            from websocket_manager import ws_manager
            from models import get_all_signals, signal_to_dict
            
            signals = get_all_signals(limit=50)
            await ws_manager.broadcast({
                "type": "signals_updated",
                "count": len(signals),
                "data": [signal_to_dict(s) for s in signals[:10]]
            })
        except Exception as e:
            print(f"[Signal Monitor] WebSocket broadcast error: {e}")
    
    return signals_created
