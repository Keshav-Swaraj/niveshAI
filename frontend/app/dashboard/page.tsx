'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { LeftToolbar } from '@/components/layout/LeftToolbar';
import { RightPanel } from '@/components/layout/RightPanel';
import { SignalCard, SignalCardSkeleton } from '@/components/signals/SignalCard';
import { useSignalWebSocket } from '@/lib/websocket';
import { getSignals, getMarketBrief, getGainers, getLosers } from '@/lib/api';
import type { Signal, MarketBrief, Mover } from '@/lib/api';

const SIGNAL_TYPES = ['ALL', 'BULK_DEAL', 'INSIDER_BUY', 'BREAKOUT', 'VOLUME_SPIKE', 'FILING_ALERT', 'GOLDEN_CROSS', 'OVERSOLD_RSI'];

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  BULK_DEAL:    { bg: '#2d1f52', color: '#b197fc' },
  INSIDER_BUY:  { bg: '#1a3a2a', color: '#69db7c' },
  BREAKOUT:     { bg: '#3a2a10', color: '#fcc419' },
  VOLUME_SPIKE: { bg: '#1a2a4a', color: '#74c0fc' },
  FILING_ALERT: { bg: '#3a1a1a', color: '#ff8787' },
  GOLDEN_CROSS: { bg: '#1a3a38', color: '#63e6be' },
  OVERSOLD_RSI: { bg: '#3a2010', color: '#ffa94d' },
};

