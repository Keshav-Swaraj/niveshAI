# NIVESHAI — Complete Build Guide for Antigravity IDE
> AI-powered stock market signal intelligence platform for Indian retail investors
> ET AI Hackathon 2026 · Problem Statement 6

---

## API KEYS — Get These First Before Building

### Required API Keys (Must Have)

| API | Where to Get | Free Tier | What It's For |
|-----|-------------|-----------|---------------|
| **Google Gemini** | aistudio.google.com | 1,000 free requests/day (Flash-Lite) | Signal synthesis, AI chat agent, portfolio analysis |
| **Finnhub** | finnhub.io/register | 60 calls/min free | Company news (ET articles included), sentiment, earnings calendar |
| **Alpha Vantage** | alphavantage.co/support | 25 calls/day free | Pre-calculated technical indicators (RSI, MACD, Bollinger Bands) |

### Zero-Key APIs (No Signup Needed)

| API / Library | Install | What It's For |
|--------------|---------|---------------|
| **yfinance** | `pip install yfinance` | OHLCV history, fundamentals, financials for any NSE stock (use RELIANCE.NS format) |
| **nse-python** | `pip install nse` | Live NSE quotes, bulk deals, block deals, corporate actions, option chains |
| **pandas-ta** | `pip install pandas-ta` | 130+ technical indicators calculated locally — no API calls, no rate limits |
| **NSE Website** | Direct HTTP fetch | Bulk deals CSV, insider trade disclosures — published daily, free to download |
| **BSE Website** | Direct HTTP fetch | Corporate filings, quarterly results, shareholding patterns, board meeting outcomes |
| **ET RSS Feeds** | Direct HTTP fetch | Official ET Markets RSS — no auth, near-real-time headlines |

### Additional Free APIs (Add These for Extra Edge)

| API | Where to Get | Free Tier | What It Adds |
|-----|-------------|-----------|--------------|
| **Marketaux** | marketaux.com | 100 requests/day free | Financial news with sentiment scores per article — adds bullish/bearish signal to news |
| **Twelve Data** | twelvedata.com | 800 requests/day free | Indian stocks OHLCV + 100+ technical indicators, better rate limits than Alpha Vantage |
| **NewsData.io** | newsdata.io | 200 requests/day free | India-specific financial news, 8 years historical, multi-language including Hindi |
| **stock-nse-india (npm)** | `npm install stock-nse-india` | Free, open source | Frontend-side NSE data fetching — live quotes, gainers/losers, indices |
| **Open Exchange Rates** | openexchangerates.org | 1,000 calls/month free | USD/INR rate for FII flow context |
| **RBI Data Warehouse** | rbi.org.in/Scripts/Statistics | Free public data | RBI policy rates, inflation data — for macro context in AI analysis |

---

## TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend Framework | Next.js 14 (App Router) + TypeScript | Animated landing page, API routes, fast SSR, free Vercel deploy |
| Styling | Tailwind CSS + shadcn/ui | Pre-built dark-mode components, saves 8+ hours of UI work |
| Animations | Framer Motion | Page transitions, signal card entrances, scroll animations |
| Stock Charts | TradingView Lightweight Charts v4 | Apache 2.0 open source, exact TradingView look |
| Data Charts | Recharts | Donut, bar, line charts for portfolio and financials pages |
| Backend | Python 3.11 + FastAPI | AI agents, data fetchers, WebSocket server |
| Real-time | FastAPI WebSockets (native) | Instant signal feed updates |
| Scheduling | Inngest (free tier) | Durable cron jobs with retries, replaces APScheduler |
| Database | SQLite → Supabase free tier | Local dev → hosted demo |
| AI | Gemini API (gemini-2.5-flash-lite) | Signal synthesis, chat agent, portfolio analysis |
| Frontend Hosting | Vercel | One-click Next.js deploy, free tier |
| Backend Hosting | Railway | Free tier, handles FastAPI + WebSockets |

