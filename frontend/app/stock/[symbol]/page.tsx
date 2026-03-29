'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { LeftToolbar } from '@/components/layout/LeftToolbar';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { SignalCard, SignalCardSkeleton } from '@/components/signals/SignalCard';
import { getOHLCV, getFundamentals, getQuote, getStockNews, getSignalsBySymbol } from '@/lib/api';
import type { OHLCV, Fundamentals, Quote, NewsItem, Signal } from '@/lib/api';

const PERIODS = ['1D', '5D', '1M', '3M', '6M', '1Y'];
const PERIOD_MAP: Record<string, { period: string; interval: string }> = {
  '1D': { period: '1d', interval: '5m' },
  '5D': { period: '5d', interval: '15m' },
  '1M': { period: '1mo', interval: '1d' },
  '3M': { period: '3mo', interval: '1d' },
  '6M': { period: '6mo', interval: '1d' },
  '1Y': { period: '1y', interval: '1d' },
};

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() ?? '';

  const [ohlcv, setOhlcv] = useState<OHLCV[]>([]);
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activePeriod, setActivePeriod] = useState('6M');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!symbol) return;
    Promise.all([
      getOHLCV(symbol, PERIOD_MAP['6M'].period, PERIOD_MAP['6M'].interval),
      getFundamentals(symbol),
      getQuote(symbol),
      getStockNews(symbol),
      getSignalsBySymbol(symbol),
    ]).then(([ohlcvData, fundData, quoteData, newsData, signalsData]) => {
      setOhlcv(ohlcvData);
      setFundamentals(fundData);
      setQuote(quoteData);
      setNews(newsData);
      setSignals(signalsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [symbol]);

  // Load TradingView Lightweight Charts
  useEffect(() => {
    if (!ohlcv.length || !chartRef.current) return;

    import('lightweight-charts').then(({ createChart, CrosshairMode, LineStyle, CandlestickSeries, HistogramSeries, LineSeries }) => {
      if (chartInstance.current) {
        (chartInstance.current as { remove: () => void }).remove();
      }

      const chart = createChart(chartRef.current!, {
        layout: {
          background: { color: '#131722' },
          textColor: '#787b86',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif',
        },
        grid: {
          vertLines: { color: '#1e222d', style: LineStyle.Solid },
          horzLines: { color: '#1e222d', style: LineStyle.Solid },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: '#434651', style: LineStyle.Dashed, width: 1 },
          horzLine: { color: '#434651', style: LineStyle.Dashed, width: 1 },
        },
        rightPriceScale: { borderColor: '#363a45' },
        timeScale: { borderColor: '#363a45', rightOffset: 5, barSpacing: 8 },
        width: chartRef.current!.clientWidth,
        height: 420,
      });

      chartInstance.current = chart;

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a', downColor: '#ef5350',
        borderUpColor: '#26a69a', borderDownColor: '#ef5350',
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });

      const candleData = ohlcv.map(d => ({
        time: d.date as `${number}-${number}-${number}`,
        open: d.open, high: d.high, low: d.low, close: d.close,
      }));
      candleSeries.setData(candleData);

      // Volume histogram
      const volSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

      volSeries.setData(ohlcv.map((d, i) => ({
        time: d.date as `${number}-${number}-${number}`,
        value: d.volume,
        color: i > 0 && d.close >= ohlcv[i - 1].close ? '#26a69a66' : '#ef535066',
      })));

      // EMA 20 — Yellow
      const ema20 = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, crosshairMarkerVisible: false, title: 'EMA 20' });
      const ema20Data = computeEMA(ohlcv, 20);
      ema20.setData(ema20Data.map((v, i) => ({
        time: ohlcv[i + 19].date as `${number}-${number}-${number}`, value: v
      })));

      // EMA 50 — Purple
      const ema50 = chart.addSeries(LineSeries, { color: '#7c3aed', lineWidth: 1, priceLineVisible: false, crosshairMarkerVisible: false, title: 'EMA 50' });
      const ema50Data = computeEMA(ohlcv, 50);
      if (ema50Data.length > 0) {
        ema50.setData(ema50Data.map((v, i) => ({
          time: ohlcv[i + 49].date as `${number}-${number}-${number}`, value: v
        })));
      }

      // Responsive resize
      const handleResize = () => {
        if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    });
  }, [ohlcv, signals]);

  const latestOHLCV = ohlcv[ohlcv.length - 1];
  const priceChange = quote ? quote.change : 0;
  const changePct = quote ? quote.change_pct : 0;
  const isPositive = changePct >= 0;
  const activeSignal = signals[0];

  const TABS = ['Overview', 'Financials', 'Shareholding', 'News'];

  return (
    <div style={{ background: '#131722', minHeight: '100vh' }}>
      <TopBar />
      <LeftToolbar />

      <div style={{ marginLeft: 56, marginTop: 48, marginRight: 320 }}>
        {/* Page header */}
        <div style={{
          background: '#131722', borderBottom: '1px solid #363a45',
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const,
        }}>
          <Link href="/dashboard" style={{ color: '#787b86', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={16} />
          </Link>
          <span style={{ fontSize: 16, color: '#d1d4dc', fontWeight: 600 }}>{symbol}</span>
          <span style={{
            fontSize: 12, color: '#787b86', background: '#2a2e39',
            padding: '2px 8px', borderRadius: 3,
          }}>NSE:{symbol}</span>

          {latestOHLCV && (
            <span style={{ fontSize: 12, color: '#787b86' }}>
              O{latestOHLCV.open.toFixed(2)}&nbsp;
              H{latestOHLCV.high.toFixed(2)}&nbsp;
              L{latestOHLCV.low.toFixed(2)}&nbsp;
              C{latestOHLCV.close.toFixed(2)}
            </span>
          )}

          {quote && (
            <span style={{ fontSize: 14, color: isPositive ? '#26a69a' : '#ef5350', fontWeight: 500 }}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button style={{ background: '#e53935', color: '#fff', fontSize: 13, padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer' }}>
              SELL ▼ {quote?.price.toFixed(2) ?? '—'}
            </button>
            <button style={{ background: '#1a73e8', color: '#fff', fontSize: 13, padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer' }}>
              BUY ▲
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0 }}>
          {/* Left: Chart */}
          <div>
            <div ref={chartRef} style={{ width: '100%', background: '#131722' }} />

            {/* Time range selector */}
            <div style={{
              height: 36, background: '#131722', borderTop: '1px solid #363a45',
              display: 'flex', alignItems: 'center', padding: '0 8px', gap: 2,
            }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => {
                  setActivePeriod(p);
                  const { period, interval } = PERIOD_MAP[p];
                  getOHLCV(symbol, period, interval).then(setOhlcv).catch(() => {});
                }} style={{
                  padding: '4px 10px', fontSize: 12, borderRadius: 3,
                  border: 'none', cursor: 'pointer', fontFamily: 'Inter',
                  color: activePeriod === p ? '#d1d4dc' : '#787b86',
                  background: activePeriod === p ? '#2a2e39' : 'transparent',
                  transition: 'all 150ms',
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Bottom tabs */}
            <div style={{
              height: 36, background: '#131722',
              borderTop: '1px solid #363a45', borderBottom: '1px solid #363a45',
              display: 'flex',
            }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '0 16px', fontSize: 13, height: 36,
                  display: 'flex', alignItems: 'center', cursor: 'pointer',
                  border: 'none', background: 'transparent', fontFamily: 'Inter',
                  color: activeTab === tab ? '#d1d4dc' : '#787b86',
                  borderBottom: `2px solid ${activeTab === tab ? '#2962ff' : 'transparent'}`,
                  transition: 'all 150ms',
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: 16, background: '#131722' }}>
              {activeTab === 'Overview' && fundamentals && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'PE Ratio', value: fundamentals.pe_ratio?.toFixed(1) ?? '—' },
                    { label: 'PB Ratio', value: fundamentals.pb_ratio?.toFixed(2) ?? '—' },
                    { label: 'Beta', value: fundamentals.beta?.toFixed(2) ?? '—' },
                    { label: 'Sector', value: fundamentals.sector ?? '—' },
                    { label: '52W High', value: `₹${fundamentals.week_52_high?.toFixed(0) ?? '—'}` },
                    { label: '52W Low', value: `₹${fundamentals.week_52_low?.toFixed(0) ?? '—'}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#2a2e39', borderRadius: 4, padding: 10 }}>
                      <div style={{ fontSize: 11, color: '#787b86' }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#d1d4dc', marginTop: 3 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'News' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {news.slice(0, 5).map((item, i) => (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                      background: '#1e222d', border: '1px solid #363a45', borderRadius: 8,
                      padding: 14, textDecoration: 'none', display: 'block',
                      transition: 'border-color 150ms',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#434651')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#363a45')}
                    >
                      <div style={{ fontSize: 14, color: '#d1d4dc', fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }}>
                        {item.headline}
                      </div>
                      <div style={{ fontSize: 12, color: '#787b86', lineHeight: 1.5, marginBottom: 8 }}>
                        {item.summary?.slice(0, 200)}{item.summary?.length > 200 ? '...' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#4c525e' }}>
                        <span>{item.source}</span>
                        <span>·</span>
                        <span>{new Date(item.datetime).toLocaleDateString('en-IN')}</span>
                      </div>
                    </a>
                  ))}
                  {news.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#787b86' }}>No news available</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Analysis panel */}
          <div style={{ background: '#1e222d', borderLeft: '1px solid #363a45', overflowY: 'auto' }}>
            {/* Active signals */}
            <div style={{ padding: 16, borderBottom: '1px solid #363a45' }}>
              <div style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500, marginBottom: 12 }}>
                Active Signals ({signals.length})
              </div>
              {signals.length === 0 && (
                <div style={{ fontSize: 12, color: '#787b86' }}>No active signals for {symbol}</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {signals.map((s, i) => <SignalCard key={s.id} signal={s} index={i} />)}
              </div>
            </div>

            {/* AI Analysis */}
            {activeSignal?.ai_analysis && (
              <div style={{ padding: 16, borderBottom: '1px solid #363a45' }}>
                <div style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500, marginBottom: 12 }}>
                  AI Analysis
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 28, color: '#d1d4dc', fontWeight: 600 }}>
                    {activeSignal.confidence_score}
                  </span>
                  <span style={{ fontSize: 14, color: '#787b86' }}>/100</span>
                </div>
                <div style={{ width: '100%', height: 3, background: '#2a2e39', borderRadius: 2, marginBottom: 12 }}>
                  <div style={{
                    width: `${activeSignal.confidence_score ?? 0}%`, height: '100%',
                    background: (activeSignal.confidence_score ?? 0) >= 70 ? '#26a69a' : '#f59e0b',
                    borderRadius: 2,
                  }} />
                </div>
                <p style={{ fontSize: 13, color: '#d1d4dc', lineHeight: 1.6, marginBottom: 12 }}>
                  {activeSignal.ai_analysis.thesis}
                </p>
                <div style={{
                  background: '#0d1a4a', borderLeft: '2px solid #2962ff',
                  padding: '10px 12px', borderRadius: '0 4px 4px 0',
                  fontSize: 12, color: '#d1d4dc', marginBottom: 12, lineHeight: 1.5,
                }}>
                  <span style={{ color: '#787b86', fontSize: 11 }}>WATCH: </span>
                  {activeSignal.ai_analysis.what_to_watch}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                  {activeSignal.ai_analysis.cited_sources?.map((src, i) => (
                    <span key={i} style={{
                      fontSize: 10, color: '#2962ff', background: '#0d1a4a',
                      padding: '2px 7px', borderRadius: 3,
                    }}>{src}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Key stats */}
            {fundamentals && quote && (
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500, marginBottom: 12 }}>
                  Key Stats
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'CMP', value: `₹${quote.price.toFixed(2)}` },
                    { label: 'Volume', value: (quote.volume / 1e6).toFixed(1) + 'M' },
                    { label: '52W High', value: `₹${quote.week52_high?.toFixed(0) ?? '—'}` },
                    { label: '52W Low', value: `₹${quote.week52_low?.toFixed(0) ?? '—'}` },
                    { label: 'PE Ratio', value: fundamentals.pe_ratio?.toFixed(1) ?? '—' },
                    { label: 'Sector', value: fundamentals.sector ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#2a2e39', borderRadius: 4, padding: 10 }}>
                      <div style={{ fontSize: 11, color: '#787b86' }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#d1d4dc', marginTop: 3 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right watchlist panel — reuse for stock page */}
      <div style={{
        position: 'fixed', right: 0, top: 48, width: 320,
        height: 'calc(100vh - 48px)', background: '#131722',
        borderLeft: '1px solid #363a45', overflowY: 'auto', zIndex: 40,
      }}>
        {fundamentals && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 16, color: '#d1d4dc', fontWeight: 600, marginBottom: 4 }}>
              {fundamentals.company_name ?? symbol}
            </div>
            {fundamentals.sector && (
              <div style={{ fontSize: 12, color: '#787b86', marginBottom: 12 }}>{fundamentals.sector}</div>
            )}
            {quote && (
              <>
                <div style={{ fontSize: 28, color: '#d1d4dc', fontWeight: 600, marginBottom: 4 }}>
                  ₹{quote.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 14, color: isPositive ? '#26a69a' : '#ef5350', marginBottom: 12 }}>
                  {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.change_pct.toFixed(2)}%)
                </div>
              </>
            )}
            {(fundamentals as Fundamentals & { description?: string }).description && (
              <p style={{ fontSize: 12, color: '#787b86', lineHeight: 1.6 }}>
                {(fundamentals as Fundamentals & { description?: string }).description?.slice(0, 300)}...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function computeEMA(data: OHLCV[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  let ema = data.slice(0, period).reduce((sum, d) => sum + d.close, 0) / period;
  result.push(ema);
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}
