'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Radio, MessageSquare, Briefcase,
  SlidersHorizontal, Bell, Star, Settings, Menu
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Radio, label: 'Radar', href: '/radar' },
  { icon: MessageSquare, label: 'AI Chat', href: '/chat' },
  { icon: Briefcase, label: 'Portfolio', href: '/portfolio' },
  { icon: SlidersHorizontal, label: 'Screener', href: '/screener' },
];

const BOTTOM_ITEMS = [
  { icon: Bell, label: 'Alerts', href: '/alerts' },
  { icon: Star, label: 'Watchlist', href: '/watchlist' },
];

export function LeftToolbar() {
  const pathname = usePathname();

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 48,
      width: 56,
      height: 'calc(100vh - 48px)',
      background: '#131722',
      borderRight: '1px solid #363a45',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
      zIndex: 40,
    }}>
      {/* Top nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
        <ToolbarButton icon={Menu} label="Menu" href="#" active={false} />
        <div style={{ height: 1, background: '#363a45', margin: '4px 8px' }} />
        {NAV_ITEMS.map(item => (
          <ToolbarButton
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
          />
        ))}
        <div style={{ height: 1, background: '#363a45', margin: '4px 8px' }} />
        {BOTTOM_ITEMS.map(item => (
          <ToolbarButton
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
          />
        ))}
      </div>

      {/* Settings at bottom */}
      <div style={{ marginTop: 'auto', marginBottom: 8 }}>
        <ToolbarButton icon={Settings} label="Settings" href="/settings" active={false} />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 44,
        color: active ? '#2962ff' : '#787b86',
        background: active ? '#0d1a4a' : 'transparent',
        textDecoration: 'none',
        transition: 'all 150ms ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = '#d1d4dc';
          (e.currentTarget as HTMLElement).style.background = '#2a2e39';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = '#787b86';
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      <Icon size={18} />
    </Link>
  );
}