---

## PROJECT STRUCTURE

```
niveshai/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Animated landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Signal Dashboard
│   │   ├── radar/
│   │   │   └── page.tsx                # Opportunity Radar
│   │   ├── stock/
│   │   │   └── [symbol]/
│   │   │       └── page.tsx            # Stock Detail + Chart
│   │   ├── chat/
│   │   │   └── page.tsx                # AI Market Chat
│   │   ├── portfolio/
│   │   │   └── page.tsx                # My Portfolio
│   │   └── screener/
│   │       └── page.tsx                # Screener
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── signals/
│   │   │   ├── SignalCard.tsx
│   │   │   └── SignalFeed.tsx
│   │   ├── charts/
│   │   │   ├── CandlestickChart.tsx
│   │   │   └── MiniSparkline.tsx
│   │   └── ui/                         # shadcn components
│   ├── lib/
│   │   ├── api.ts
│   │   └── websocket.ts
│   └── hooks/
│       ├── useSignals.ts
│       └── usePortfolio.ts
├── backend/
│   ├── agents/
│   │   ├── signal_monitor.py
│   │   ├── context_fetcher.py
│   │   ├── synthesis_agent.py
│   │   └── chat_agent.py
│   ├── data/
│   │   ├── nse_fetcher.py
│   │   ├── yfinance_fetcher.py
│   │   ├── news_fetcher.py
│   │   └── technicals.py
│   ├── routes/
│   │   ├── signals.py
│   │   ├── stocks.py
│   │   ├── chat.py
│   │   └── portfolio.py
│   ├── models.py
│   ├── websocket_manager.py
│   ├── seed_demo.py
│   └── main.py
├── .env
├── .env.example
└── README.md
```

---

## TASKS — Build One by One in Antigravity

---

### TASK 1 — Project Scaffold
**Priority:** Critical · **Estimated Time:** 1 hour
**Run this first before anything else**

Create the full project scaffold for NiveshAI with this exact structure:

**Frontend (Next.js 14):**
- Init with: `npx create-next-app@latest frontend --typescript --tailwind --app`
- Install: `npm install framer-motion lightweight-charts recharts react-markdown lucide-react`
- Install shadcn/ui: `npx shadcn-ui@latest init` (choose dark theme, slate base colour)
- Install shadcn components: `npx shadcn-ui@latest add card badge button tabs dialog sheet`
- Set up global CSS with the TradingView colour variables listed in the theme section above
- Configure `tailwind.config.ts` to extend theme with custom colours matching TradingView dark

**Backend (FastAPI):**
- Create `backend/` folder with `main.py`
- Install: `pip install fastapi uvicorn httpx python-dotenv yfinance nse pandas pandas-ta google-generativeai finnhub-python inngest`
- Set up FastAPI app with CORS enabled for `http://localhost:3000`
- Add lifespan event that creates SQLite `signals.db` on startup
- Load all env vars from `.env` using python-dotenv
- Install Inngest CLI: `npm install -g inngest-cli` (for local dev server)

**Database (SQLite):**
Create `backend/models.py` with this Signal model using sqlite3:
```python
# Signals table schema
CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    company_name TEXT,
    signal_type TEXT NOT NULL,         -- BULK_DEAL, INSIDER_BUY, BREAKOUT, VOLUME_SPIKE, FILING_ALERT
    trigger_time TEXT NOT NULL,         -- ISO datetime string
    raw_data TEXT,                      -- JSON string
    enriched_data TEXT,                 -- JSON string  
    ai_analysis TEXT,                   -- JSON string from Gemini
    signal_strength TEXT,               -- Strong, Moderate, Weak
    confidence_score INTEGER,           -- 0-100
    status TEXT DEFAULT 'new'           -- new, processed, dismissed
)
```

**Verify:** Both `npm run dev` (port 3000) and `uvicorn main:app --reload` (port 8000) run without errors.

---

