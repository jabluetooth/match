# Match Dashboard — Design Handoff

## Overview
This document specifies the visual design system for the Match dashboard homepage. Use this as the source of truth when implementing components in your Next.js + Tailwind stack.

All values are in CSS units (px, oklch, etc.) unless otherwise noted.

---

## Color System

### Base Palette
```css
--bg:       oklch(0.985 0.005 85);      /* Warm off-white background */
--bg-2:     oklch(0.97 0.006 85);       /* Secondary bg, slightly darker */
--ink:      oklch(0.22 0.02 265);       /* Primary text, deep navy-ish */
--ink-2:    oklch(0.45 0.02 265);       /* Secondary text, lighter */
--ink-3:    oklch(0.62 0.015 265);      /* Tertiary text, muted */
--line:     oklch(0.92 0.005 85);       /* Borders, light */
--line-2:   oklch(0.88 0.008 85);       /* Borders, slightly darker */
--card:     #ffffff;                     /* Card backgrounds */
```

### Accent Families (Soft Pastel Gradients)
The design uses four interchangeable accent color families. Each is a 2-color gradient pair:

#### Peach (default)
```css
--primary:        #FF8A6B;
--primary-soft:   #FFE8DF;
--accent-a:       #FFB39A;  /* lighter peach  */
--accent-b:       #FF7A8A;  /* coral          */
Tile gradient:    linear-gradient(135deg, #FFC7AE, #FF8FA0)
```

#### Sky
```css
--primary:        #6B8FFF;
--accent-a:       #A8C5FF;  /* light sky   */
--accent-b:       #7FA5FF;  /* deeper blue */
Tile gradient:    linear-gradient(135deg, #B6CFFF, #BDA8FF)
```

#### Mint
```css
--primary:        #4FC8A3;
--accent-a:       #9FE6C9;  /* light mint  */
--accent-b:       #6DCBAE;  /* deeper teal */
Tile gradient:    linear-gradient(135deg, #B4EBD1, #9DDCE4)
```

#### Violet
```css
--primary:        #8B6BFF;
--accent-a:       #C8B6FF;  /* light violet */
--accent-b:       #A58FFF;  /* deeper       */
Tile gradient:    linear-gradient(135deg, #DDC8FF, #C3A5FF)
```

**Implementation note**: Each accent family overrides `--primary`, `--accent-a`, `--accent-b` globally via `[data-accent="peach"]`, etc. Use a single source-of-truth CSS variable approach, or hardcode one family per build variant.

---

## Typography

### Font Stack
- **Display/Headlines**: `'Instrument Serif', 'Fraunces', serif`
  - Modern, warm, italic serif for personality
  - Fallback to Fraunces for broader support
  
- **UI/Body**: `'Inter', ui-sans-serif, system-ui, sans-serif`
  - Clean, readable sans-serif for all UI text
  
- **Monospace/Code**: `'JetBrains Mono', ui-monospace, monospace`
  - Webhook URLs, code snippets, tech details

### Type Scale

| Use | Font | Size | Weight | Line-height | Letter-spacing |
|-----|------|------|--------|-------------|----------------|
| Page heading (h1) | Display | 40–56px (clamp) | 400 | 1.02 | -0.025em |
| Hero h2 | Display | 36–46px (clamp) | 400 | 1.04 | -0.025em |
| Card title | Serif | 26px | 400 | 1 | -0.02em |
| Card label | UI | 11px | 600 | 1 | 0.12em (uppercase) |
| Body/UI | UI | 13–15px | 400 | 1.5 | -0.005em |
| Small/caption | UI | 11.5–12.5px | 400 | 1.4 | 0em |
| Monospace (code) | Mono | 11.5px | 500 | 1.5 | 0em |

**Note on clamp()**: Use `clamp(min, preferred, max)` for responsive headlines:
- h1: `clamp(40px, 4.2vw, 56px)`
- h2: `clamp(36px, 3.6vw, 46px)`

---

## Spacing & Layout

### Spacing Scale
```css
--pad:  28px;   /* Card padding (default) */
--gap:  20px;   /* Grid/flex gap (default) */
```

**Density variants** (via `[data-density]`):
- `compact`: `--pad: 18px; --gap: 14px; --radius-lg: 22px;`
- `regular` (default): `--pad: 28px; --gap: 20px; --radius-lg: 28px;`
- `comfy`: `--pad: 34px; --gap: 26px; --radius-lg: 28px;`

### Border Radius
```css
--radius-lg:  28px;   /* Cards, tiles, hero sections */
--radius-md:  18px;   /* Smaller components (funnels, chips) */
--radius-sm:  12px;   /* Buttons, inputs, badges */
```

