# NIVESHAI — Design Specification
> Pixel-accurate TradingView-inspired UI · Built from reference screenshots
> Use this file for Tasks 9–17 in NIVESHAI_BUILD_GUIDE.md

---

## HOW TO USE THIS FILE

When building any frontend page in Antigravity, paste:
1. Section 1 (Global Theme) — always include this
2. Section 2 (Layout Shell) — always include this
3. The specific page section you are building

Every colour, spacing, font size, and component pattern below is extracted
directly from TradingView's actual UI from the reference screenshots.
Do not deviate from these values.

---

## SECTION 1 — Global Colour Palette

Extracted pixel-by-pixel from TradingView screenshots.

```css
/* globals.css — paste this exactly */
:root {
  /* Backgrounds — 4 levels of depth */
  --bg-base: #131722;         /* Outermost page background */
  --bg-surface: #1e222d;      /* Cards, panels, sidebars */
  --bg-elevated: #2a2e39;     /* Dropdowns, hover states, tooltips */
  --bg-input: #2a2e39;        /* Input fields, search bars */

  /* Borders */
  --border-subtle: #2a2e39;   /* Subtle dividers between sections */
  --border-default: #363a45;  /* Default card and panel borders */
  --border-strong: #434651;   /* Emphasized borders, active states */

  /* Brand colours */
  --green: #26a69a;           /* Bullish candles, positive change, buy */
  --green-bg: #0d2e2c;        /* Green background tint for badges */
  --red: #ef5350;             /* Bearish candles, negative change, sell */
  --red-bg: #2e0d0d;          /* Red background tint for badges */
  --blue: #2962ff;            /* Active nav, CTAs, accent elements */
  --blue-bg: #0d1a4a;         /* Blue background tint */
  --yellow: #f59e0b;          /* EMA 20 line colour — from screenshot */
  --purple: #7c3aed;          /* EMA 50 line colour — from screenshot */

  /* Text */
  --text-primary: #d1d4dc;    /* Main readable text — NOT pure white */
  --text-secondary: #787b86;  /* Labels, muted info, secondary data */
  --text-tertiary: #4c525e;   /* Very muted, timestamps, disabled */
  --text-positive: #26a69a;   /* Positive numbers */
  --text-negative: #ef5350;   /* Negative numbers */
  --text-accent: #2962ff;     /* Links, active elements */

  /* Special */
  --buy-btn: #1a73e8;         /* Buy button */
  --sell-btn: #e53935;        /* Sell button */
  --watchlist-selected: rgba(41,98,255,0.1); /* Selected row in watchlist */
}
```

```js
// tailwind.config.ts — extend with these exact values
extend: {
  colors: {
    tv: {
      base:      '#131722',
      surface:   '#1e222d',
      elevated:  '#2a2e39',
      border:    '#363a45',
      'border-strong': '#434651',
      green:     '#26a69a',
      'green-bg':'#0d2e2c',
      red:       '#ef5350',
      'red-bg':  '#2e0d0d',
      blue:      '#2962ff',
      'blue-bg': '#0d1a4a',
      yellow:    '#f59e0b',
      purple:    '#7c3aed',
      text:      '#d1d4dc',
      muted:     '#787b86',
      faint:     '#4c525e',
    }
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  }
}
```

```html
<!-- app/layout.tsx head — add Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

---

## SECTION 2 — Global Layout Shell

Exact measurements extracted from TradingView Image 1:

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOP BAR — 48px tall · #1e222d bg · border-bottom 1px #363a45      │
├──────────┬──────────────────────────────────────────┬──────────────┤
│  LEFT    │                                          │ RIGHT PANEL  │
│ TOOLBAR  │         MAIN CONTENT AREA                │  WATCHLIST   │
│  56px    │     background: #131722                  │   320px      │
│ #131722  │     padding: 20px 24px                   │  #131722     │
│ border-r │                                          │  border-l    │
│ #363a45  │     (changes per page)                   │  #363a45     │
│          │                                          │              │
└──────────┴──────────────────────────────────────────┴──────────────┘
```

### 2A — Top Bar (`components/layout/TopBar.tsx`)

Height: `48px` · Background: `#1e222d` · Border-bottom: `1px solid #363a45` · Position: fixed top

Left section:
- Logo area: `56px` wide, matches left toolbar width exactly
- NiveshAI wordmark: `15px`, `#d1d4dc`, font-weight 600

Centre section:
- Search bar: `280px` wide, `#2a2e39` bg, `height: 32px`, `border-radius: 4px`
  - Border: `1px solid #363a45`
  - Placeholder: `"Search (Ctrl+K)"` — `13px`, `#4c525e`
  - Search icon: `14px`, `#787b86`, left inside input `10px`
  - Keyboard shortcut: `Ctrl+K` shown as pill inside input right side
    - Pill: `background: #131722`, `border: 1px solid #363a45`, `font-size: 10px`, `color: #787b86`, `padding: 1px 5px`, `border-radius: 3px`