### TASK 2 — Data Pipeline: yfinance + NSE Fetchers
**Priority:** Critical · **Estimated Time:** 2 hours
**Do not start frontend until this task is working and tested**

Build `backend/data/yfinance_fetcher.py`:

```python
# Functions to implement:
get_ohlcv(symbol: str, period: str = "6mo", interval: str = "1d") -> list[dict]
# Auto-appends .NS suffix. Returns: [{date, open, high, low, close, volume}]

get_fundamentals(symbol: str) -> dict
# Returns: {pe_ratio, pb_ratio, roe, market_cap, debt_equity, revenue_growth, sector, industry, week_52_high, week_52_low}

get_financials(symbol: str) -> dict
# Returns last 8 quarters: {quarters: [str], revenue: [float], net_profit: [float]}

get_shareholding_history(symbol: str) -> dict
# Returns: {dates: [str], promoter: [float], fii: [float], dii: [float], public: [float]}
```

Build `backend/data/nse_fetcher.py`:

```python
# Functions to implement:
get_bulk_deals() -> list[dict]
# Fetches NSE bulk deals. Returns: [{symbol, client_name, buy_sell, quantity, price, pct_of_total_vol}]

get_live_quote(symbol: str) -> dict
# Returns: {price, change, change_pct, volume, prev_close, high, low, week52_high, week52_low, delivery_pct}

get_market_indices() -> dict
# Returns: {nifty50: {value, change, change_pct}, sensex: {value, change, change_pct}}

get_top_gainers() -> list[dict]
get_top_losers() -> list[dict]
# Each: [{symbol, company, price, change_pct}]

get_corporate_announcements(symbol: str) -> list[dict]
# Recent BSE/NSE filings: [{date, subject, description}]
```

Build `backend/data/news_fetcher.py`:

```python
# Functions to implement:
get_company_news(symbol: str) -> list[dict]
# Uses Finnhub. Returns: [{headline, summary, url, source, datetime, sentiment_score}]
# Also try Marketaux API as fallback for sentiment scores

get_market_news() -> list[dict]
# General Indian market news. Combine: Finnhub + ET RSS feed
# ET RSS feeds to use:
# https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms  (Markets)
# https://economictimes.indiatimes.com/prime/money-and-markets/rssfeeds/63407347.cms (Money)

parse_et_rss() -> list[dict]
# Parse ET RSS XML feeds using feedparser. Returns: [{title, summary, link, published}]
```

Build `backend/data/technicals.py`:

```python
# Functions to implement using pandas-ta:
calculate_indicators(ohlcv_df: pd.DataFrame) -> dict
# Returns: {rsi, macd, macd_signal, macd_hist, bb_upper, bb_middle, bb_lower, 
#           sma_50, sma_200, ema_20, volume_sma_20, atr}

detect_patterns(ohlcv_df: pd.DataFrame, fundamentals: dict) -> list[str]
# Returns list of triggered patterns from:
# oversold_rsi (RSI < 35)
# overbought_rsi (RSI > 70)
# golden_cross (SMA50 crosses above SMA200)
# death_cross (SMA50 crosses below SMA200)
# near_52w_low (within 5% of 52-week low)
# near_52w_high (within 2% of 52-week high)
# volume_spike_3x (volume > 3x 20-day average)
# above_sma200 (price above 200-day SMA)
# below_sma200 (price below 200-day SMA)
# breakout_52w (new 52-week high with volume > 1.5x average)
# macd_bullish_cross (MACD crosses above signal line)
# macd_bearish_cross (MACD crosses below signal line)

calculate_historical_success_rate(pattern: str, symbol: str) -> dict
# Look back 2 years of data, find all previous occurrences of this pattern on this stock
# Calculate: {occurrences: int, success_rate: float, avg_return_30d: float, description: str}
```