### Grid Layout
**3-column desktop grid** (1440px max-width):
```css
grid-template-columns: 1.4fr 1fr 1fr;
gap: 20px;
```

**Explicit placements** (avoid auto-placement gaps):
- Hero matches: `col: 1 / span 2, row: 1`
- Stat tiles (2×): `col: 3, row: 1 & 2`
- Onboarding: `col: 1 / span 2, row: 2`
- Funnel: `col: 1, row: 3`
- My matches: `col: 2, row: 3`
- Activity: `col: 3, row: 3`
- Résumé: `col: 1 / span 3, row: 4`

**Responsive breakpoints**:
- **1080px and below**: 2-column grid, flex hero vertically
- **720px and below**: 1-column full-width, hide search bar

---

## Shadows & Effects

### Card Shadows
```css
--shadow-card: 0 1px 0 rgba(255,255,255,.9) inset,
               0 1px 2px rgba(30,20,10,.04),
               0 8px 24px -12px rgba(30,20,10,.08);
```
Used on: cards, buttons, inputs, avatar

### Tile/Gradient Shadows
```css
--shadow-tile: 0 1px 0 rgba(255,255,255,.5) inset,
               0 10px 30px -10px rgba(255,120,90,.28);
```
Used on: gradient stat tiles (peach, sky, mint)

### Backdrop Blur (glass effect)
When `[data-cardstyle="glass"]`:
```css
background: color-mix(in oklab, #fff 60%, transparent);
backdrop-filter: blur(18px) saturate(140%);
-webkit-backdrop-filter: blur(18px) saturate(140%);
border-color: rgba(255,255,255,.7);
```

### Texture
Background noise overlay (SVG):
```css
background-image: url("data:image/svg+xml;utf8,<svg ...feTurbulence ...>");
opacity: 0.35;
mix-blend-mode: overlay;
```

---

## Components

### Buttons

#### Primary Button (`.btn-primary`)
```css
background: linear-gradient(135deg, var(--accent-a), var(--accent-b));
color: #fff;
padding: 11px 18px;
border-radius: 999px;
font-size: 13px;
font-weight: 600;
box-shadow: 0 6px 18px -6px rgba(..., 0.3);
white-space: nowrap;
transition: transform 0.12s ease, box-shadow 0.12s ease;

&:hover {
  transform: translateY(-1px);
}
```

#### Ghost Button (`.btn-ghost`)
```css
background: transparent;
color: var(--ink);
border: 1px solid var(--line-2);
padding: 11px 18px;
border-radius: 999px;
white-space: nowrap;

&:hover {
  background: var(--bg-2);
}
```

### Cards (`.card`)
```css
background: var(--card);
border: 1px solid var(--line);
border-radius: var(--radius-lg);
padding: var(--pad);
box-shadow: var(--shadow-card);
overflow: hidden;
```

**Card header** (`.card-head`):
```css
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 18px;
gap: 24px;
```

**Card title** (`.card-title`):
```css
font-size: 11px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.12em;
color: var(--ink-3);
```

**Card lead** (`.card-lead`):
```css
font-family: var(--font-display);
font-size: 26px;
font-weight: 400;
letter-spacing: -0.02em;
color: var(--ink);
margin-top: 2px;
```

### Gradient Tiles (`.tile`)
```css
border-radius: var(--radius-lg);
padding: var(--pad);
min-height: 220px;
display: flex;
flex-direction: column;
justify-content: space-between;
box-shadow: var(--shadow-tile);
overflow: hidden;
position: relative;
isolation: isolate;

/* Add subtle noise texture */
&::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("...");
  opacity: 0.35;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 0;
}

/* Ensure all children sit above texture */
& > * { position: relative; z-index: 1; }
```

**Tile elements**:
- `.tile-lbl`: `font-size: 12px; font-weight: 600; text-transform: uppercase; opacity: 0.75;`
- `.tile-num`: `font-family: var(--font-display); font-size: 56–82px; letter-spacing: -0.03em;`
- `.tile-sub`: `font-size: 12.5px; opacity: 0.7;`
- `.tile-ico`: `width: 36px; height: 36px; border-radius: 12px; background: rgba(255,255,255,.5); backdrop-filter: blur(10px);`

### Chips (`.chip`)
```css
display: inline-flex;
align-items: center;
gap: 8px;
padding: 6px 12px;
border-radius: 999px;
background: #fff;
border: 1px solid var(--line);
font-size: 12px;
color: var(--ink-2);
box-shadow: var(--shadow-card);
```

Animated pulse variant:
```css
.chip .pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: oklch(0.72 0.15 150);  /* green */
  box-shadow: 0 0 0 4px rgba(188,232,207,.25);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  50% { box-shadow: 0 0 0 7px rgba(188,232,207,0); }
}
```