Right section (from Image 2 top bar reference):
- Nifty 50: `"23,450.64"` `14px #d1d4dc` + `"+1.22%"` `12px #26a69a`
- Separator: `1px solid #363a45`, `height: 20px`
- Sensex: same pattern
- Separator
- Market status: `"● OPEN"` — dot `6px #26a69a` + text `12px #26a69a`
  - Background: `#0d2e2c`, `padding: 4px 10px`, `border-radius: 4px`
  - Closed: dot grey, text `#787b86`, bg `#1e222d`
- User avatar: `28px` circle, `#2962ff` bg, initials `12px #ffffff`

### 2B — Left Toolbar (`components/layout/LeftToolbar.tsx`)

Width: `56px` · Background: `#131722` · Border-right: `1px solid #363a45` · Fixed left · Height: `100vh - 48px` · Top: `48px`

Exactly matching Image 1 left panel — icon buttons only, no labels:

```
[≡]   ← collapse/menu (top)
────  ← divider
[📊]  Dashboard
[📡]  Radar
[💬]  Chat
[💼]  Portfolio
[🔍]  Screener
────  ← divider
[🔔]  Alerts
[⭐]  Watchlist
────  ← divider
[⚙]   Settings (bottom)
```

Each icon button:
- Container: `width: 56px`, `height: 44px`, `display: flex`, `align-items: center`, `justify-content: center`
- Icon: Lucide icon, `18px`
- Default colour: `#787b86`
- Hover colour: `#d1d4dc`, background `#2a2e39`
- Active (current page): `#2962ff`, background `#0d1a4a`
- Transition: `150ms ease`

Dividers: `1px solid #363a45`, `margin: 4px 8px`

Tooltip on hover (right side): `background: #2a2e39`, `border: 1px solid #363a45`, `font-size: 12px`, `color: #d1d4dc`, `padding: 4px 10px`, `border-radius: 4px`

### 2C — Right Watchlist Panel (`components/layout/RightPanel.tsx`)

Width: `320px` · Background: `#131722` · Border-left: `1px solid #363a45` · Fixed right · Top: `48px` · Height: `100vh - 48px` · Overflow: `auto`

**Panel header** (matching Image 1 "Watchlist" top):
```
Watchlist  ∨     [+]  [⊞]  [···]
```
- Height: `44px`
- `"Watchlist"` text: `14px`, `#d1d4dc`, weight 500
- Dropdown arrow `∨`: `12px`, `#787b86`
- Action icons: `[+]` `[⊞]` `[···]` — `16px`, `#787b86`, hover `#d1d4dc`
- Border-bottom: `1px solid #363a45`

**Column headers** (exactly as in Image 1):
```
  Symbol              Last       Chg     Chg%
```
- Height: `28px`
- Font: `11px`, `#787b86`, uppercase
- Last / Chg / Chg% right-aligned in their columns
- Border-bottom: `1px solid #363a45`
- Background: `#131722`

**Section group labels** (INDICES, STOCKS — from Image 1 and 2):
```
∨ INDICES
∨ STOCKS
∨ FUTURES
```
- Height: `28px`
- Font: `11px`, `#787b86`, uppercase, `letter-spacing: 0.5px`
- Chevron `∨`: `10px`, `#787b86`, toggles collapse
- Border-bottom: `1px solid #363a45`
- Padding: `0 12px`

**Watchlist row** (exactly matching Image 1 rows — DJI, TSLA, NFLX, AAPL, USOIL, SILVER):
```
[◉] RELIANCE ●       2,847.50      +34.20     +1.22%
    Reliance Industries
```
- Height: `44px`
- Padding: `0 12px`
- Left: coloured symbol icon `24px` circle (use first letter, coloured bg)
- Symbol: `13px`, `#d1d4dc`, weight 500
- Live dot `●`: `5px` circle, right of symbol, green/red depending on movement
- Company name (second line, below symbol): `11px`, `#787b86`
- Last price: `13px`, `#d1d4dc`, right-aligned
- Chg: `12px`, green/red
- Chg%: `12px`, green/red, weight 500
- Hover: `background: #1e222d`
- Selected/active: `background: rgba(41,98,255,0.1)`, `border-left: 2px solid #2962ff`

**Default watchlist stocks for NiveshAI:**
```
∨ INDICES
  NIFTY50    23,450.64    +234.50    +1.01%
  SENSEX     77,301.20    +498.30    +0.65%

∨ STOCKS
  RELIANCE   2,847.50     +34.20     +1.22%
  TCS        3,920.00     +20.00     +0.51%
  HDFCBANK   1,620.00     -30.00     -1.82%
  IREDA        340.00     +12.40     +3.79%
  ZOMATO       180.50      +4.20     +2.38%
  DIXON     15,250.00    +450.00     +3.04%
  CDSL       1,395.00     +55.00     +4.11%
  BAJFINANCE  6,920.00    +30.00     +0.44%
```