**Test endpoint — add to `backend/routes/stocks.py`:**
```
GET /api/test/{symbol}
```
Should return combined JSON from all 4 fetchers. Test with `RELIANCE`, `IREDA`, `ZOMATO`. If any fetcher fails, return empty dict for that section — never crash the whole endpoint.

---

### TASK 3 — Signal Monitor Agent
**Priority:** Critical · **Estimated Time:** 1.5 hours

Build `backend/agents/signal_monitor.py`:

This agent runs on a schedule and detects signals across the NSE universe.

```python
# Main function:
async def run_signal_monitor():
    """
    Runs every 60 minutes during market hours (9:15 AM - 3:30 PM IST).
    Uses Inngest for scheduling.
    
    Steps:
    1. Fetch today's bulk deals via nse_fetcher.get_bulk_deals()
    2. Filter deals where quantity > 0.5% of stock's average daily volume
    3. For each filtered deal, create a BULK_DEAL signal
    4. Fetch live quotes for watchlist stocks (RELIANCE, TCS, HDFCBANK, IREDA, 
       ZOMATO, DIXON, CDSL, NIFTY50, LTIM, BAJFINANCE)
    5. Run detect_patterns() on each watchlist stock
    6. For each triggered pattern, create appropriate signal
    7. Check for volume spikes (current volume vs 20-day average)
    8. Store all new signals in signals.db with status='new'
    9. Broadcast new signals via WebSocket to all connected clients
    """

# Signal creation helper:
def create_signal(symbol, signal_type, raw_data) -> str:
    # Returns signal_id after inserting into DB
    # signal_type options: BULK_DEAL, INSIDER_BUY, BREAKOUT, VOLUME_SPIKE, 
    #                      FILING_ALERT, GOLDEN_CROSS, OVERSOLD_RSI
```

Set up Inngest in `backend/main.py`:
- Run `run_signal_monitor()` every 60 minutes
- Only run between 9:00 AM and 4:00 PM IST on weekdays
- Run once immediately on startup to populate initial signals

---

### TASK 4 — AI Synthesis Agent
**Priority:** Critical · **Estimated Time:** 2 hours

Build `backend/agents/synthesis_agent.py`:

This agent takes a raw signal + enriched context and calls Gemini to generate a human-readable analysis.

```python
async def synthesize_signal(
    signal_id: str,
    symbol: str,
    signal_type: str,
    raw_data: dict,
    fundamentals: dict,
    technicals: dict,
    news_items: list[dict],
    historical_success: dict
) -> dict:
    """
    Calls Gemini API (gemini-2.5-flash-lite) with all context.
    
    System prompt:
    "You are a senior Indian equity analyst at Economic Times Markets. 
    You analyze NSE/BSE signals with deep expertise in Indian markets, 
    SEBI regulations, and retail investor behaviour. Your analysis must be:
    - Concise and actionable (retail investors, not institutions)
    - Data-driven with specific numbers cited
    - Honest about risks, not just bullish
    - Written in plain English, no jargon
    Always structure your JSON response exactly as specified."
    
    Returns JSON:
    {
        "thesis": "2-sentence plain English explanation of what happened and why it matters",
        "signal_strength": "Strong" | "Moderate" | "Weak",
        "confidence_score": 0-100,
        "bull_case": "One sentence on upside scenario",
        "bear_case": "One sentence on downside risk",
        "key_risks": ["risk 1", "risk 2"],
        "what_to_watch": "One thing to monitor in next 7 days",
        "historical_note": "Brief note on how similar setups played out before",
        "cited_sources": ["NSE Bulk Deal Filing", "ET Markets", "BSE Announcement"]
    }
    """

async def process_pending_signals():
    """
    Runs after signal_monitor. 
    Fetches all signals with status='new' from DB.
    For each: calls context_fetcher → calls synthesize_signal → updates DB.
    Updates signal status to 'processed'.
    """
```

Build `backend/agents/context_fetcher.py`:

```python
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
```

---

