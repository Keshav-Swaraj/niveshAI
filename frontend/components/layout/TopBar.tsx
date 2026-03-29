'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getIndices } from '@/lib/api';

interface IndexData {
  value: number;
  change: number;
  change_pct: number;
}

export function TopBar() {
  const [nifty, setNifty] = useState<IndexData>({ value: 23450.64, change: 234.50, change_pct: 1.01 });
  const [sensex, setSensex] = useState<IndexData>({ value: 77301.20, change: 498.30, change_pct: 0.65 });
  const [marketOpen, setMarketOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Check if market is currently open (9:15 AM - 3:30 PM IST)
    const now = new Date();
    const istHour = (now.getUTCHours() + 5.5) % 24;
    const istMin = now.getUTCMinutes();
    const timeInMinutes = istHour * 60 + istMin;
    setMarketOpen(timeInMinutes >= 555 && timeInMinutes <= 930); // 9:15 to 15:30

    // Fetch real indices
    getIndices().then(data => {
      if (data.nifty50) setNifty(data.nifty50);
      if (data.sensex) setSensex(data.sensex);
    }).catch(() => {});
  }, []);

  const formatNum = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatChange = (n: number) => `${n >= 0 ? '+' : ''}${formatNum(n)}`;
  const formatPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 48,
      background: '#1e222d',
      borderBottom: '1px solid #363a45',
      display: 'flex',
      alignItems: 'center',
      zIndex: 50,
      paddingLeft: 0,
    }}>
      {/* Logo area — 56px matching toolbar width */}
      <Link href="/" style={{
        width: 56,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        textDecoration: 'none',
        borderRight: '1px solid #363a45',
      }}>
        <span style={{ color: '#2962ff', fontSize: 18, fontWeight: 700 }}>◆</span>
      </Link>

      {/* NiveshAI wordmark */}
      <Link href="/dashboard" style={{
        textDecoration: 'none',
        paddingLeft: 12,
        paddingRight: 16,
        color: '#d1d4dc',
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: '-0.3px',
        flexShrink: 0,
      }}>
        NiveshAI
      </Link>

      {/* Search bar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Search size={14} style={{
          position: 'absolute', left: 10, top: '50%',
          transform: 'translateY(-50%)', color: '#787b86', pointerEvents: 'none'
        }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search (Ctrl+K)'
          style={{
            width: 280,
            height: 32,
            background: '#2a2e39',
            border: '1px solid #363a45',
            borderRadius: 4,
            color: '#d1d4dc',
            fontSize: 13,
            paddingLeft: 32,
            paddingRight: 56,
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocus={e => (e.target.style.borderColor = '#2962ff')}
          onBlur={e => (e.target.style.borderColor = '#363a45')}
        />
        <kbd style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          background: '#131722', border: '1px solid #363a45',
          fontSize: 10, color: '#787b86', padding: '1px 5px', borderRadius: 3,
        }}>
          Ctrl+K
        </kbd>
      </div>

      {/* Right section — indices + market status + avatar */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 0, paddingRight: 12 }}>
        {/* Nifty 50 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px' }}>
          <span style={{ fontSize: 14, color: '#d1d4dc' }}>{formatNum(nifty.value)}</span>
          <span style={{ fontSize: 12, color: nifty.change_pct >= 0 ? '#26a69a' : '#ef5350' }}>
            {formatPct(nifty.change_pct)}
          </span>
          <span style={{ fontSize: 11, color: '#787b86' }}>NIFTY</span>
        </div>

        <div style={{ width: 1, height: 20, background: '#363a45' }} />

        {/* Sensex */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px' }}>
          <span style={{ fontSize: 14, color: '#d1d4dc' }}>{formatNum(sensex.value)}</span>
          <span style={{ fontSize: 12, color: sensex.change_pct >= 0 ? '#26a69a' : '#ef5350' }}>
            {formatPct(sensex.change_pct)}
          </span>
          <span style={{ fontSize: 11, color: '#787b86' }}>SENSEX</span>
        </div>

        <div style={{ width: 1, height: 20, background: '#363a45' }} />

        {/* Market status */}
        <div style={{
          margin: '0 16px',
          display: 'flex', alignItems: 'center', gap: 6,
          background: marketOpen ? '#0d2e2c' : '#1e222d',
          padding: '4px 10px', borderRadius: 4,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: marketOpen ? '#26a69a' : '#787b86',
            animation: marketOpen ? 'pulse-dot 2s infinite' : 'none',
          }} />
          <span style={{ fontSize: 12, color: marketOpen ? '#26a69a' : '#787b86', fontWeight: 500 }}>
            {marketOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        {/* User avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#2962ff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff',
          cursor: 'pointer',
        }}>
          KS
        </div>
      </div>
    </div>
  );
}
