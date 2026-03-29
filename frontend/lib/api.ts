/**
 * NiveshAI API Client
 * All backend API calls centralized here
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── Signals ────────────────────────────────────────────────────────────────
export const getSignals = () => apiFetch<Signal[]>('/api/signals');
export const getSignalsBySymbol = (symbol: string) => apiFetch<Signal[]>(`/api/signals/${symbol}`);
export const getSignalsByType = (type: string) => apiFetch<Signal[]>(`/api/signals/type/${type}`);
export const dismissSignal = (id: string) =>
  apiFetch(`/api/signals/${id}/dismiss`, { method: 'POST' });
export const getMarketBrief = () => apiFetch<MarketBrief>('/api/market-brief');

// ─── Stocks ─────────────────────────────────────────────────────────────────
export const getIndices = () => apiFetch<Indices>('/api/stocks/indices');
export const getOHLCV = (symbol: string, period = '6mo', interval = '1d') =>
  apiFetch<OHLCV[]>(`/api/stocks/ohlcv/${symbol}?period=${period}&interval=${interval}`);
export const getQuote = (symbol: string) => apiFetch<Quote>(`/api/stocks/quote/${symbol}`);
export const getFundamentals = (symbol: string) =>
  apiFetch<Fundamentals>(`/api/stocks/fundamentals/${symbol}`);
export const getStockNews = (symbol: string) =>
  apiFetch<NewsItem[]>(`/api/stocks/news/${symbol}`);
export const getFinancials = (symbol: string) =>
  apiFetch<Financials>(`/api/stocks/financials/${symbol}`);
export const getShareholding = (symbol: string) =>
  apiFetch<Shareholding>(`/api/stocks/shareholding/${symbol}`);
export const searchStocks = (q: string) =>
  apiFetch<StockSearchResult[]>(`/api/stocks/search?q=${encodeURIComponent(q)}`);
export const getGainers = () => apiFetch<Mover[]>('/api/stocks/gainers');
export const getLosers = () => apiFetch<Mover[]>('/api/stocks/losers');
export const testSymbol = (symbol: string) =>
  apiFetch<Record<string, unknown>>(`/api/test/${symbol}`);

// ─── Portfolio ───────────────────────────────────────────────────────────────
export const getPortfolio = () => apiFetch<PortfolioHolding[]>('/api/portfolio');
export const getPortfolioSignals = (holdings: string) =>
  apiFetch<Signal[]>(`/api/portfolio/signals?holdings=${holdings}`);

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Signal {
  id: string;
  symbol: string;
  company_name: string;
  signal_type: 'BULK_DEAL' | 'INSIDER_BUY' | 'BREAKOUT' | 'VOLUME_SPIKE' | 'FILING_ALERT' | 'GOLDEN_CROSS' | 'OVERSOLD_RSI';
  trigger_time: string;
  raw_data: Record<string, unknown>;
  ai_analysis?: AIAnalysis;
  signal_strength?: 'Strong' | 'Moderate' | 'Weak';
  confidence_score?: number;
  status: 'new' | 'processed' | 'dismissed';
}

export interface AIAnalysis {
  thesis: string;
  signal_strength: string;
  confidence_score: number;
  bull_case: string;
  bear_case: string;
  key_risks: string[];
  what_to_watch: string;
  historical_note: string;
  cited_sources: string[];
}

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  prev_close: number;
  high: number;
  low: number;
  week52_high: number;
  week52_low: number;
  delivery_pct: number;
}

export interface Fundamentals {
  symbol: string;
  pe_ratio?: number;
  pb_ratio?: number;
  roe?: number;
  market_cap?: number;
  sector?: string;
  industry?: string;
  week_52_high?: number;
  week_52_low?: number;
  current_price?: number;
  company_name?: string;
  beta?: number;
  dividend_yield?: number;
}

export interface Indices {
  nifty50?: { value: number; change: number; change_pct: number };
  sensex?: { value: number; change: number; change_pct: number };
  bank_nifty?: { value: number; change: number; change_pct: number };
}

export interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  source: string;
  datetime: string;
  sentiment_score: number;
}

export interface Financials {
  symbol: string;
  quarters: string[];
  revenue: number[];
  net_profit: number[];
}

export interface Shareholding {
  symbol: string;
  dates: string[];
  promoter: number[];
  fii: number[];
  dii: number[];
  public: number[];
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  sector: string;
}

export interface Mover {
  symbol: string;
  company: string;
  price: number;
  change_pct: number;
}

export interface PortfolioHolding {
  symbol: string;
  company_name?: string;
  qty: number;
  avg_price: number;
}

export interface MarketBrief {
  bullets: string[];
  generated_at: string;
  cached: boolean;
}
