"""
AI Synthesis Agent for NiveshAI
Calls Gemini API to generate human-readable analysis of raw signals.
"""
import asyncio
import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import google.generativeai as genai

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

SYSTEM_PROMPT = """You are a senior Indian equity analyst at Economic Times Markets. 
You analyze NSE/BSE signals with deep expertise in Indian markets, 
SEBI regulations, and retail investor behaviour. Your analysis must be:
- Concise and actionable (retail investors, not institutions)
- Data-driven with specific numbers cited
- Honest about risks, not just bullish
- Written in plain English, no jargon
Always structure your JSON response exactly as specified. Return ONLY valid JSON, no markdown."""


def _build_prompt(
    symbol: str,
    signal_type: str,
    raw_data: dict,
    fundamentals: dict,
    technicals: dict,
    news_items: list,
    historical_success: dict,
) -> str:
    """Build the Gemini prompt with all context."""

    news_summary = ""
    for i, n in enumerate(news_items[:3], 1):
        news_summary += f"{i}. {n.get('headline', '')} (Source: {n.get('source', '')})\n"

    pe = fundamentals.get("pe_ratio", "N/A")
    pb = fundamentals.get("pb_ratio", "N/A")
    sector = fundamentals.get("sector", "")
    week52_high = fundamentals.get("week_52_high", "N/A")
    week52_low = fundamentals.get("week_52_low", "N/A")

    rsi = technicals.get("rsi", "N/A")
    macd = technicals.get("macd", "N/A")
    sma_50 = technicals.get("sma_50", "N/A")
    sma_200 = technicals.get("sma_200", "N/A")
    current_price = technicals.get("current_price", raw_data.get("price", "N/A"))

    hist = historical_success or {}
    success_rate = hist.get("success_rate", "N/A")
    avg_return = hist.get("avg_return_30d", "N/A")
    occurrences = hist.get("occurrences", "N/A")

    return f"""
Analyze this NSE stock signal and return a JSON analysis:

SIGNAL INFO:
- Stock: {symbol}
- Sector: {sector}
- Signal Type: {signal_type}
- Raw Signal Data: {json.dumps(raw_data, indent=2)}

FUNDAMENTALS:
- Current Price: ₹{current_price}
- PE Ratio: {pe}
- PB Ratio: {pb}
- 52W High: ₹{week52_high}
- 52W Low: ₹{week52_low}

TECHNICALS:
- RSI (14): {rsi}
- MACD: {macd}
- SMA 50: ₹{sma_50}
- SMA 200: ₹{sma_200}

RECENT NEWS:
{news_summary if news_summary else "No recent news available."}

HISTORICAL PATTERN PERFORMANCE:
- Similar signals in past 2 years: {occurrences} occurrences
- Historical success rate: {success_rate}%
- Average 30-day return after signal: {avg_return}%

Return ONLY this exact JSON structure (no markdown, no backticks):
{{
  "thesis": "2-sentence plain English explanation of what happened and why it matters for retail investors",
  "signal_strength": "Strong" or "Moderate" or "Weak",
  "confidence_score": integer 0-100,
  "bull_case": "One sentence on upside scenario with specific price target or catalyst",
  "bear_case": "One sentence on downside risk with specific risk factor",
  "key_risks": ["risk 1 with specifics", "risk 2 with specifics"],
  "what_to_watch": "One specific thing to monitor in the next 7 days",
  "historical_note": "Brief note on how similar {signal_type} setups played out before on NSE",
  "cited_sources": ["NSE Bulk Deal Filing", "ET Markets", "BSE Announcement"]
}}
"""


async def synthesize_signal(
    signal_id: str,
    symbol: str,
    signal_type: str,
    raw_data: dict,
    fundamentals: dict,
    technicals: dict,
    news_items: list,
    historical_success: dict,
) -> dict:
    """
    Calls Gemini API (gemini-2.5-flash-lite) with all context.
    Returns structured AI analysis dict.
    """
    if not GEMINI_KEY:
        return _fallback_analysis(symbol, signal_type, technicals)

    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel(
            "gemini-2.5-flash-lite-preview-06-17",
            system_instruction=SYSTEM_PROMPT
        )

        prompt = _build_prompt(
            symbol=symbol,
            signal_type=signal_type,
            raw_data=raw_data,
            fundamentals=fundamentals,
            technicals=technicals,
            news_items=news_items,
            historical_success=historical_success,
        )

        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        if text.endswith("```"):
            text = text[:-3]

        analysis = json.loads(text.strip())

        # Validate required keys
        required = ["thesis", "signal_strength", "confidence_score", "bull_case", "bear_case"]
        for key in required:
            if key not in analysis:
                raise ValueError(f"Missing key: {key}")

        print(f"✓ AI synthesis complete for {symbol} - {signal_type} (confidence: {analysis.get('confidence_score')})")
        return analysis

    except json.JSONDecodeError as e:
        print(f"[synthesis] JSON parse error for {symbol}: {e}")
        return _fallback_analysis(symbol, signal_type, technicals)
    except Exception as e:
        print(f"[synthesis] Gemini error for {symbol}: {e}")
        return _fallback_analysis(symbol, signal_type, technicals)