**Asset detail card** (slides in below watchlist on row click, matching Image 1 bottom right):
```
[◉] RELIANCE    [⊞] [✏] [···]
Reliance Industries Ltd [↗] · NSE
Energy · Large Cap

2,847.50  INR  +34.20  +1.22%
── Market open ──
Last update at 15:28 IST

[News card: "Reliance Q3 profit beats estimates...  ›]

Performance
+1.22%   +4.80%   +8.20%   +22.10%   +5.40%   +89.20%
  1W       1M       3M        6M       YTD        5Y
```

Performance row colours:
- Positive: `background: #0d2e2c`, `color: #26a69a`
- Negative: `background: #2e0d0d`, `color: #ef5350`
- Each cell: `font-size: 11px`, `padding: 3px 6px`, `border-radius: 3px`
- Label below value: `10px`, `#787b86`

---

## SECTION 3 — Animated Landing Page (Task 9)

Route: `/` · No left toolbar · No right panel · Full screen

Background: `#131722` — flat, no gradient.

### Nav Bar (landing only, not app layout)

```
[◆ NiveshAI]    [Products]  [Markets]  [Community]    [Sign in]  [Upgrade now →]
```
Matching TradingView Image 2 top nav exactly:
- Background: `#131722`
- Border-bottom: `1px solid #363a45`
- Height: `52px`
- Logo: diamond `◆` in `#2962ff` + `"NiveshAI"` wordmark `15px #d1d4dc` weight 600
- Nav links: `14px`, `#787b86`, hover `#d1d4dc`
- `"Upgrade now"` / `"Launch App →"` CTA button: `background: #2962ff`, `color: #ffffff`, `font-size: 13px`, `padding: 8px 18px`, `border-radius: 4px`

### Hero Section

Centred, `max-width: 860px`, `margin: 0 auto`, `padding-top: 100px`

**Headline:**
- Text: `"The Signal Layer for Indian Markets"`
- Size: `52px`, weight 600, `#d1d4dc`, line-height `1.15`
- Framer Motion typewriter: each word — `initial={{ opacity:0, y:10 }}` → `animate={{ opacity:1, y:0 }}`, stagger `0.1s` per word

**Subheadline:**
- Text: `"AI that monitors 1,800+ NSE stocks, detects bulk deals and insider trades — and tells you what they mean before you miss the move."`
- Size: `18px`, `#787b86`, max-width `620px`, margin-top `20px`, line-height `1.6`
- Fade in after headline: `delay: 1.2s`, `duration: 0.4s`

**CTA row** (margin-top `36px`):
```
[View Live Signals →]    [See How It Works]
```
- Primary: `background: #2962ff`, `color: #fff`, `padding: 10px 24px`, `border-radius: 4px`, `font-size: 14px`, weight 500
  - Hover: `background: #1a4fd6`, `transform: scale(1.02)`
- Ghost: `border: 1px solid #363a45`, `color: #d1d4dc`, same padding/radius
  - Hover: `background: #1e222d`

**Social proof** (margin-top `16px`):
- `"Monitoring 1,800+ NSE stocks in real time"`, `12px`, `#4c525e`

### Market Summary Section

Below hero — matches Image 2 "Market summary" section exactly:

```
Market summary ›

┌─────────────────────────────────────────────────────┐
│  [◉ NIFTY 50  SPX –]    23,450.64  INR  +1.22%     │
│                                                      │
│  [Area chart — green fill, last session intraday]    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

- Container: `background: #1e222d`, `border: 1px solid #363a45`, `border-radius: 8px`, `padding: 20px`
- Heading `"Market summary ›"`: `20px`, `#d1d4dc`, weight 500
- Index selector pill: `background: #131722`, `border: 1px solid #363a45`, `border-radius: 4px`, `padding: 4px 10px`
- Symbol: `13px #d1d4dc` + exchange tag `12px #787b86`
- Big price: `28px`, `#d1d4dc`, weight 600
- Change: `18px`, green/red

Area chart (Recharts AreaChart):
- Background: transparent
- Line: `stroke: #ef5350` (if down) or `#26a69a` (if up), `strokeWidth: 1.5`
- Fill: gradient from line colour at `0.2 opacity` to `0 opacity` at bottom
- Grid lines: `#1e222d` (subtle)
- No axis lines — just the data
- X-axis labels: `10px`, `#787b86`

### Ticker Bar (full width, scrolling)

Height: `40px` · Background: `#1e222d` · Top + bottom border: `1px solid #363a45`

CSS infinite scroll animation — seamless loop:
```css
.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker-scroll 50s linear infinite;
}
.ticker-track:hover { animation-play-state: paused; }

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

Each ticker item (`padding: 0 20px`, `border-right: 1px solid #363a45`):
```
[◉] RELIANCE  2,847.50  +1.22%
```
- Symbol: `12px #d1d4dc` weight 500
- Price: `12px #d1d4dc`
- Change: `12px` green/red