### Funnel Stages (`.stage`)
```css
display: grid;
grid-template-columns: 28px 1fr auto;
align-items: center;
gap: 14px;
padding: 14px 16px;
background: var(--bg-2);
border-radius: var(--radius-md);
border: 1px dashed var(--line-2);
position: relative;
```

**Stage elements**:
- `.stage-ico`: `width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center;`
- `.stage-name`: `font-size: 13.5px; font-weight: 600;`
- `.stage-sub`: `font-size: 11.5px; color: var(--ink-3);`
- `.stage-count`: `font-family: var(--font-display); font-size: 28px; letter-spacing: -0.02em;`

**Conversion % badge** (`.stage-count .pc`):
```css
font-family: var(--font-ui);
font-size: 11px;
font-weight: 600;
color: var(--ink-3);
margin-left: 6px;
background: #fff;
padding: 3px 7px;
border-radius: 999px;
border: 1px solid var(--line);
```

**Progress bar** (`.stage-bar`):
```css
grid-column: 1 / -1;
height: 6px;
border-radius: 999px;
background: var(--line);
overflow: hidden;
margin-top: 4px;

& > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-a), var(--accent-b));
  border-radius: inherit;
  width: 0–100%;
  transition: width 0.6s ease;
}
```

### Onboarding Steps (`.step`)
```css
display: flex;
align-items: center;
gap: 14px;
padding: 16px 0;
border-bottom: 1px dashed var(--line-2);

&:last-child { border-bottom: none; }
```

**Step number** (`.step-num`):
```css
width: 34px;
height: 34px;
border-radius: 50%;
background: var(--bg-2);
border: 1px solid var(--line);
display: grid;
place-items: center;
font-family: var(--font-display);
font-size: 17px;
color: var(--ink-2);
flex-shrink: 0;

.step.done & {
  background: linear-gradient(135deg, #B4EBD1, #9DDCE4);
  border-color: transparent;
  color: oklch(0.3 0.08 170);
}

.step.active & {
  background: linear-gradient(135deg, var(--accent-a), var(--accent-b));
  border-color: transparent;
  color: #fff;
}
```

**Step action** (`.step-action`):
```css
font-size: 12px;
font-weight: 600;
color: var(--ink-2);
padding: 8px 14px;
border-radius: 999px;
background: var(--bg-2);
border: 1px solid var(--line);
cursor: pointer;
white-space: nowrap;
flex-shrink: 0;
font-family: inherit;

.step.active & {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
}
```

### Hero Section (`.hero`)
```css
grid-column: span 2;
min-height: 320px;
background: var(--card);
border: 1px solid var(--line);
border-radius: var(--radius-lg);
padding: var(--pad);
display: flex;
gap: 28px;
align-items: stretch;
box-shadow: var(--shadow-card);
position: relative;
overflow: hidden;
```

**Hero left** (`.hero-left`):
```css
flex: 1;
display: flex;
flex-direction: column;
justify-content: space-between;
min-width: 0;
```

**Hero kicker** (`.hero-kicker`):
```css
display: flex;
align-items: center;
gap: 10px;
font-size: 11px;
letter-spacing: 0.14em;
text-transform: uppercase;
color: var(--ink-3);
font-weight: 600;

&::before {
  content: "";
  width: 22px;
  height: 1px;
  background: var(--ink-3);
  opacity: 0.5;
}
```

**Hero right** (`.hero-right`):
```css
width: 42%;
background: linear-gradient(160deg, #FFE6DC, #E6E4FF);
border-radius: calc(var(--radius-lg) - 8px);
position: relative;
overflow: hidden;
display: grid;
place-items: center;
```

### Floating Agent Orb (`.orb`)
```css
width: 140px;
height: 140px;
border-radius: 50%;
background: radial-gradient(circle at 30% 30%, #fff, #FFB8A3 55%, #E89AAA 100%);
box-shadow:
  0 20px 40px -10px rgba(232,154,170,.5),
  inset 0 -20px 40px rgba(255,255,255,.4),
  inset 0 20px 30px rgba(255,255,255,.6);
position: relative;
animation: float 5s ease-in-out infinite;

@keyframes float {
  50% { transform: translateY(-8px); }
}
```