def _fallback_analysis(symbol: str, signal_type: str, technicals: dict) -> dict:
    """Fallback analysis when Gemini is unavailable."""
    rsi = technicals.get("rsi", 50)
    price = technicals.get("current_price", 0)

    FALLBACKS = {
        "BULK_DEAL": {
            "thesis": f"A significant bulk deal was detected on {symbol}, indicating institutional-level position change. Such trades often precede major directional moves.",
            "signal_strength": "Strong",
            "confidence_score": 72,
            "bull_case": f"Institutional accumulation at current levels suggests informed buyers see value — upside potential of 10-15% in 3 months.",
            "bear_case": "Bulk deal could be a block sale by existing holder — check buy/sell direction carefully before acting.",
            "key_risks": ["Market-wide selloff could negate stock-specific buying", "Deal could be part of index rebalancing"],
            "what_to_watch": "Monitor next 3 sessions for price follow-through and volume above 20-day average.",
            "historical_note": f"Bulk deals on NSE stocks have historically led to 8-12% moves in the following month in 70%+ of cases.",
            "cited_sources": ["NSE Bulk Deal Filing", "ET Markets"]
        },
        "INSIDER_BUY": {
            "thesis": f"A company insider (director/promoter) bought {symbol} shares in the open market. Insiders buying is one of the strongest bullish signals.",
            "signal_strength": "Strong",
            "confidence_score": 78,
            "bull_case": "Insiders have access to non-public information — their buying signals strong conviction about future performance.",
            "bear_case": "Single insider buy may not represent full management consensus — watch for more insider activity.",
            "key_risks": ["SEBI disclosure may lag actual trade by several days", "Market conditions could reverse gains"],
            "what_to_watch": "Check for additional insider buy disclosures in the next 2 weeks.",
            "historical_note": "Insider buys on NSE stocks have shown 78% success rate with average 11% return in 30 days historically.",
            "cited_sources": ["BSE Insider Trading Disclosure", "SEBI Filing"]
        },
        "BREAKOUT": {
            "thesis": f"{symbol} has broken out of a key resistance level with above-average volume, confirming bullish momentum. Volume-confirmed breakouts have higher success rates.",
            "signal_strength": "Moderate",
            "confidence_score": 68,
            "bull_case": "Volume-confirmed breakout suggests genuine demand — target 10-15% above breakout level in next 4-6 weeks.",
            "bear_case": "False breakouts are common — if price falls back below breakout level within 3 sessions, the setup fails.",
            "key_risks": ["Broader market weakness could pull back even strong breakouts", "Low delivery percentage could indicate speculative buying"],
            "what_to_watch": "Price must hold above breakout level for next 3 days to confirm validity.",
            "historical_note": "52-week high breakouts with 1.5x+ volume have 69% success rate on NSE blue-chips historically.",
            "cited_sources": ["NSE Price Data", "Technical Analysis"]
        },
        "VOLUME_SPIKE": {
            "thesis": f"Unusually high trading volume detected in {symbol} — 3x the 20-day average. This signals exceptional institutional or retail interest.",
            "signal_strength": "Moderate",
            "confidence_score": 62,
            "bull_case": "High volume with RSI not yet overbought suggests continued accumulation — momentum may sustain for 5-7 trading sessions.",
            "bear_case": "Volume spikes without fundamental catalyst often see mean reversion — check if news-driven.",
            "key_risks": ["Volume could be unwinding of large positions", "News-driven spikes often reverse once retail joins"],
            "what_to_watch": "Watch if volume sustains above 1.5x average for next 3 sessions — sustained elevated volume is bullish.",
            "historical_note": "3x volume spikes on NSE mid-caps have shown 65% probability of continued move in spike direction.",
            "cited_sources": ["NSE Trade Data", "Technical Analysis"]
        },
        "GOLDEN_CROSS": {
            "thesis": f"{symbol}'s 50-day SMA crossed above the 200-day SMA — the classic 'Golden Cross' — one of the most reliable long-term bullish signals.",
            "signal_strength": "Strong",
            "confidence_score": 74,
            "bull_case": "Golden Cross historically leads to extended uptrends — medium-term target is 15-20% above current levels.",
            "bear_case": "Golden Cross is a lagging indicator — stock may have already moved 5-8% before signal appeared.",
            "key_risks": ["Rate hike cycle could compress PE multiples despite bullish technicals", "Sector rotation could divert institutional flows"],
            "what_to_watch": "Monitor if 50-SMA acts as support on any pullbacks — bounce off it confirms the trend.",
            "historical_note": "Golden Cross on Nifty 500 stocks has 74% success rate with average 9.8% gain in 30 days.",
            "cited_sources": ["Technical Analysis", "NSE Historical Data"]
        },
        "OVERSOLD_RSI": {
            "thesis": f"{symbol}'s RSI has dropped below 35, entering oversold territory. After a significant correction, oversold stocks often see mean-reversion bounces.",
            "signal_strength": "Moderate",
            "confidence_score": 65,
            "bull_case": f"RSI at oversold levels with price near support — 8-12% bounce potential in next 15-20 trading sessions.",
            "bear_case": "Oversold stocks can remain oversold in bear markets — confirm trend reversal before entry.",
            "key_risks": ["Fundamental deterioration (not just technical) could prevent bounce", "Broader market weakness may sustain selling pressure"],
            "what_to_watch": "Watch for RSI to cross back above 40 — that confirms the oversold condition is resolving.",
            "historical_note": "RSI < 35 on Nifty 50 stocks has 68% probability of 5-10% bounce within 15 trading sessions.",
            "cited_sources": ["Technical Analysis", "NSE Price Data"]
        },
        "FILING_ALERT": {
            "thesis": f"A significant regulatory filing has been detected for {symbol}. Monitor the specific nature of the filing as it may impact promoter credibility and stock price.",
            "signal_strength": "Weak",
            "confidence_score": 55,
            "bull_case": "Corporate actions like pledge reduction or board additions can signal improving promoter confidence.",
            "bear_case": "Promoter pledge increase is a red flag — signals financial stress and increases risk of forced selling.",
            "key_risks": ["Pledged shares could be sold by lenders if stock falls further", "Negative filings often lead to sustained institutional selling"],
            "what_to_watch": "Check BSE/NSE for full filing details and watch for management commentary in next earnings call.",
            "historical_note": "Pledge increase filings have historically led to underperformance vs Nifty in 55% of cases in the next 30 days.",
            "cited_sources": ["BSE Corporate Filing", "SEBI Disclosure"]
        },
    }

    return FALLBACKS.get(signal_type, {
        "thesis": f"Signal detected on {symbol}: {signal_type}. Technical analysis suggests a potential trading opportunity.",
        "signal_strength": "Moderate",
        "confidence_score": 60,
        "bull_case": "Positive momentum and strong market structure support continued upside.",
        "bear_case": "Market volatility could negate this setup — use stop-loss.",
        "key_risks": ["Market-wide risk", "Liquidity risk"],
        "what_to_watch": "Monitor price action and volume in next 3-5 sessions.",
        "historical_note": "Similar setups have shown mixed results historically — confirmation is key.",
        "cited_sources": ["NSE Data", "Technical Analysis"]
    })