Signal items (interspersed):
```
[🔔 IREDA  BULK DEAL]
```
- Background: badge bg colour, `border-radius: 3px`, `padding: 2px 8px`, `font-size: 11px`

### Features Section

3 cards, `display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px`

Scroll-triggered Framer Motion: `whileInView={{ opacity:1, y:0 }}`, `initial={{ opacity:0, y:24 }}`, stagger `0.12s`

Each card:
- Background: `#1e222d`, border `1px solid #363a45`, `border-radius: 8px`, `padding: 24px`
- Hover: `border-color: #2962ff`, `transition: 200ms`
- Icon: Lucide icon `24px`, `#2962ff`, `margin-bottom: 16px`
- Title: `15px`, `#d1d4dc`, weight 600, `margin-bottom: 8px`
- Description: `13px`, `#787b86`, line-height `1.6`

### Major Indices Row (below features)

Matching Image 2 "Major indices" section:
```
┌────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ [◉] Nifty 50       │  │ [◉] Sensex       │  │ [◉] Bank Nifty   │
│ 23,450.64          │  │ 77,301.20        │  │ 49,820.00        │
│ -1.22%   [sparkline]│  │ +0.65%  [spark] │  │ +0.22%  [spark]  │
└────────────────────┘  └──────────────────┘  └──────────────────┘
```
Each card: `background: #1e222d`, border, `border-radius: 8px`, `padding: 16px`
Sparkline: Recharts `LineChart` 60px height, no axes, just the line

### Live Signal Preview

Heading: `"This is what a signal looks like"` · `20px`, `#d1d4dc`, centred
Subtitle: `"Real signals. Real data. Updated every hour."` · `14px`, `#787b86`

Render 1 `SignalCard` (expanded mode) using IREDA seed data, centred, `max-width: 640px`
Framer Motion `whileInView` entrance from `y: 40`

### Footer CTA

`padding: 80px 24px` · centred
- Heading: `"Stop missing moves."` · `40px`, `#d1d4dc`, weight 600
- Subtext: `"Start trading with intelligence."` · `24px`, `#787b86`
- CTA: same primary button → `/dashboard`
- Bottom line: `"Free · NSE & BSE data · Built for Indian retail investors"` · `12px`, `#4c525e`

---

## SECTION 4 — Signal Dashboard (Task 12)

Route: `/dashboard` · Full layout (toolbar + right panel + main)

Main content area: `margin-left: 56px`, `margin-right: 320px`, `margin-top: 48px`, `padding: 20px 24px`

### Metric Cards Row

`display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px`

Each card:
- Background: `#1e222d`
- Border: `1px solid #363a45`
- Border-radius: `6px`
- Padding: `16px`
- Label: `11px`, `#787b86`, uppercase, `letter-spacing: 0.5px`, `margin-bottom: 6px`
- Value: `24px`, `#d1d4dc`, weight 600

### Two-Column Layout

`display: grid; grid-template-columns: 1fr 300px; gap: 20px`

**Left — Live Signal Feed:**
- `"● LIVE"` badge: `display: flex; align-items: center; gap: 6px`
  - Dot: `6px` circle, `background: #26a69a`, CSS `animation: pulse 2s infinite`
  - Text: `11px`, `#26a69a`
- `"Last updated: 2 min ago"`: `11px`, `#4c525e`, right-aligned
- Signal cards: `display: flex; flex-direction: column; gap: 8px; margin-top: 12px`
- WebSocket new card entrance: `initial={{ opacity:0, y:-16 }}` → `animate={{ opacity:1, y:0 }}`

**Right — Sidebar cards (stacked, gap: 12px):**

AI Market Brief card:
- Same card styling (bg `#1e222d`, border, radius `8px`, padding `16px`)
- Header row: `"AI Market Brief"` `13px #d1d4dc` weight 500 + timestamp `11px #4c525e` right-aligned
- Divider: `1px solid #363a45`, margin `12px 0`
- 3 bullet points: `"•"` in `#2962ff` + text `12px #d1d4dc`, `gap: 10px`

FII/DII Flow card:
- Label `"FII / DII Today"` `12px #787b86`
- Two rows: label + bar + value
- Bar height: `6px`, `border-radius: 3px`, bg `#2a2e39`
- Fill: green or red based on net

Top Movers card:
- `"GAINERS"` and `"LOSERS"` columns side by side
- Each: 4 rows, `symbol + price + change%`, `12px`, compact

---

## SECTION 5 — Opportunity Radar (Task 13)

Route: `/radar` · Full layout

### Sticky Filter Bar

Position: sticky below top bar · Height: `48px` · Background: `#131722` · Border-bottom: `1px solid #363a45`
`display: flex; align-items: center; gap: 10px; padding: 0 20px`

Signal type chips (toggle):
- Default: `background: #2a2e39; border: 1px solid #363a45; color: #787b86; font-size: 12px; padding: 4px 12px; border-radius: 20px`
- Active: use signal badge colours from Section 6