### TASK 5 — AI Chat Agent
**Priority:** Critical · **Estimated Time:** 2 hours

Build `backend/agents/chat_agent.py` and the chat route `backend/routes/chat.py`:

```python
# POST /api/chat
# Request body: {message: str, portfolio_holdings: list[dict], conversation_history: list[dict]}
# Response: {response: str, tools_used: list[str], sources: list[str]}

SYSTEM_PROMPT = """
You are NiveshAI AI — a senior Indian equity analyst and personal finance advisor.
You have access to real-time NSE/BSE market data, the user's portfolio, and ET Markets news.

Capabilities:
- Analyze specific stocks (price, technicals, fundamentals, signals, news)
- Portfolio-aware analysis (factor in user's holdings when giving advice)
- Explain bulk deals and insider trades in plain English
- Identify and explain chart patterns (cup & handle, head & shoulders, breakouts, etc.)
- Analyze macro events (RBI rate decisions, Budget, FII flows) and their portfolio impact

Response format rules:
- Use markdown headers and bullet points for complex answers
- Cite every data point inline: [Source: NSE Bulk Deals], [Source: ET Markets], [Source: BSE Filing]
- For portfolio questions, always reference the user's specific holdings
- Be direct — give a view, don't hedge everything
- If data is unavailable, say so clearly

Never:
- Make definitive buy/sell recommendations (you are not a SEBI registered advisor)
- Fabricate data — only use what tools return
- Give generic answers when portfolio context is available
"""

# Define these tools for Gemini function calling:
TOOLS = [
    {
        "name": "get_stock_data",
        "description": "Get comprehensive data for an NSE stock: live price, OHLCV history, fundamentals, technical indicators",
        "input_schema": {"symbol": "string (NSE symbol, e.g. RELIANCE)"}
    },
    {
        "name": "get_stock_news",
        "description": "Get latest news articles for a stock from ET Markets and Finnhub",
        "input_schema": {"symbol": "string", "limit": "integer (default 5)"}
    },
    {
        "name": "get_active_signals",
        "description": "Get all active signals for a stock from the NiveshAI radar",
        "input_schema": {"symbol": "string"}
    },
    {
        "name": "get_bulk_deals",
        "description": "Get today's bulk deals from NSE — who bought/sold what",
        "input_schema": {"symbol": "string (optional, leave empty for all deals today)"}
    },
    {
        "name": "detect_chart_pattern",
        "description": "Analyze OHLCV data to detect chart patterns like cup & handle, breakout, support/resistance",
        "input_schema": {"symbol": "string", "pattern": "string (optional, e.g. 'cup_and_handle')"}
    },
    {
        "name": "analyze_portfolio_impact",
        "description": "Given a macro event or news, analyze how it affects the user's specific portfolio holdings",
        "input_schema": {"event_description": "string", "holdings": "list of {symbol, qty, avg_price}"}
    },
    {
        "name": "get_macro_data",
        "description": "Get RBI policy rate, INR/USD rate, FII/DII net flows for macro context",
        "input_schema": {}
    }
]
```

The response must include `tools_used` — a list of tool names called during the response. The frontend uses this to render the "thinking trail" panel.

---

### TASK 6 — REST API Routes
**Priority:** High · **Estimated Time:** 1 hour

Build `backend/routes/signals.py`:
```
GET  /api/signals              → all signals, sorted by confidence_score DESC, limit 50
GET  /api/signals/{symbol}     → signals for one stock
GET  /api/signals/type/{type}  → filter by signal type
POST /api/signals/{id}/dismiss → mark signal as dismissed
GET  /api/market-brief         → Gemini-generated 3-bullet daily market summary (cached 1hr)
```

