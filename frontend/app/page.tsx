'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart2, Bell, BrainCircuit, TrendingUp, Shield, Zap, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { SignalCard } from '@/components/signals/SignalCard';
import type { Signal } from '@/lib/api';

// Demo market data for area chart
const NIFTY_DATA = [
  { t: '9:15', v: 22800 }, { t: '10:00', v: 22920 }, { t: '10:30', v: 22880 },
  { t: '11:00', v: 23050 }, { t: '11:30', v: 23100 }, { t: '12:00', v: 23020 },
  { t: '12:30', v: 23200 }, { t: '13:00', v: 23150 }, { t: '13:30', v: 23280 },
  { t: '14:00', v: 23350 }, { t: '14:30', v: 23310 }, { t: '15:00', v: 23420 },
  { t: '15:30', v: 23450 },
];

const INDICES = [
  { name: 'Nifty 50', symbol: 'NSE:NIFTY', value: '23,450.64', change: '+1.01%', positive: true },
  { name: 'Sensex', symbol: 'BSE:SENSEX', value: '77,301.20', change: '+0.65%', positive: true },
  { name: 'Bank Nifty', symbol: 'NSE:BANKNIFTY', value: '49,820.00', change: '+0.22%', positive: true },
];

const FEATURES = [
  {
    icon: Bell,
    title: 'Bulk Deal & Insider Alerts',
    desc: 'Every NSE/BSE bulk deal and insider trade detected within 60 minutes of filing. Know before the news breaks.'
  },
  {
    icon: BrainCircuit,
    title: 'AI Signal Synthesis',
    desc: 'Gemini AI reads the signal, fetches context, and delivers a plain-English thesis with bull/bear cases and risk factors.'
  },
  {
    icon: TrendingUp,
    title: 'Technical Pattern Engine',
    desc: 'Golden crosses, RSI extremes, volume spikes — detected across 1,800 NSE stocks with historical success rates.'
  },
];

const DEMO_SIGNAL: Signal = {
  id: 'demo-1',
  symbol: 'IREDA',
  company_name: 'Indian Renewable Energy Development Agency',
  signal_type: 'BULK_DEAL',
  trigger_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  raw_data: { client: 'Government of India (Promoter)', buy_sell: 'BUY', quantity: 8500000, price: 215.40, pct_of_volume: 2.1 },
  signal_strength: 'Strong',
  confidence_score: 78,
  status: 'processed',
  ai_analysis: {
    thesis: 'Government of India (the promoter) executed a massive 2.1% stake purchase in IREDA at ₹215.40, signaling strong state-level conviction in the renewable energy financing sector ahead of the Budget.',
    signal_strength: 'Strong',
    confidence_score: 78,
    bull_case: 'Promoter buy at key support level + Budget capex cycle = sustained re-rating potential toward ₹280-300 range.',
    bear_case: 'Broader NBFC credit tightening could compress valuations even with strong fundamentals.',
    key_risks: ['Sector rotation away from PSU stocks', 'Rising cost of funds for NBFC peers'],
    what_to_watch: 'Watch IREDA Q3 NIM data and any RBI guidance on infrastructure lending next week.',
    historical_note: 'Promoter bulk buys on PSU financing stocks have shown 72% success rate with average 8.5% gain in 30 days.',
    cited_sources: ['NSE Bulk Deal Filing', 'ET Markets', 'BSE Announcement']
  }
};

const TICKER_ITEMS = [
  { symbol: 'RELIANCE', price: '2,847.50', change: '+1.22%', positive: true },
  { symbol: 'TCS', price: '3,920.00', change: '+0.51%', positive: true },
  { symbol: 'HDFCBANK', price: '1,620.00', change: '-1.82%', positive: false },
  { symbol: 'IREDA', price: '340.00', change: '+3.79%', positive: true },
  { symbol: 'ZOMATO', price: '180.50', change: '+2.38%', positive: true },
  { symbol: 'DIXON', price: '15,250.00', change: '+3.04%', positive: true },
  { symbol: 'CDSL', price: '1,395.00', change: '+4.11%', positive: true },
  { symbol: 'BAJFINANCE', price: '6,920.00', change: '+0.44%', positive: true },
  { symbol: '🔔 IREDA BULK DEAL', price: '', change: '', positive: true, isSignal: true, signalBg: '#2d1f52', signalColor: '#b197fc' },
  { symbol: '🔔 CDSL INSIDER BUY', price: '', change: '', positive: true, isSignal: true, signalBg: '#1a3a2a', signalColor: '#69db7c' },
  { symbol: 'LTIM', price: '5,830.00', change: '-0.34%', positive: false },
  { symbol: 'INFY', price: '1,456.00', change: '+0.87%', positive: true },
];

