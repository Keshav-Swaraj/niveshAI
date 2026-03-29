'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, MoreHorizontal, ChevronDown } from 'lucide-react';
import { getGainers, getLosers } from '@/lib/api';

const WATCHLIST_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2847.50, change: 34.20, change_pct: 1.22 },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 3920.00, change: 20.00, change_pct: 0.51 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1620.00, change: -30.00, change_pct: -1.82 },
  { symbol: 'IREDA', name: 'IREDA', price: 340.00, change: 12.40, change_pct: 3.79 },
  { symbol: 'ZOMATO', name: 'Zomato Limited', price: 180.50, change: 4.20, change_pct: 2.38 },
  { symbol: 'DIXON', name: 'Dixon Technologies', price: 15250.00, change: 450.00, change_pct: 3.04 },
  { symbol: 'CDSL', name: 'CDSL', price: 1395.00, change: 55.00, change_pct: 4.11 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6920.00, change: 30.00, change_pct: 0.44 },
];

const SYMBOL_COLORS: Record<string, string> = {
  RELIANCE: '#2962ff', TCS: '#26a69a', HDFCBANK: '#ef5350',
  IREDA: '#f59e0b', ZOMATO: '#7c3aed', DIXON: '#14b8a6',
  CDSL: '#ec4899', BAJFINANCE: '#f97316',
};

export function RightPanel() {
  const [selected, setSelected] = useState<string | null>(null);

  const formatNum = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 48,
      width: 320,
      height: 'calc(100vh - 48px)',
      background: '#131722',
      borderLeft: '1px solid #363a45',
      overflowY: 'auto',
      zIndex: 40,
    }}>
      {/* Panel Header */}
      <div style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid #363a45',
        gap: 4,
      }}>
        <span style={{ fontSize: 14, color: '#d1d4dc', fontWeight: 500, flex: 1 }}>Watchlist</span>
        <ChevronDown size={12} style={{ color: '#787b86' }} />
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {[Plus, LayoutGrid, MoreHorizontal].map((Icon, i) => (
            <button key={i} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#787b86', padding: 4, borderRadius: 3,
              display: 'flex', alignItems: 'center',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d1d4dc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#787b86')}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Column Headers */}
      <div style={{
        height: 28,
        display: 'grid',
        gridTemplateColumns: '1fr 80px 60px 64px',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid #363a45',
        fontSize: 11,
        color: '#787b86',
        textTransform: 'uppercase',
      }}>
        <span>Symbol</span>
        <span style={{ textAlign: 'right' }}>Last</span>
        <span style={{ textAlign: 'right' }}>Chg</span>
        <span style={{ textAlign: 'right' }}>Chg%</span>
      </div>

      {/* INDICES Section */}
      <GroupLabel label="INDICES" />
      <WatchRow symbol="NIFTY50" name="Nifty 50" price={23450.64} change={234.50} change_pct={1.01}
        color="#2962ff" selected={selected} onSelect={setSelected} />
      <WatchRow symbol="SENSEX" name="S&P BSE Sensex" price={77301.20} change={498.30} change_pct={0.65}
        color="#26a69a" selected={selected} onSelect={setSelected} />

      {/* STOCKS Section */}
      <GroupLabel label="STOCKS" />
      {WATCHLIST_STOCKS.map(stock => (
        <WatchRow
          key={stock.symbol}
          symbol={stock.symbol}
          name={stock.name}
          price={stock.price}
          change={stock.change}
          change_pct={stock.change_pct}
          color={SYMBOL_COLORS[stock.symbol] || '#2962ff'}
          selected={selected}
          onSelect={setSelected}
        />
      ))}

      {/* Asset detail card for selected */}
      {selected && (
        <AssetDetail symbol={selected} stocks={WATCHLIST_STOCKS} />
      )}
    </div>
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div style={{
      height: 28,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 6,
      borderBottom: '1px solid #363a45',
      fontSize: 11,
      color: '#787b86',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    }}>
      <ChevronDown size={10} />
      {label}
    </div>
  );
}

function WatchRow({ symbol, name, price, change, change_pct, color, selected, onSelect }: {
  symbol: string; name: string; price: number; change: number; change_pct: number;
  color: string; selected: string | null; onSelect: (s: string | null) => void;
}) {
  const isSelected = selected === symbol;
  const isPositive = change_pct >= 0;

  return (
    <Link
      href={`/stock/${symbol}`}
      onClick={e => { e.preventDefault(); onSelect(isSelected ? null : symbol); }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 60px 64px',
        alignItems: 'center',
        height: 44,
        padding: '0 12px',
        borderBottom: '1px solid #1e222d',
        cursor: 'pointer',
        textDecoration: 'none',
        background: isSelected ? 'rgba(41,98,255,0.1)' : 'transparent',
        borderLeft: isSelected ? '2px solid #2962ff' : '2px solid transparent',
        paddingLeft: isSelected ? 10 : 12,
        transition: 'background 150ms',
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#1e222d'; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff',
          flexShrink: 0,
        }}>
          {symbol[0]}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 500 }}>{symbol}</span>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: isPositive ? '#26a69a' : '#ef5350',
            }} />
          </div>
          <div style={{ fontSize: 11, color: '#787b86', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
        </div>
      </div>
      <span style={{ textAlign: 'right', fontSize: 13, color: '#d1d4dc' }}>
        {price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </span>
      <span style={{ textAlign: 'right', fontSize: 12, color: isPositive ? '#26a69a' : '#ef5350' }}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}
      </span>
      <span style={{ textAlign: 'right', fontSize: 12, color: isPositive ? '#26a69a' : '#ef5350', fontWeight: 500 }}>
        {change_pct >= 0 ? '+' : ''}{change_pct.toFixed(2)}%
      </span>
    </Link>
  );
}

function AssetDetail({ symbol, stocks }: { symbol: string; stocks: typeof WATCHLIST_STOCKS }) {
  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock) return null;

  const PERF = [
    { label: '1W', value: 1.22 },
    { label: '1M', value: 4.80 },
    { label: '3M', value: 8.20 },
    { label: '6M', value: 22.10 },
    { label: 'YTD', value: 5.40 },
    { label: '5Y', value: 89.20 },
  ];

  return (
    <div style={{ padding: 12, borderTop: '1px solid #363a45' }}>
      <div style={{ fontSize: 16, color: '#d1d4dc', fontWeight: 600 }}>{symbol}</div>
      <div style={{ fontSize: 11, color: '#787b86', marginBottom: 10 }}>NSE · Indian Market</div>
      <div style={{ fontSize: 24, color: '#d1d4dc', fontWeight: 600 }}>
        {stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        <span style={{ fontSize: 12, color: '#787b86', marginLeft: 6 }}>INR</span>
        <span style={{ fontSize: 14, color: stock.change_pct >= 0 ? '#26a69a' : '#ef5350', marginLeft: 8 }}>
          {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#787b86', marginBottom: 12 }}>Market open · Last update 15:28 IST</div>

      {/* Performance row */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
        {PERF.map(p => (
          <div key={p.label} style={{ textAlign: 'center' as const }}>
            <div style={{
              fontSize: 11, padding: '3px 6px', borderRadius: 3,
              background: p.value >= 0 ? '#0d2e2c' : '#2e0d0d',
              color: p.value >= 0 ? '#26a69a' : '#ef5350',
            }}>
              {p.value >= 0 ? '+' : ''}{p.value}%
            </div>
            <div style={{ fontSize: 10, color: '#787b86', marginTop: 2 }}>{p.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