export default function DashboardPage() {
  const { signals: wsSignals, connectionStatus, lastUpdated } = useSignalWebSocket();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [brief, setBrief] = useState<MarketBrief | null>(null);
  const [gainers, setGainers] = useState<Mover[]>([]);
  const [losers, setLosers] = useState<Mover[]>([]);

  // Initial load
  useEffect(() => {
    getSignals().then(data => {
      setSignals(data);
      setLoading(false);
    }).catch(() => setLoading(false));

    getMarketBrief().then(setBrief).catch(() => {});
    getGainers().then(setGainers).catch(() => {});
    getLosers().then(setLosers).catch(() => {});
  }, []);

  // Update with WebSocket signals
  useEffect(() => {
    if (wsSignals.length > 0) setSignals(wsSignals);
  }, [wsSignals]);

  const filtered = filter === 'ALL'
    ? signals
    : signals.filter(s => s.signal_type === filter);

  const strong = signals.filter(s => s.signal_strength === 'Strong').length;
  const avgConf = signals.length > 0
    ? Math.round(signals.reduce((a, b) => a + (b.confidence_score ?? 0), 0) / signals.length)
    : 0;
  const processed = signals.filter(s => s.status === 'processed').length;

  const timeAgo = (date: Date | null) => {
    if (!date) return 'never';
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'just now';
    return `${diff}m ago`;
  };

  return (
    <div style={{ background: '#131722', minHeight: '100vh' }}>
      <TopBar />
      <LeftToolbar />
      <RightPanel />

      {/* Main content area */}
      <div style={{
        marginLeft: 56, marginRight: 320, marginTop: 48,
        padding: '20px 24px', minHeight: 'calc(100vh - 48px)',
      }}>
        {/* ── Metric Cards Row ─────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12, marginBottom: 20,
        }}>
          {[
            { label: 'Active Signals', value: signals.length.toString() },
            { label: 'Strong Signals', value: strong.toString() },
            { label: 'Avg Confidence', value: `${avgConf}%` },
            { label: 'Processed Today', value: processed.toString() },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: '#1e222d', border: '1px solid #363a45',
                borderRadius: 6, padding: 16,
              }}
            >
              <div style={{
                fontSize: 11, color: '#787b86', textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 6,
              }}>
                {card.label}
              </div>
              <div style={{ fontSize: 24, color: '#d1d4dc', fontWeight: 600 }}>
                {loading ? <div className="skeleton" style={{ width: 60, height: 28 }} /> : card.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Two-Column Layout ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Left — Signal Feed */}
          <div>
            {/* Feed header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#26a69a',
                  animation: 'pulse-dot 2s infinite',
                }} />
                <span style={{ fontSize: 11, color: '#26a69a' }}>LIVE</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexWrap: 'wrap' as const }}>
                {SIGNAL_TYPES.map(type => {
                  const badge = TYPE_BADGE[type];
                  const isActive = filter === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20,
                        border: '1px solid',
                        background: isActive ? (badge?.bg ?? '#2a2e39') : '#1e222d',
                        color: isActive ? (badge?.color ?? '#d1d4dc') : '#787b86',
                        borderColor: isActive ? (badge?.color ?? '#2962ff') : '#363a45',
                        cursor: 'pointer', fontWeight: isActive ? 500 : 400,
                        transition: 'all 150ms',
                      }}
                    >
                      {type === 'ALL' ? 'All' : type.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: 11, color: '#4c525e', marginLeft: 'auto' }}>
                Last updated: {timeAgo(lastUpdated)}
              </span>
            </div>

            {/* Signal cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SignalCardSkeleton key={i} />)
                : filtered.length === 0
                  ? (
                    <div style={{
                      background: '#1e222d', border: '1px solid #363a45', borderRadius: 8,
                      padding: 40, textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                      <div style={{ fontSize: 14, color: '#787b86' }}>
                        No {filter !== 'ALL' ? filter.replace('_', ' ').toLowerCase() : ''} signals right now
                      </div>
                    </div>
                  )
                  : filtered.map((signal, i) => (
                    <SignalCard key={signal.id} signal={signal} index={i} />
                  ))
              }
            </div>
          </div>

          {/* Right — Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* AI Market Brief */}
            <div style={{
              background: '#1e222d', border: '1px solid #363a45',
              borderRadius: 8, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500 }}>AI Market Brief</span>
                <span style={{ fontSize: 11, color: '#4c525e', marginLeft: 'auto' }}>
                  {brief?.generated_at ? new Date(brief.generated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
              <div style={{ height: 1, background: '#363a45', marginBottom: 12 }} />
              {brief ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {brief.bullets.map((bullet, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#d1d4dc', lineHeight: 1.5 }}>
                      <span style={{ color: '#2962ff', flexShrink: 0 }}>•</span>
                      {bullet}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 12, borderRadius: 3 }} />
                  ))}
                </div>
              )}
            </div>

            {/* FII/DII Flow */}
            <div style={{
              background: '#1e222d', border: '1px solid #363a45',
              borderRadius: 8, padding: 16,
            }}>
              <div style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500, marginBottom: 12 }}>
                FII / DII Today
              </div>
              {[
                { label: 'FII Net', value: 2840, max: 5000, positive: true },
                { label: 'DII Net', value: -1240, max: 5000, positive: false },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#787b86' }}>{row.label}</span>
                    <span style={{ color: row.positive ? '#26a69a' : '#ef5350', fontWeight: 500 }}>
                      {row.positive ? '+' : ''}₹{(row.value / 100).toFixed(0)} Cr
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#2a2e39', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${Math.abs(row.value) / row.max * 100}%`,
                      background: row.positive ? '#26a69a' : '#ef5350',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Top Movers */}
            <div style={{
              background: '#1e222d', border: '1px solid #363a45',
              borderRadius: 8, padding: 16,
            }}>
              <div style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500, marginBottom: 12 }}>
                Top Movers
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#26a69a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Gainers
                  </div>
                  {(gainers.length > 0 ? gainers : [
                    { symbol: 'IREDA', change_pct: 3.79 },
                    { symbol: 'CDSL', change_pct: 4.11 },
                    { symbol: 'DIXON', change_pct: 3.04 },
                    { symbol: 'ZOMATO', change_pct: 2.38 },
                  ] as Mover[]).slice(0, 4).map(m => (
                    <div key={m.symbol} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                      <span style={{ color: '#d1d4dc' }}>{m.symbol}</span>
                      <span style={{ color: '#26a69a' }}>+{m.change_pct.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#ef5350', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Losers
                  </div>
                  {(losers.length > 0 ? losers : [
                    { symbol: 'HDFCBANK', change_pct: -1.82 },
                    { symbol: 'LTIM', change_pct: -0.34 },
                  ] as Mover[]).slice(0, 4).map(m => (
                    <div key={m.symbol} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                      <span style={{ color: '#d1d4dc' }}>{m.symbol}</span>
                      <span style={{ color: '#ef5350' }}>{m.change_pct.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WebSocket status */}
            <div style={{
              padding: '8px 12px', borderRadius: 6,
              background: connectionStatus === 'connected' ? '#0d2e2c' : '#2a2e39',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: connectionStatus === 'connected' ? '#26a69a' : '#787b86',
              }} />
              <span style={{ fontSize: 11, color: connectionStatus === 'connected' ? '#26a69a' : '#787b86' }}>
                {connectionStatus === 'connected' ? 'Live updates active' : `WebSocket ${connectionStatus}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