Confidence slider:
- Track: `height: 4px; background: #2a2e39; border-radius: 2px`
- Fill: `background: #2962ff`
- Thumb: `width: 14px; height: 14px; border-radius: 50%; background: #2962ff; border: 2px solid #131722`

### Signal Feed (expanded cards)

Same SignalCard component, `expanded={true}` — shows bull/bear/risks/sources

New signal entrance: `"NEW"` badge `background: #2962ff; color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 3px; animation: fadeOut 5s forwards`

```css
@keyframes fadeOut {
  0%, 80% { opacity: 1; }
  100%     { opacity: 0; }
}
```

---

## SECTION 6 — Signal Card Component (Task 11)

### Signal Type Badge System

| Signal Type | Badge BG | Badge Text |
|------------|---------|-----------|
| BULK_DEAL | `#2d1f52` | `#b197fc` |
| INSIDER_BUY | `#1a3a2a` | `#69db7c` |
| BREAKOUT | `#3a2a10` | `#fcc419` |
| VOLUME_SPIKE | `#1a2a4a` | `#74c0fc` |
| FILING_ALERT | `#3a1a1a` | `#ff8787` |
| GOLDEN_CROSS | `#1a3a38` | `#63e6be` |
| OVERSOLD_RSI | `#3a2010` | `#ffa94d` |

Badge base styles: `font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 3px; letter-spacing: 0.3px; text-transform: uppercase`

### Compact Card (Dashboard)

```
background: #1e222d
border: 1px solid #363a45
border-radius: 8px
padding: 14px 16px
```

Row 1: badge + `·` + symbol `13px #d1d4dc weight-600` + sector `12px #787b86` + time-ago `11px #4c525e` right
Row 2: company name `12px #787b86`
Divider: `1px solid #363a45; margin: 10px 0`
Row 3: thesis text `13px #d1d4dc; line-height: 1.55; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical`
Divider: `1px solid #363a45; margin: 10px 0`
Row 4:
- Confidence bar: `width: 140px; height: 3px; background: #2a2e39; border-radius: 2px`
  - Fill: `#26a69a` (≥70) / `#f59e0b` (40-69) / `#ef5350` (<40)
- Label: `"87 confidence"` `11px #787b86 margin-left: 8px`
- `"View Stock →"` right: `12px #2962ff; hover: text-decoration: underline`

Hover state: `border-color: #434651; transform: translateY(-1px); transition: 150ms`
Framer entrance: `initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}`

### Expanded Card (Radar)

All of compact card PLUS after thesis:

Bull/Bear row (`display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px`):
- Bull: `▲` `12px #26a69a`
- Bear: `▼` `12px #ef5350`

Sources chips: `display: flex; flex-wrap: wrap; gap: 4px; margin-top: 10px`
- Each: `font-size: 10px; color: #2962ff; background: #0d1a4a; padding: 2px 7px; border-radius: 3px; cursor: pointer`

---

## SECTION 7 — Stock Detail + Chart (Task 14)

Route: `/stock/[symbol]`

### Page Header (above chart)

Matching Image 1 top section exactly:
```
← RELIANCE  NSE:RELIANCE   O2,831  H2,861  L2,820  C2,847   +34.20 (+1.22%)

[SELL ▼ 2,847]   [BUY ▲]

EMA 20 close  2,801.40   ← yellow (#f59e0b) label colour
EMA 50 close  2,756.80   ← purple (#7c3aed) label colour
```

- Back arrow: `Lucide ChevronLeft`, `16px #787b86`, links to `/dashboard`
- Symbol: `16px #d1d4dc weight-600`
- Exchange tag: `"NSE:RELIANCE"` `12px #787b86; background: #2a2e39; padding: 2px 8px; border-radius: 3px`
- OHLC row: `O` `H` `L` `C` labels `12px #787b86`, values `12px #d1d4dc`
- Change: green/red
- SELL button: `background: #e53935; color: #fff; font-size: 13px; padding: 6px 16px; border-radius: 4px`
- BUY button: `background: #1a73e8; color: #fff; same size`
- Indicator labels: coloured text matching the line colour on chart (yellow for EMA20, purple for EMA50)

### Two-Column Layout

`display: grid; grid-template-columns: 1fr 320px; gap: 0`
Left: chart area · Right: analysis panel (same as right watchlist panel styling)

### TradingView Lightweight Chart Init