const HEADLINE_WORDS = ['The', 'Signal', 'Layer', 'for', 'Indian', 'Markets'];

export default function LandingPage() {
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    // Fetch real signals from backend
    fetch('http://localhost:8000/api/signals')
      .then(r => r.json())
      .then((data: Signal[]) => {
        setSignals(data);
      })
      .catch(() => setSignals([DEMO_SIGNAL]));
  }, []);

  const displaySignal = signals[0] ?? DEMO_SIGNAL;

  return (
    <main style={{ background: '#131722', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Nav Bar ─────────────────────────────────────────────────────── */}
      <nav style={{
        height: 52, background: '#131722',
        borderBottom: '1px solid #363a45',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#2962ff', fontSize: 20, fontWeight: 700 }}>◆</span>
          <span style={{ fontSize: 15, color: '#d1d4dc', fontWeight: 600 }}>NiveshAI</span>
        </div>
        <div style={{ display: 'flex', gap: 24, marginLeft: 40 }}>
          {['Products', 'Markets', 'Community'].map(item => (
            <a key={item} href="#" style={{
              fontSize: 14, color: '#787b86', textDecoration: 'none',
              transition: 'color 150ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d1d4dc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#787b86')}
            >
              {item}
            </a>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="#" style={{ fontSize: 14, color: '#787b86', textDecoration: 'none' }}>Sign in</a>
          <Link href="/dashboard" style={{
            background: '#2962ff', color: '#fff', fontSize: 13,
            padding: '8px 18px', borderRadius: 4, textDecoration: 'none',
            fontWeight: 500, transition: 'background 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1a4fd6')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2962ff')}
          >
            Launch App →
          </Link>
        </div>
      </nav>

      {/* ── Ticker Bar ──────────────────────────────────────────────────── */}
      <div style={{
        height: 40, background: '#1e222d',
        borderBottom: '1px solid #363a45',
        overflow: 'hidden', display: 'flex', alignItems: 'center',
      }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 20px', borderRight: '1px solid #363a45', height: 40,
              flexShrink: 0,
            }}>
              {(item as typeof item & { isSignal?: boolean }).isSignal ? (
                <span style={{
                  background: (item as typeof item & { signalBg?: string }).signalBg,
                  color: (item as typeof item & { signalColor?: string }).signalColor,
                  borderRadius: 3, padding: '2px 8px', fontSize: 11, fontWeight: 500,
                }}>
                  {item.symbol}
                </span>
              ) : (
                <>
                  <span style={{ fontSize: 12, color: '#d1d4dc', fontWeight: 500 }}>{item.symbol}</span>
                  <span style={{ fontSize: 12, color: '#d1d4dc' }}>{item.price}</span>
                  <span style={{ fontSize: 12, color: item.positive ? '#26a69a' : '#ef5350' }}>{item.change}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' }}>
        {/* Headline with staggered word animation */}
        <h1 style={{ fontSize: 52, fontWeight: 600, color: '#d1d4dc', lineHeight: 1.15, margin: 0 }}>
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              style={{ display: 'inline-block', marginRight: 14 }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          style={{
            fontSize: 18, color: '#787b86', maxWidth: 620, margin: '20px auto 0',
            lineHeight: 1.6,
          }}
        >
          AI that monitors 1,800+ NSE stocks, detects bulk deals and insider trades — and tells you what they mean before you miss the move.
        </motion.p>

        {/* CTA Row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.3 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36 }}
        >
          <Link
            href="/dashboard"
            style={{
              background: '#2962ff', color: '#fff', fontSize: 14, fontWeight: 500,
              padding: '10px 24px', borderRadius: 4, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 150ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#1a4fd6';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#2962ff';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            View Live Signals <ArrowRight size={14} />
          </Link>
          <a
            href="#how-it-works"
            style={{
              border: '1px solid #363a45', color: '#d1d4dc', fontSize: 14,
              padding: '10px 24px', borderRadius: 4, textDecoration: 'none',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e222d')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            See How It Works
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.3 }}
          style={{ fontSize: 12, color: '#4c525e', marginTop: 16 }}
        >
          Monitoring 1,800+ NSE stocks in real time
        </motion.p>
      </section>

      {/* ── Market Summary ───────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          style={{
            background: '#1e222d', border: '1px solid #363a45',
            borderRadius: 8, padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, color: '#d1d4dc', fontWeight: 500, margin: 0 }}>
              Market summary <span style={{ color: '#2962ff' }}>›</span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              background: '#131722', border: '1px solid #363a45',
              borderRadius: 4, padding: '4px 10px',
              fontSize: 13, color: '#d1d4dc',
            }}>
              NIFTY 50 · NSE
            </div>
            <span style={{ fontSize: 28, color: '#d1d4dc', fontWeight: 600 }}>23,450.64</span>
            <span style={{ fontSize: 18, color: '#26a69a' }}>+234.50 (+1.01%)</span>
          </div>

          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={NIFTY_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#26a69a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#26a69a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#787b86' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e222d', border: '1px solid #363a45', borderRadius: 6, fontSize: 12, color: '#d1d4dc' }}
              />
              <Area type="monotone" dataKey="v" stroke="#26a69a" strokeWidth={1.5} fill="url(#niftyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.3 }}
              style={{
                background: '#1e222d', border: '1px solid #363a45',
                borderRadius: 8, padding: 24, cursor: 'default',
                transition: 'border-color 200ms',
              }}
              whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
            >
              <f.icon size={24} style={{ color: '#2962ff', marginBottom: 16, display: 'block' }} />
              <h3 style={{ fontSize: 15, color: '#d1d4dc', fontWeight: 600, margin: '0 0 8px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: '#787b86', margin: 0, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Major Indices Row ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {INDICES.map((idx, i) => (
            <motion.div
              key={idx.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              style={{
                background: '#1e222d', border: '1px solid #363a45',
                borderRadius: 8, padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: '#787b86', marginBottom: 8 }}>
                {idx.symbol}
              </div>
              <div style={{ fontSize: 22, color: '#d1d4dc', fontWeight: 600 }}>{idx.value}</div>
              <div style={{ fontSize: 14, color: idx.positive ? '#26a69a' : '#ef5350', marginTop: 4 }}>
                {idx.change}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Live Signal Preview ───────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <h2 style={{ fontSize: 20, color: '#d1d4dc', fontWeight: 500, marginBottom: 6 }}>
            This is what a signal looks like
          </h2>
          <p style={{ fontSize: 14, color: '#787b86', marginBottom: 24 }}>
            Real signals. Real data. Updated every hour.
          </p>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <SignalCard signal={displaySignal} expanded={true} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid #363a45' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <h2 style={{ fontSize: 40, color: '#d1d4dc', fontWeight: 600, margin: '0 0 12px' }}>
            Stop missing moves.
          </h2>
          <p style={{ fontSize: 24, color: '#787b86', marginBottom: 32 }}>
            Start trading with intelligence.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#2962ff', color: '#fff', fontSize: 14, fontWeight: 500,
              padding: '12px 28px', borderRadius: 4, textDecoration: 'none',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#1a4fd6';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#2962ff';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            View Live Signals <ArrowRight size={16} />
          </Link>
          <p style={{ fontSize: 12, color: '#4c525e', marginTop: 16 }}>
            Free · NSE &amp; BSE data · Built for Indian retail investors
          </p>
        </motion.div>
      </section>
    </main>
  );
}
