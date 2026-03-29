"""
Seed Demo Data for NiveshAI
Pre-populates signals.db with 8 realistic signals based on real NSE historical events.
Calls Gemini synthesis for each to generate AI analysis.

Run: python seed_demo.py (from backend/ directory)
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv("../.env")

from models import init_db, insert_signal, update_signal_analysis, get_db

DEMO_SIGNALS = [
    {
        "symbol": "IREDA",
        "company_name": "Indian Renewable Energy Development Agency",
        "signal_type": "BULK_DEAL",
        "trigger_time": "2024-10-15T10:23:00",
        "raw_data": {
            "client": "Government of India (Promoter)",
            "buy_sell": "BUY",
            "quantity": 8500000,
            "price": 215.40,
            "pct_of_volume": 2.1,
            "pattern": "BULK_DEAL"
        }
    },
    {
        "symbol": "CDSL",
        "company_name": "Central Depository Services Limited",
        "signal_type": "INSIDER_BUY",
        "trigger_time": "2024-09-12T14:15:00",
        "raw_data": {
            "insider_name": "Nehal Vora (MD & CEO)",
            "transaction": "BUY",
            "shares": 25000,
            "price": 1340.00,
            "value_lakh": 335,
            "pattern": "INSIDER_BUY"
        }
    },
    {
        "symbol": "ZOMATO",
        "company_name": "Zomato Limited",
        "signal_type": "VOLUME_SPIKE",
        "trigger_time": "2024-02-08T11:45:00",
        "raw_data": {
            "volume": 125000000,
            "avg_volume_20d": 38000000,
            "volume_ratio": 3.3,
            "rsi": 38.2,
            "price": 142.50,
            "pattern": "volume_spike_3x"
        }
    },
    {
        "symbol": "DIXON",
        "company_name": "Dixon Technologies India Limited",
        "signal_type": "BREAKOUT",
        "trigger_time": "2024-11-22T09:45:00",
        "raw_data": {
            "breakout_type": "52_week_high",
            "prev_high": 14800,
            "breakout_price": 15250,
            "volume": 285000,
            "avg_volume_20d": 112000,
            "volume_ratio": 2.5,
            "pattern": "breakout_52w"
        }
    },
    {
        "symbol": "HDFCBANK",
        "company_name": "HDFC Bank Limited",
        "signal_type": "FILING_ALERT",
        "trigger_time": "2024-12-03T20:15:00",
        "raw_data": {
            "filing_type": "Promoter Pledge Increase",
            "pledged_shares": 12500000,
            "pct_pledged_change": "+1.8%",
            "total_pledged_pct": "4.2%",
            "pattern": "FILING_ALERT"
        }
    },
    {
        "symbol": "LTIM",
        "company_name": "LTIMindtree Limited",
        "signal_type": "BULK_DEAL",
        "trigger_time": "2024-08-20T11:30:00",
        "raw_data": {
            "client": "Larsen and Toubro Limited (Promoter)",
            "buy_sell": "BUY",
            "quantity": 2200000,
            "price": 5840.00,
            "pct_of_volume": 1.4,
            "pattern": "BULK_DEAL"
        }
    },
    {
        "symbol": "BAJFINANCE",
        "company_name": "Bajaj Finance Limited",
        "signal_type": "OVERSOLD_RSI",
        "trigger_time": "2024-10-28T13:20:00",
        "raw_data": {
            "rsi": 31.5,
            "price": 6890,
            "sma_200": 7240,
            "pct_below_sma200": -4.8,
            "macd_signal": "bullish_cross_forming",
            "pattern": "oversold_rsi"
        }
    },
    {
        "symbol": "RELIANCE",
        "company_name": "Reliance Industries Limited",
        "signal_type": "GOLDEN_CROSS",
        "trigger_time": "2024-07-15T10:00:00",
        "raw_data": {
            "sma_50": 2910.40,
            "sma_200": 2905.80,
            "crossover": "sma50_above_sma200",
            "volume": 8900000,
            "confirmation": "high_volume",
            "pattern": "golden_cross"
        }
    }
]


async def seed():
    """Seed the database with demo signals and AI analysis."""
    print("🌱 NiveshAI Demo Seed Starting...")
    print("=" * 50)

    # Initialize DB
    init_db()

    # Clear existing signals
    conn = get_db()
    conn.execute("DELETE FROM signals")
    conn.commit()
    conn.close()
    print("✓ Cleared existing signals")

    # Import agents
    from agents.context_fetcher import enrich_signal
    from agents.synthesis_agent import synthesize_signal, _fallback_analysis

    for i, signal_def in enumerate(DEMO_SIGNALS, 1):
        symbol = signal_def["symbol"]
        signal_type = signal_def["signal_type"]
        print(f"\n[{i}/8] Seeding {symbol} - {signal_type}...")

        # Insert signal
        signal_id = insert_signal(
            symbol=symbol,
            company_name=signal_def["company_name"],
            signal_type=signal_type,
            trigger_time=signal_def["trigger_time"],
            raw_data=signal_def["raw_data"],
            status="new"
        )

        try:
            # Try to get real context (with timeout)
            enriched = await asyncio.wait_for(
                enrich_signal(symbol, signal_type, signal_def["raw_data"]),
                timeout=30
            )

            fundamentals = enriched.get("fundamentals", {})
            technicals = enriched.get("technicals", {})
            news = enriched.get("news", [])
            historical = enriched.get("historical_success", {})

        except Exception as e:
            print(f"  ⚠ Context fetch error (using fallback): {e}")
            fundamentals = {}
            technicals = {"current_price": signal_def["raw_data"].get("price", 0)}
            news = []
            historical = {}

        try:
            # Try Gemini synthesis
            analysis = await asyncio.wait_for(
                synthesize_signal(
                    signal_id=signal_id,
                    symbol=symbol,
                    signal_type=signal_type,
                    raw_data=signal_def["raw_data"],
                    fundamentals=fundamentals,
                    technicals=technicals,
                    news_items=news,
                    historical_success=historical,
                ),
                timeout=30
            )
        except Exception as e:
            print(f"  ⚠ Gemini error (using fallback): {e}")
            analysis = _fallback_analysis(symbol, signal_type, technicals)

        # Update DB with analysis
        update_signal_analysis(
            signal_id=signal_id,
            ai_analysis=analysis,
            signal_strength=analysis.get("signal_strength", "Moderate"),
            confidence_score=analysis.get("confidence_score", 65),
        )

        print(f"  ✓ Seeded {symbol} - {signal_type} (confidence: {analysis.get('confidence_score')})")

    print("\n" + "=" * 50)
    print("✅ Demo seed complete! 8 signals loaded into signals.db")

    # Verify
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]
    processed = conn.execute("SELECT COUNT(*) FROM signals WHERE status='processed'").fetchone()[0]
    conn.close()
    print(f"   Total signals: {count}")
    print(f"   With AI analysis: {processed}")
    print("\n🚀 Ready for demo!")


if __name__ == "__main__":
    asyncio.run(seed())