```typescript
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts'

const chart = createChart(containerRef.current, {
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
  rightPriceScale: {
    borderColor: '#363a45',
    textColor: '#787b86',
  },
  timeScale: {
    borderColor: '#363a45',
    textColor: '#787b86',
    rightOffset: 5,
    barSpacing: 8,
  },
  width: containerRef.current.clientWidth,
  height: 420,
})

// Candlestick — matching Image 1 exactly
const candleSeries = chart.addCandlestickSeries({
  upColor:         '#26a69a',   // green candle body
  downColor:       '#ef5350',   // red candle body
  borderUpColor:   '#26a69a',
  borderDownColor: '#ef5350',
  wickUpColor:     '#26a69a',
  wickDownColor:   '#ef5350',
})

// Volume bars — semi-transparent, colour matches candle
const volumeSeries = chart.addHistogramSeries({
  priceFormat: { type: 'volume' },
  priceScaleId: 'volume',
  scaleMargins: { top: 0.85, bottom: 0 },
})
// When setting volume data: color = upDay ? '#26a69a66' : '#ef535066'

// EMA 20 — Yellow (matching Image 1 yellow line)
const ema20 = chart.addLineSeries({
  color: '#f59e0b',
  lineWidth: 1,
  priceLineVisible: false,
  crosshairMarkerVisible: false,
  lastValueVisible: true,
  title: 'EMA 20',
})

// EMA 50 — Purple/Blue (matching Image 1 blue line)
const ema50 = chart.addLineSeries({
  color: '#7c3aed',
  lineWidth: 1,
  priceLineVisible: false,
  crosshairMarkerVisible: false,
  lastValueVisible: true,
  title: 'EMA 50',
})

// SMA 200 — Blue dashed
const sma200 = chart.addLineSeries({
  color: '#2962ff',
  lineWidth: 1,
  lineStyle: LineStyle.Dashed,
  priceLineVisible: false,
  title: 'SMA 200',
})

// Signal markers on chart timeline
candleSeries.setMarkers([
  {
    time: '2024-10-15',
    position: 'belowBar',
    color: '#26a69a',
    shape: 'arrowUp',
    text: 'Bulk Deal',
    size: 1,
  },
  {
    time: '2024-09-12',
    position: 'belowBar',
    color: '#69db7c',
    shape: 'arrowUp',
    text: 'Insider Buy',
    size: 1,
  },
])
```

### Time Range Selector (matching Image 1 bottom bar exactly)

```
[1D] [5D] [1M] [3M] [6M] [YTD] [1Y] [5Y] [All]
```
- Container: `height: 36px; background: #131722; border-top: 1px solid #363a45; display: flex; align-items: center; padding: 0 8px; gap: 2px`
- Each button: `padding: 4px 10px; font-size: 12px; border-radius: 3px; border: none; cursor: pointer`
- Default: `color: #787b86; background: transparent`
- Active: `color: #d1d4dc; background: #2a2e39`
- Hover: `color: #d1d4dc`

### RSI Sub-panel (toggleable, below chart)

```typescript
// Separate lightweight-charts instance
const rsiChart = createChart(rsiRef.current, {
  layout: { background: { color: '#131722' }, textColor: '#787b86', fontSize: 10 },
  grid: { vertLines: { color: '#1e222d' }, horzLines: { color: '#1e222d' } },
  rightPriceScale: { borderColor: '#363a45', textColor: '#787b86' },
  timeScale: { borderColor: '#363a45', textColor: '#787b86', visible: false },
  height: 80,
})

const rsiLine = rsiChart.addLineSeries({
  color: '#9c27b0',
  lineWidth: 1,
  priceLineVisible: false,
})

// Overbought line at 70 (red, dashed)
rsiChart.addLineSeries({ color: '#ef535055', lineWidth: 1, lineStyle: LineStyle.Dashed })
// Oversold line at 30 (green, dashed)
rsiChart.addLineSeries({ color: '#26a69a55', lineWidth: 1, lineStyle: LineStyle.Dashed })
```

Toggle button: `"RSI"` pill — matches Image 1 `[↑]` expand button style

### Right Analysis Panel

All cards: `background: #1e222d; border-left: 1px solid #363a45; padding: 16px`

Active Signals card:
- Header: `"Active Signals (2)"` `13px #d1d4dc`
- Each signal: compact SignalCard with only badge + one-line thesis + time-ago

AI Analysis card:
- Header: `"AI Analysis"`, `13px #d1d4dc`
- Confidence: `28px #d1d4dc weight-600` + `"/100"` `14px #787b86`
- Full confidence bar
- Thesis: `13px #d1d4dc; line-height: 1.6`
- `"What to watch"` box: `background: #0d1a4a; border-left: 2px solid #2962ff; padding: 10px 12px; border-radius: 0 4px 4px 0; font-size: 12px; color: #d1d4dc; margin-top: 12px`
- Sources as clickable chips

Key Stats grid:
- `display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px`
- Each cell: `background: #2a2e39; border-radius: 4px; padding: 10px`
- Label: `11px #787b86`
- Value: `13px #d1d4dc; margin-top: 3px`

### Bottom Tabs

Height: `36px; border-top: 1px solid #363a45; border-bottom: 1px solid #363a45`
`display: flex; background: #131722`

Each tab: `padding: 0 16px; font-size: 13px; height: 36px; display: flex; align-items: center; cursor: pointer; border-bottom: 2px solid transparent`
- Default: `color: #787b86`
- Active: `color: #d1d4dc; border-bottom-color: #2962ff`
- Hover: `color: #d1d4dc`

