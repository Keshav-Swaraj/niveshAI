'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { LeftToolbar } from '@/components/layout/LeftToolbar';
import { RightPanel } from '@/components/layout/RightPanel';
import { SignalCard, SignalCardSkeleton } from '@/components/signals/SignalCard';
import { getSignals } from '@/lib/api';
import type { Signal } from '@/lib/api';

const SIGNAL_TYPES = ['ALL', 'BULK_DEAL', 'INSIDER_BUY', 'BREAKOUT', 'VOLUME_SPIKE', 'FILING_ALERT', 'GOLDEN_CROSS', 'OVERSOLD_RSI'];
const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  BULK_DEAL: { bg: '#2d1f52', color: '#b197fc' },
  INSIDER_BUY: { bg: '#1a3a2a', color: '#69db7c' },
  BREAKOUT: { bg: '#3a2a10', color: '#fcc419' },
  VOLUME_SPIKE: { bg: '#1a2a4a', color: '#74c0fc' },
  FILING_ALERT: { bg: '#3a1a1a', color: '#ff8787' },
  GOLDEN_CROSS: { bg: '#1a3a38', color: '#63e6be' },
  OVERSOLD_RSI: { bg: '#3a2010', color: '#ffa94d' },
};

export default function RadarPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [minConf, setMinConf] = useState(0);

  useEffect(() => {
    getSignals().then(data => { setSignals(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = signals.filter(s => {
    const typeOk = filter === 'ALL' || s.signal_type === filter;
    const confOk = (s.confidence_score ?? 0) >= minConf;
    return typeOk && confOk;
  });

  return (
    <div style={{ background: '#131722', minHeight: '100vh' }}>
      <TopBar />
      <LeftToolbar />
      <RightPanel />

      <div style={{ marginLeft: 56, marginRight: 320, marginTop: 48, minHeight: 'calc(100vh - 48px)' }}>
        {/* Sticky filter bar */}
        <div style={{
          position: 'sticky', top: 48, zIndex: 30,
          height: 48, background: '#131722', borderBottom: '1px solid #363a45',
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px',
        }}>
          <span style={{ fontSize: 12, color: '#787b86', flexShrink: 0 }}>Signal Type:</span>
          {SIGNAL_TYPES.map(type => {
            const badge = TYPE_BADGE[type];
            const isActive = filter === type;
            return (
              <button key={type} onClick={() => setFilter(type)} style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1px solid',
                background: isActive ? (badge?.bg ?? '#2a2e39') : 'transparent',
                color: isActive ? (badge?.color ?? '#d1d4dc') : '#787b86',
                borderColor: isActive ? (badge?.color ?? '#2962ff') : '#363a45',
                cursor: 'pointer', fontWeight: isActive ? 500 : 400, flexShrink: 0,
              }}>
                {type === 'ALL' ? 'All' : type.replace('_', ' ')}
              </button>
            );
          })}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#787b86' }}>Min confidence: {minConf}%</span>
            <input type="range" min={0} max={90} step={10} value={minConf}
              onChange={e => setMinConf(Number(e.target.value))}
              style={{ width: 100, accentColor: '#2962ff' }}
            />
          </div>
        </div>

        {/* Signal feed — expanded cards */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 13, color: '#787b86', marginBottom: 16 }}>
            Showing {filtered.length} signal{filtered.length !== 1 ? 's' : ''}
            {filter !== 'ALL' && ` · ${filter.replace('_', ' ')}`}
            {minConf > 0 && ` · confidence ≥${minConf}%`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SignalCardSkeleton key={i} />)
              : filtered.map((signal, i) => (
                <SignalCard key={signal.id} signal={signal} expanded={true} index={i} />
              ))
            }
            {!loading && filtered.length === 0 && (
              <div style={{
                background: '#1e222d', border: '1px solid #363a45', borderRadius: 8,
                padding: 60, textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, color: '#d1d4dc', marginBottom: 6 }}>No signals match your filters</div>
                <div style={{ fontSize: 13, color: '#787b86' }}>Try lowering the confidence threshold or selecting a different signal type</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