Build `backend/routes/stocks.py`:
```
GET  /api/stocks/indices        → Nifty50 + Sensex live values
GET  /api/stocks/ohlcv/{symbol} → OHLCV data, query params: period, interval
GET  /api/stocks/quote/{symbol} → Live quote
GET  /api/stocks/fundamentals/{symbol}
GET  /api/stocks/news/{symbol}
GET  /api/stocks/financials/{symbol}
GET  /api/stocks/shareholding/{symbol}
GET  /api/stocks/search?q=      → Search stocks by name or symbol
GET  /api/stocks/gainers
GET  /api/stocks/losers
```

Build `backend/routes/portfolio.py`:
```
GET  /api/portfolio/signals?holdings=RELIANCE,TCS,HDFCBANK → signals for held stocks only
POST /api/portfolio/analyze → Gemini analysis of the full portfolio (accepts holdings array)
```

Build `backend/routes/screener.py`:
```
GET  /api/screener?signal_types=BULK_DEAL,INSIDER_BUY&min_confidence=70&sector=Banking
```

---

### TASK 7 — WebSocket Manager
**Priority:** High · **Estimated Time:** 45 minutes

Build `backend/websocket_manager.py`:

```python
class WebSocketManager:
    """
    Manages all active WebSocket connections.
    When a new signal is processed, broadcasts to all connected clients.
    """
    
    # Methods:
    async def connect(websocket: WebSocket)
    async def disconnect(websocket: WebSocket)
    async def broadcast(message: dict)
    # message format: {type: "new_signal", data: signal_dict}

# WebSocket endpoint in main.py:
# WS /ws/signals
# Client connects → receives all current signals → receives live updates when new signals arrive
```

In frontend `frontend/lib/websocket.ts`:
```typescript
// Custom hook: useSignalWebSocket()
// Connects to ws://localhost:8000/ws/signals
// Manages reconnection with exponential backoff
// Exports: signals[], connectionStatus, lastUpdated
```

---

### TASK 8 — Seed Demo Data
**Priority:** Critical · **Estimated Time:** 1 hour
**Do this before building any frontend — you need realistic data to build against**

Build `backend/seed_demo.py`:

Pre-populate signals.db with 8 realistic signals based on real historical NSE events. For each signal, call the synthesis_agent to generate and store the AI analysis. This ensures demo loads instantly without API delays.

```python
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
            "pct_of_volume": 2.1
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
            "value_lakh": 335
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
            "pattern": "oversold_rsi"
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
            "volume_ratio": 2.5
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
            "total_pledged_pct": "4.2%"
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
            "pct_of_volume": 1.4
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
            "macd_signal": "bullish_cross_forming"
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
            "confirmation": "high_volume"
        }
    }
]

# For each signal above:
# 1. Insert into signals.db
# 2. Fetch fundamentals + news + technicals for that symbol/date
# 3. Call synthesis_agent.synthesize_signal() with all context
# 4. Store AI analysis back in signals.db
# 5. Print "Seeded signal: {symbol} - {signal_type} ✓"

# Also create a demo portfolio in a separate demo_portfolio.json file:
DEMO_PORTFOLIO = [
    {"symbol": "RELIANCE", "qty": 50, "avg_price": 2800},
    {"symbol": "TCS", "qty": 20, "avg_price": 3900},
    {"symbol": "HDFCBANK", "qty": 30, "avg_price": 1650},
    {"symbol": "IREDA", "qty": 200, "avg_price": 215},
    {"symbol": "ZOMATO", "qty": 100, "avg_price": 142},
    {"symbol": "CDSL", "qty": 15, "avg_price": 1340}
]
```

Run with: `python seed_demo.py`

---

### TASK 9 — Animated Landing Page
> 📄 See `DESIGN.md` for full design specifications of Tasks 9–17

---

### TASK 18 — Final Polish + Demo Readiness
**Priority:** Critical · **Estimated Time:** 1 hour
**Do this last, before recording demo video**

1. **Loading states:** Add skeleton loaders for all data-fetching sections. Never show empty content while loading — always show a shimmer skeleton matching the content layout.

2. **Error handling:** All API calls must have try/catch. If an API fails, show a muted `"Data unavailable"` message — never crash the page.

