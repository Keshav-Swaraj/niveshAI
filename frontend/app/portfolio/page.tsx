'use client';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { LeftToolbar } from '@/components/layout/LeftToolbar';
import { RightPanel } from '@/components/layout/RightPanel';
import { SignalCard, SignalCardSkeleton } from '@/components/signals/SignalCard';
import { getPortfolio, getPortfolioSignals, getQuote } from '@/lib/api';
import type { PortfolioHolding, Signal, Quote } from '@/lib/api';
import { TrendingUp, TrendingDown, Briefcase } from 'lucide-react';

const DEMO_PRICES: Record<string, number> = {
  RELIANCE: 2847.50, TCS: 3920.00, HDFCBANK: 1620.00,
  IREDA: 340.00, ZOMATO: 180.50, CDSL: 1395.00,
};

interface HoldingWithPnL extends PortfolioHolding {
  cmp: number;
  current_value: number;
  invested: number;
  pnl: number;
  pnl_pct: number;
  change_today: number;
  change_today_pct: number;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<HoldingWithPnL[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    getPortfolio().then(async (raw) => {
      const enriched: HoldingWithPnL[] = await Promise.all(
        raw.map(async (h) => {
          let cmp = DEMO_PRICES[h.symbol] ?? h.avg_price * 1.05;
          try {
            const q = await getQuote(h.symbol);
            cmp = q.price;
          } catch {}

          const current_value = h.qty * cmp;
          const invested = h.qty * h.avg_price;
          const pnl = current_value - invested;
          const pnl_pct = (pnl / invested) * 100;

          return {
            ...h,
            cmp,
            current_value,
            invested,
            pnl,
            pnl_pct,
            change_today: cmp * 0.0122,
            change_today_pct: 1.22,
          };
        })
      );
      setHoldings(enriched);

      const symbolList = raw.map(h => h.symbol).join(',');
      getPortfolioSignals(symbolList).then(setSignals).catch(() => {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPct = (totalPnL / totalInvested) * 100;
  const isPositive = totalPnL >= 0;

  const analyzePortfolio = async () => {
    setAnalysisLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/portfolio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings: holdings.map(h => ({ symbol: h.symbol, qty: h.qty, avg_price: h.avg_price }))
        }),
      });
      if (resp.ok) {
        const data = await resp.json() as { analysis: string };
        setAnalysis(data.analysis);
      }
    } catch {}
    setAnalysisLoading(false);
  };

  const formatCrore = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ background: '#131722', minHeight: '100vh' }}>
      <TopBar />
      <LeftToolbar />
      <RightPanel />

      <div style={{ marginLeft: 56, marginRight: 320, marginTop: 48, padding: '20px 24px' }}>
        {/* Portfolio Summary Header */}
        <div style={{
          background: '#1e222d', border: '1px solid #363a45', borderRadius: 8,
          padding: 24, marginBottom: 20, display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr', gap: 24, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#787b86', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              Total Portfolio Value
            </div>
            <div style={{ fontSize: 32, color: '#d1d4dc', fontWeight: 600 }}>
              {loading ? '—' : formatCrore(totalCurrent)}
            </div>
            {!loading && (
              <div style={{ fontSize: 14, color: isPositive ? '#26a69a' : '#ef5350', marginTop: 4 }}>
                {isPositive ? '▲' : '▼'} {formatCrore(Math.abs(totalPnL))} ({isPositive ? '+' : ''}{totalPnLPct.toFixed(2)}%)
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#787b86', marginBottom: 4 }}>Invested</div>
              <div style={{ fontSize: 16, color: '#d1d4dc' }}>{loading ? '—' : formatCrore(totalInvested)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#787b86', marginBottom: 4 }}>1D P&L</div>
              <div style={{ fontSize: 16, color: '#26a69a' }}>
                {loading ? '—' : `+${formatCrore(totalCurrent * 0.012)}`}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={analyzePortfolio}
              disabled={analysisLoading || holdings.length === 0}
              style={{
                background: '#2962ff', color: '#fff', fontSize: 13,
                padding: '10px 20px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontFamily: 'Inter', fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <Briefcase size={14} />
              {analysisLoading ? 'Analyzing...' : 'AI Portfolio Analysis'}
            </button>
          </div>
        </div>

        {/* AI Analysis Result */}
        {analysis && (
          <div style={{
            background: '#0d1a4a', border: '1px solid #2962ff',
            borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 13, color: '#d1d4dc', lineHeight: 1.7,
          }}>
            <div style={{ fontSize: 11, color: '#2962ff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              AI Analysis · Powered by Gemini
            </div>
            <pre style={{ fontFamily: 'Inter', whiteSpace: 'pre-wrap', margin: 0 }}>{analysis}</pre>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          {/* Holdings Table */}
          <div style={{ background: '#1e222d', border: '1px solid #363a45', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              padding: '10px 16px', borderBottom: '1px solid #363a45',
              fontSize: 11, color: '#787b86', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <span>Stock</span>
              <span style={{ textAlign: 'right' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Avg Price</span>
              <span style={{ textAlign: 'right' }}>CMP</span>
              <span style={{ textAlign: 'right' }}>P&L</span>
              <span style={{ textAlign: 'right' }}>Return</span>
            </div>

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #1e222d' }}>
                  <div className="skeleton" style={{ width: '100%', height: 14 }} />
                </div>
              ))
            ) : holdings.map((h) => (
              <div key={h.symbol} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                padding: '14px 16px', borderBottom: '1px solid #1e222d',
                alignItems: 'center', transition: 'background 150ms',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2a2e39')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#2962ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff',
                    flexShrink: 0,
                  }}>
                    {h.symbol[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500 }}>{h.symbol}</div>
                    <div style={{ fontSize: 11, color: '#787b86' }}>NSE</div>
                  </div>
                </div>
                <span style={{ textAlign: 'right', fontSize: 13, color: '#d1d4dc' }}>{h.qty}</span>
                <span style={{ textAlign: 'right', fontSize: 13, color: '#d1d4dc' }}>₹{h.avg_price.toFixed(0)}</span>
                <span style={{ textAlign: 'right', fontSize: 13, color: '#d1d4dc' }}>₹{h.cmp.toFixed(0)}</span>
                <span style={{ textAlign: 'right', fontSize: 13, color: h.pnl >= 0 ? '#26a69a' : '#ef5350' }}>
                  {h.pnl >= 0 ? '+' : ''}₹{Math.abs(h.pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: h.pnl_pct >= 0 ? '#26a69a' : '#ef5350' }}>
                  {h.pnl_pct >= 0 ? '+' : ''}{h.pnl_pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Portfolio Signals */}
          <div>
            <div style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500, marginBottom: 10 }}>
              Signals for Holdings ({signals.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading
                ? Array.from({ length: 2 }).map((_, i) => <SignalCardSkeleton key={i} />)
                : signals.length === 0
                  ? (
                    <div style={{
                      background: '#1e222d', border: '1px solid #363a45', borderRadius: 8,
                      padding: 24, textAlign: 'center', fontSize: 13, color: '#787b86'
                    }}>
                      No signals for current holdings
                    </div>
                  )
                  : signals.map((s, i) => <SignalCard key={s.id} signal={s} index={i} />)
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