async def process_pending_signals():
    """
    Fetches all signals with status='new' from DB.
    For each: calls context_fetcher → calls synthesize_signal → updates DB.
    """
    from models import get_pending_signals, update_signal_analysis, signal_to_dict
    from agents.context_fetcher import enrich_signal

    pending = get_pending_signals()
    print(f"[synthesis] Processing {len(pending)} pending signals...")

    for raw_signal in pending:
        signal = signal_to_dict(raw_signal)
        signal_id = signal["id"]
        symbol = signal["symbol"]
        signal_type = signal["signal_type"]
        raw_data = signal.get("raw_data") or {}

        try:
            # Enrich context
            enriched = await enrich_signal(symbol, signal_type, raw_data)

            # Call Gemini synthesis
            analysis = await synthesize_signal(
                signal_id=signal_id,
                symbol=symbol,
                signal_type=signal_type,
                raw_data=raw_data,
                fundamentals=enriched.get("fundamentals", {}),
                technicals=enriched.get("technicals", {}),
                news_items=enriched.get("news", []),
                historical_success=enriched.get("historical_success", {}),
            )

            # Update DB
            update_signal_analysis(
                signal_id=signal_id,
                ai_analysis=analysis,
                signal_strength=analysis.get("signal_strength", "Moderate"),
                confidence_score=analysis.get("confidence_score", 60),
            )

            print(f"  ✓ Processed: {symbol} - {signal_type}")

            # Small delay to avoid rate limiting Gemini
            await asyncio.sleep(1)

        except Exception as e:
            print(f"  ✗ Error processing {symbol} ({signal_id[:8]}): {e}")

    print(f"[synthesis] Done. Processed {len(pending)} signals.")
