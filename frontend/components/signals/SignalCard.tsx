'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Signal } from '@/lib/api';

// ─── Signal Badge System (from DESIGN.md Section 6) ──────────────────────────
const BADGE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BULK_DEAL:    { bg: '#2d1f52', color: '#b197fc', label: 'Bulk Deal' },
  INSIDER_BUY:  { bg: '#1a3a2a', color: '#69db7c', label: 'Insider Buy' },
  BREAKOUT:     { bg: '#3a2a10', color: '#fcc419', label: 'Breakout' },
  VOLUME_SPIKE: { bg: '#1a2a4a', color: '#74c0fc', label: 'Volume Spike' },
  FILING_ALERT: { bg: '#3a1a1a', color: '#ff8787', label: 'Filing Alert' },
  GOLDEN_CROSS: { bg: '#1a3a38', color: '#63e6be', label: 'Golden Cross' },
  OVERSOLD_RSI: { bg: '#3a2010', color: '#ffa94d', label: 'Oversold RSI' },
};

// Confidence bar color
function confidenceColor(score: number): string {
  if (score >= 70) return '#26a69a';
  if (score >= 40) return '#f59e0b';
  return '#ef5350';
}

// Time ago formatter
function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

interface SignalCardProps {
  signal: Signal;
  expanded?: boolean;
  isNew?: boolean;
  index?: number;
}

export function SignalCard({ signal, expanded = false, isNew = false, index = 0 }: SignalCardProps) {
  const badge = BADGE_STYLES[signal.signal_type] || BADGE_STYLES.BULK_DEAL;
  const analysis = signal.ai_analysis;
  const confidence = signal.confidence_score ?? analysis?.confidence_score ?? 0;
  const thesis = analysis?.thesis ?? 'Analyzing signal...';
  const sector = (signal as Signal & { sector?: string }).sector ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      style={{
        background: '#1e222d',
        border: '1px solid #363a45',
        borderRadius: 8,
        padding: '14px 16px',
        position: 'relative',
        cursor: 'pointer',
      }}
      whileHover={{
        borderColor: '#434651',
        y: -1,
        transition: { duration: 0.15 },
      }}
    >
      {/* NEW badge */}
      {isNew && (
        <span className="fade-out-new" style={{
          position: 'absolute', top: 10, right: 10,
          background: '#2962ff', color: '#fff',
          fontSize: 10, padding: '1px 6px', borderRadius: 3,
          fontWeight: 600,
        }}>
          NEW
        </span>
      )}

      {/* Row 1: badge · symbol · sector · time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 3,
          letterSpacing: '0.3px', textTransform: 'uppercase' as const,
          background: badge.bg, color: badge.color,
        }}>
          {badge.label}
        </span>
        <span style={{ color: '#4c525e', fontSize: 12 }}>·</span>
        <span style={{ fontSize: 13, color: '#d1d4dc', fontWeight: 600 }}>{signal.symbol}</span>
        {sector && <span style={{ fontSize: 12, color: '#787b86' }}>{sector}</span>}
        <span style={{ fontSize: 11, color: '#4c525e', marginLeft: 'auto' }}>
          {timeAgo(signal.trigger_time)}
        </span>
      </div>

      {/* Row 2: company name */}
      <div style={{ fontSize: 12, color: '#787b86', marginTop: 2 }}>
        {signal.company_name}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#363a45', margin: '10px 0' }} />

      {/* Row 3: thesis */}
      <div className={expanded ? '' : 'text-clamp-2'} style={{
        fontSize: 13, color: '#d1d4dc', lineHeight: 1.55,
      }}>
        {thesis}
      </div>

      {/* Expanded: Bull/Bear cases */}
      {expanded && analysis && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10
          }}>
            <div style={{ fontSize: 12, color: '#d1d4dc', lineHeight: 1.5 }}>
              <span style={{ color: '#26a69a', marginRight: 4 }}>▲</span>
              {analysis.bull_case}
            </div>
            <div style={{ fontSize: 12, color: '#d1d4dc', lineHeight: 1.5 }}>
              <span style={{ color: '#ef5350', marginRight: 4 }}>▼</span>
              {analysis.bear_case}
            </div>
          </div>

          {/* What to watch */}
          {analysis.what_to_watch && (
            <div style={{
              background: '#0d1a4a', borderLeft: '2px solid #2962ff',
              padding: '8px 12px', borderRadius: '0 4px 4px 0',
              fontSize: 12, color: '#d1d4dc', marginTop: 10, lineHeight: 1.5,
            }}>
              <span style={{ color: '#787b86', fontSize: 11 }}>WATCH: </span>
              {analysis.what_to_watch}
            </div>
          )}

          {/* Sources */}
          {analysis.cited_sources && analysis.cited_sources.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginTop: 10 }}>
              {analysis.cited_sources.map((src, i) => (
                <span key={i} style={{
                  fontSize: 10, color: '#2962ff', background: '#0d1a4a',
                  padding: '2px 7px', borderRadius: 3, cursor: 'pointer',
                }}>
                  {src}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: '#363a45', margin: '10px 0' }} />

      {/* Row 4: confidence bar + view stock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <div style={{ width: 140, height: 3, background: '#2a2e39', borderRadius: 2, flexShrink: 0 }}>
          <div style={{
            width: `${confidence}%`, height: '100%',
            background: confidenceColor(confidence), borderRadius: 2,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: '#787b86', marginLeft: 8 }}>
          {confidence} confidence
        </span>
        <Link
          href={`/stock/${signal.symbol}`}
          style={{
            marginLeft: 'auto', fontSize: 12, color: '#2962ff',
            textDecoration: 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          View Stock →
        </Link>
      </div>
    </motion.div>
  );
}

// Skeleton loader for signal card
export function SignalCardSkeleton() {
  return (
    <div style={{
      background: '#1e222d', border: '1px solid #363a45',
      borderRadius: 8, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 60, height: 16 }} />
        <div className="skeleton" style={{ width: 40, height: 14, marginLeft: 'auto' }} />
      </div>
      <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 10 }} />
      <div style={{ height: 1, background: '#363a45', marginBottom: 10 }} />
      <div className="skeleton" style={{ width: '100%', height: 13, marginBottom: 6 }} />
      <div className="skeleton" style={{ width: '80%', height: 13, marginBottom: 10 }} />
      <div style={{ height: 1, background: '#363a45', marginBottom: 10 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="skeleton" style={{ width: 140, height: 3 }} />
        <div className="skeleton" style={{ width: 80, height: 11 }} />
      </div>
    </div>
  );
}