Tab panel content: `padding: 16px; background: #131722`

---

## SECTION 8 — AI Market Chat (Task 15)

Route: `/chat` · Full layout (toolbar + right panel)

### Two-Column Chat Layout

Main content splits into:
- Chat column: `flex: 1`
- Thinking trail: `width: 280px; border-left: 1px solid #363a45; background: #131722`

### Chat Column

Messages area: `flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px`

**User message:**
```css
background: #2962ff;
color: #ffffff;
font-size: 13px;
padding: 10px 14px;
border-radius: 12px 12px 2px 12px;
max-width: 72%;
align-self: flex-end;
```

**AI message:**
```css
background: #1e222d;
border: 1px solid #363a45;
color: #d1d4dc;
font-size: 13px;
padding: 12px 14px;
border-radius: 2px 12px 12px 12px;
max-width: 85%;
align-self: flex-start;
```

AI message markdown styles (inside the bubble):
```css
h3   { font-size: 14px; color: #d1d4dc; font-weight: 600; margin: 12px 0 6px; }
ul   { padding-left: 16px; }
li   { font-size: 13px; color: #d1d4dc; line-height: 1.5; margin: 3px 0; }
strong { font-weight: 600; color: #d1d4dc; }
code { background: #2a2e39; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
```

Citation chips (below AI message):
```
display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px
```
Each chip: `font-size: 10px; color: #2962ff; background: #0d1a4a; padding: 2px 8px; border-radius: 3px; cursor: pointer; text-decoration: none`
Hover: `background: #1a2a5a`

Typing indicator:
```tsx
// 3 bouncing dots
<div style={{ display: 'flex', gap: '4px', padding: '12px 14px' }}>
  {[0,1,2].map(i => (
    <div key={i} style={{
      width: 6, height: 6, borderRadius: '50%',
      background: '#787b86',
      animation: `bounce 1.2s infinite ${i * 0.2}s`
    }} />
  ))}
</div>

/* globals.css */
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-6px); }
}
```

### Starter Prompts

`display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 20px; border-top: 1px solid #363a45`

Each chip:
```css
background: #2a2e39;
border: 1px solid #363a45;
color: #d1d4dc;
font-size: 12px;
padding: 6px 14px;
border-radius: 20px;
cursor: pointer;
```
Hover: `border-color: #2962ff; background: #1e222d`

### Input Bar

Height: `52px; border-top: 1px solid #363a45; background: #1e222d; display: flex; align-items: center; padding: 0 16px; gap: 12px`

Portfolio toggle:
- Label: `"Portfolio context"` `12px #787b86`
- Toggle pill: `width: 32px; height: 18px; border-radius: 9px`
  - OFF: `background: #2a2e39`
  - ON: `background: #2962ff`
  - Thumb: `14px` white circle, transition `transform 0.15s`

Textarea: `flex: 1; background: #2a2e39; border: 1px solid #363a45; border-radius: 6px; padding: 8px 12px; font-size: 13px; color: #d1d4dc; resize: none; min-height: 36px; max-height: 120px; font-family: Inter`
Placeholder: `color: #4c525e`
Focus: `border-color: #2962ff; outline: none`

Send button: `width: 36px; height: 36px; background: #2962ff; border-radius: 4px; display: flex; align-items: center; justify-content: center`
Disabled: `background: #2a2e39; cursor: not-allowed`
Icon: Lucide `Send`, `16px #ffffff`

### Thinking Trail Panel

Padding: `16px`
Header: `"Agent Activity"` `13px #787b86 weight-500; margin-bottom: 16px`

Each activity item:
```
[icon]  Description text             data-count
```
- `display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #363a45`
- Icon area `20px × 20px`:
  - Pending: CSS spinner `border: 2px solid #363a45; border-top-color: #2962ff; border-radius: 50%; animation: spin 0.8s linear infinite; width: 14px; height: 14px`
  - Done: `✓` `12px #26a69a`
- Description: `12px #d1d4dc; flex: 1`
- Data count: `11px #787b86`

Framer stagger: items appear sequentially `staggerChildren: 0.3s`

---

## SECTION 9 — My Portfolio (Task 16)

Route: `/portfolio`

### Summary Bar

4 metric cards (same component as Dashboard).
P&L card tint: positive → `background: #0d2e2c`, value `#26a69a` · negative → `background: #2e0d0d`, value `#ef5350`

### Add Holding Form

`display: flex; align-items: center; gap: 12px; background: #1e222d; border: 1px solid #363a45; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px`

Inputs:
- Symbol autocomplete: `width: 160px`
- Quantity: `width: 100px; type: number`
- Avg price: `width: 130px; type: number`
- All inputs: `background: #2a2e39; border: 1px solid #363a45; color: #d1d4dc; font-size: 13px; padding: 7px 12px; border-radius: 4px`
- Focus: `border-color: #2962ff`
- `"Add Position"` button: primary CTA style