**Orb rings** (`.orb-ring`):
```css
position: absolute;
inset: 0;
border: 1.5px dashed rgba(255,255,255,.8);
border-radius: 50%;
animation: spin 24s linear infinite;

&.r2 {
  inset: -20px;
  border-color: rgba(255,255,255,.5);
  border-style: dotted;
  animation-duration: 36s;
  animation-direction: reverse;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Empty State Illustration (`.ill`)
```css
width: 74px;
height: 74px;
border-radius: 22px;
background: linear-gradient(135deg, var(--accent-c), var(--accent-d));
position: relative;
box-shadow: 0 10px 24px -10px rgba(var(--accent-d) RGB, 0.6);
display: grid;
place-items: center;
color: oklch(0.3 0.06 260);
```

---

## Page Structure

### Top Bar (`.topbar`)
```css
position: sticky;
top: 0;
z-index: 20;
display: flex;
align-items: center;
justify-content: space-between;
padding: 20px 36px;
border-bottom: 1px solid var(--line);
background: color-mix(in oklab, var(--bg) 82%, transparent);
backdrop-filter: blur(10px);
```

**Logo** (`.logo`):
```css
font-family: var(--font-display);
font-weight: 400;
font-style: italic;
font-size: 30px;
letter-spacing: -0.03em;
color: var(--ink);
display: flex;
align-items: center;
gap: 10px;

&::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-a), var(--accent-b));
  box-shadow: 0 0 0 4px rgba(var(--accent-b) RGB, 0.18);
}
```

**Search** (`.search`):
```css
display: flex;
align-items: center;
gap: 10px;
padding: 9px 14px;
background: #fff;
border: 1px solid var(--line);
border-radius: 999px;
width: 320px;
color: var(--ink-3);
font-size: 13px;
box-shadow: var(--shadow-card);
```

### Shell (`.shell`)
```css
max-width: 1440px;
margin: 0 auto;
padding: 36px 36px 160px;  /* extra bottom for floating dock */
```

---

## Tweaks / Configuration

The design supports runtime tweaks via `[data-*]` attributes on the root element:

```html
<html data-accent="peach" data-cardstyle="soft" data-density="regular" data-font="editorial">
```

### `data-accent`
- `peach` (default) — warm coral
- `sky` — cool blue
- `mint` — green/teal
- `violet` — purple

### `data-cardstyle`
- `soft` (default) — shadow + border
- `flat` — minimal shadow, clean borders
- `glass` — frosted glass + backdrop blur

### `data-density`
- `compact` — tighter padding/gaps, smaller radius
- `regular` (default) — balanced
- `comfy` — generous padding/gaps

### `data-font`
- `editorial` (default) — Instrument Serif + Inter
- `modern` — Fraunces + Inter
- `classic` — DM Serif Display + Inter
- `mono` — JetBrains Mono + Inter (playful, technical)

---

## Icons

All icons are inline SVG, stroke-based. Use 14–18px viewBox="0 0 24 24" with `strokeWidth: 1.8–2`:

Common icons used:
- Search, bell, sparkle, clock, trend, inbox, document, calendar, target, send, check, gift, plug, arrow, plus

Replace with your icon library (Feather, Heroicons, etc.) if preferred. Keep the same sizing and weights.

---

## Animations

- **Button hover**: `transform: translateY(-1px)` (0.12s ease)
- **Pulse chip**: Opacity/glow animation (2s ease-in-out)
- **Floating orb**: Vertical translate (5s ease-in-out)
- **Spinning rings**: Full rotation (24s/36s linear)
- **Funnel bars**: Width transition (0.6s ease)

---

## Dark Mode (Future)

The system is designed for light mode. To add dark mode:
1. Create inverse color tokens (e.g. `--bg-dark: oklch(...)`)
2. Use CSS custom properties so a `[data-theme="dark"]` swap is trivial
3. Adjust shadow/backdrop values for dark backgrounds

---

## Accessibility Notes

- All buttons have visible focus states (hover transform + shadow)
- Text contrast meets WCAG AA (ink on bg ≥ 4.5:1)
- Interactive elements are ≥44px hit target
- Icons have `aria-label` or are paired with text
- Search input has `aria-label="Search jobs..."`

---

## Implementation Checklist

- [ ] Set up CSS custom properties (colors, spacing, radii)
- [ ] Import fonts (Instrument Serif, Inter, JetBrains Mono)
- [ ] Build card, button, chip, tile components
- [ ] Implement 3-column grid layout + responsive breakpoints
- [ ] Create funnel stage component with progress bars
- [ ] Build onboarding steps component (done/active/pending states)
- [ ] Style hero section + floating orb animation
- [ ] Add topbar with sticky positioning + blur
- [ ] Implement tweak system (data attributes or state) for accent/cardstyle/density/font
- [ ] Test responsive behavior (1080px, 720px breakpoints)
- [ ] Verify accessibility (contrast, focus states, hit targets)

---

**Questions?** Refer back to the prototype HTML file for exact rendering. This doc is the spec; the prototype is the reference.