3. **Empty states:** Every list/feed must have a well-designed empty state with an icon and helpful message.

4. **Mobile responsive check:** Even though you're not building a mobile app, make sure the dashboard doesn't look broken on a laptop that's 1280px wide. Use `min-width: 1200px` as your target.

5. **Demo data verification:** Run `python seed_demo.py` one more time. Open every page and verify:
   - Dashboard shows 8 signal cards
   - Each signal card has AI thesis (not empty)
   - Stock detail chart loads for IREDA and RELIANCE
   - AI chat responds to `"Tell me about the IREDA bulk deal"` with cited answer
   - Portfolio page shows P&L correctly for demo holdings

6. **Performance:** The landing page animation must be smooth (60fps). Test on Chrome. If animation jank, reduce Framer Motion complexity.

7. **Vercel deploy:** Push to GitHub → connect to Vercel → deploy. Share the live URL in your hackathon submission.

8. **Railway deploy:** Push backend to Railway. Update `NEXT_PUBLIC_API_URL` on Vercel to point to Railway URL.

---

## 3-MINUTE DEMO SCRIPT

| Time | What to Show | What to Say |
|------|-------------|-------------|
| 0:00–0:20 | Landing page, typewriter animation | "India has 14 crore demat account holders. Every single one is flying blind — missing bulk deals, insider trades, and signals that institutions catch in milliseconds. This is NiveshAI." |
| 0:20–0:45 | Signal Dashboard | "Right now, 14 signals are active across 12 stocks. AI confidence scores. Real NSE data. Updated every hour during market hours." |
| 0:45–1:15 | IREDA stock detail + chart | "Click any signal — here's IREDA. Promoter bought 2.1% stake at ₹340. Signal marker on the chart shows exactly when. AI says: 78% historical success rate for this setup." |
| 1:15–2:00 | AI Chat with portfolio context ON | "Now with portfolio context on — I hold IREDA and HDFCBANK. Ask: 'Should I add more IREDA given today's bulk deal and the rate environment?' Watch it fetch data, check news, read the filing, synthesize everything. Cited. Structured. Portfolio-aware." |
| 2:00–2:30 | Portfolio page → Screener | "Portfolio page shows a red badge on HDFCBANK — pledge increase filed last night. Most investors found out this morning. NiveshAI users knew at 8 PM." → Screener: run 'Promoter Buy + Oversold'. 6 results. |
| 2:30–3:00 | Close | "This is not a screener. Not a chatbot. It's the intelligence layer between raw market data and Indian retail investors — living inside ET's trusted ecosystem. Thank you." |

---

## IMPACT MODEL (for Submission)

**Target audience:** 14 crore demat account holders in India

**Problem quantified:**
- Average retail investor misses 3–5 significant signals per month
- Each missed signal = potential 8–15% move on that stock
- On a ₹5 lakh portfolio, missing one 10% move = ₹50,000 opportunity cost

**NiveshAI impact:**
- Signal detection latency: from "next day news article" to "within 60 minutes of NSE filing"
- Time saved per investor per week: 4–6 hours of manual research replaced by AI synthesis
- % of investors currently with access to bulk deal + insider trade + AI synthesis tools: <2% (Bloomberg/institutional only)
- NiveshAI democratizes this to 100% of retail investors at zero cost

**ET business impact:**
- Average session time on ET Markets: ~4 minutes
- Estimated session time increase with NiveshAI: +12–18 minutes (signal feed is sticky)
- ET Prime conversion opportunity: position NiveshAI alerts as a premium feature → incremental subscription revenue
- Projected reach: 14 crore potential users through existing ET distribution

---

*Built for ET AI Hackathon 2026 · Problem Statement 6: AI for the Indian Investor*
*Stack: Next.js 14 · FastAPI · Gemini 2.5 Flash · TradingView Lightweight Charts · NSE/BSE Public Data*