### Holdings Table

`width: 100%; border-collapse: collapse`

Header: `font-size: 11px; color: #787b86; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #363a45; height: 32px`

Data row: `height: 44px; border-bottom: 1px solid #1e222d; font-size: 13px; cursor: pointer`
Hover: `background: #1e222d`
Cells:
- Symbol: `#d1d4dc weight-600`
- Company: `#787b86 font-size: 12px`
- Qty / Avg: `#d1d4dc`
- CMP: `#d1d4dc`
- P&L ₹: green or red
- P&L %: green or red, weight 500
- Signals: badge chips

### Charts Row

`display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 16px`

Card: `background: #1e222d; border: 1px solid #363a45; border-radius: 8px; padding: 16px`
Card header: `font-size: 13px; color: #d1d4dc; weight-500; margin-bottom: 16px`

Recharts global styles (apply to all charts):
```tsx
// Recharts default colors override
const CHART_COLORS = {
  Banking:  '#2962ff',
  Energy:   '#f59e0b',
  IT:       '#26a69a',
  FMCG:     '#9c27b0',
  Auto:     '#ef5350',
  Infra:    '#14b8a6',
}

// Tooltip style
<Tooltip
  contentStyle={{
    background: '#1e222d',
    border: '1px solid #363a45',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#d1d4dc',
  }}
/>

// Grid lines
<CartesianGrid stroke="#1e222d" strokeDasharray="none" />

// Axis text
<XAxis tick={{ fontSize: 11, fill: '#787b86' }} />
<YAxis tick={{ fontSize: 11, fill: '#787b86' }} />
```

---

## SECTION 10 — Screener (Task 17)

Route: `/screener`

### Pre-saved Screen Cards

`display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px`

Card: `background: #1e222d; border: 1px solid #363a45; border-radius: 8px; padding: 16px; cursor: pointer`
Hover: `border-color: #2962ff`
- Title: `13px #d1d4dc weight-500`
- Description: `11px #787b86; margin-top: 4px`
- Badge row: `display: flex; gap: 4px; margin-top: 10px; flex-wrap: wrap`
- `"Run →"` : `font-size: 12px; color: #2962ff; margin-top: 10px`

### Filter Builder

`display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px`

Each group card: `background: #1e222d; border: 1px solid #363a45; border-radius: 8px; padding: 16px`
Group header: `font-size: 13px; color: #d1d4dc; weight-500; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer`
Collapse icon: `▼` rotates `▲` on collapse, `transition: 200ms`

Filter inputs inside groups: same chip/slider/dropdown styles as Radar filter bar

`"Run Screen"` button: large primary CTA, `padding: 12px 32px`, centred below filters

### Results Table

Same table styling as Portfolio holdings table.
AI Insight column: `font-size: 12px; color: #787b86; font-style: italic; max-width: 280px`

Results count: `"Showing 8 matches"` `13px #787b86; margin-bottom: 12px`

---

## SECTION 11 — Global Micro-interactions

These apply everywhere:

```css
/* Scrollbars */
::-webkit-scrollbar       { width: 4px; height: 4px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { background: #363a45; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #434651; }

/* Focus rings */
:focus-visible { outline: 2px solid #2962ff; outline-offset: 2px; border-radius: 2px; }

/* Selection */
::selection { background: rgba(41,98,255,0.3); color: #d1d4dc; }

/* Global transitions */
* { transition-property: background-color, border-color, color;
    transition-duration: 150ms;
    transition-timing-function: ease; }

/* Loading skeleton */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #1e222d 25%, #2a2e39 50%, #1e222d 75%);
  background-size: 400px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Pulse animation for live dot */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.3); }
}

/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

Framer Motion defaults:
```tsx
// Page entrance
const page = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

// Card list stagger
const list = { animate: { transition: { staggerChildren: 0.06 } } }
const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

// Scroll triggered
<motion.div whileInView={{ opacity:1, y:0 }} initial={{ opacity:0, y:24 }} viewport={{ once: true }} />
```

---

## SECTION 12 — Antigravity Prompt Prefix for Design Tasks

Paste this before any design task prompt:

```
You are building NiveshAI — a TradingView-style Indian market signal platform.
DESIGN.md in this project contains all design specifications extracted from
TradingView screenshots. Follow it exactly.

Rules:
- Use ONLY the hex colours from DESIGN.md Section 1 — no Tailwind defaults
- Every bg, text, border must use the exact hex values specified
- Match TradingView's density: compact rows, 11-13px text, thin borders
- Use Inter font, 400/500/600 weights only
- All interactive elements need hover + active states as specified
- Import Framer Motion for entrances and transitions
- When in doubt, look at what TradingView does in the reference screenshots

Now build: [paste specific task section from DESIGN.md]
```

---

*NiveshAI Design Specification · ET AI Hackathon 2026*
*Reference: TradingView.com UI — Chart page + Market overview page*
*All colours and measurements extracted from reference screenshots*
