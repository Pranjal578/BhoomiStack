# BhoomiStack — Design System

**Version**: 1.0  
**Date**: 2026-09-15

---

## 1. Design Philosophy

BhoomiStack is a **government-grade, professional data platform** with the visual quality of a modern SaaS product. The design must:

- Feel **authoritative and trustworthy** (this is land ownership data)
- Feel **modern and premium** (not like a legacy government portal)
- Present **complex data clearly** (geospatial, tabular, risk indicators)
- Work in **high-ambient-light environments** (government offices)

**Design keywords**: Clean · Precise · Confident · Data-dense · Trustworthy

---

## 2. Color System

### Brand Palette
```
Primary:      #1a56db   (deep blue — authority, trust)
Primary Dark: #1e40af   (hover/active)
Accent:       #7c3aed   (violet — innovation, tech)
Background:   #f8fafc   (off-white)
Surface:      #ffffff   (cards, panels)
Dark BG:      #0f172a   (map overlay, dark panels)
```

### Semantic Colors (Risk System)
```
Verified / Safe:   #10b981  (emerald-500)
Warning / Medium:  #f59e0b  (amber-500)
High Risk / Alert: #ef4444  (red-500)
Government Land:   #3b82f6  (blue-500)
Neutral:           #6b7280  (gray-500)
```

### Text Colors
```
Primary text:    #0f172a  (slate-900)
Secondary text:  #475569  (slate-600)
Muted text:      #94a3b8  (slate-400)
On-dark text:    #f8fafc  (slate-50)
Link:            #1a56db
```

### Map Layer Colors
```
Parcel fill (verified):  rgba(16, 185, 129, 0.15)   stroke: #10b981
Parcel fill (medium):    rgba(245, 158, 11, 0.15)   stroke: #f59e0b
Parcel fill (high risk): rgba(239, 68, 68, 0.15)    stroke: #ef4444
Parcel fill (govt):      rgba(59, 130, 246, 0.15)   stroke: #3b82f6
Parcel fill (selected):  rgba(124, 58, 237, 0.2)    stroke: #7c3aed  stroke-width: 3
```

---

## 3. Typography

### Font Stack
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

font-family: 'Inter', -apple-system, sans-serif;         /* Body */
font-family: 'Space Grotesk', 'Inter', sans-serif;        /* Headings, brand */
font-family: 'JetBrains Mono', 'Courier New', monospace;  /* ULPIN, codes, data */
```

### Type Scale
```
Display:   Space Grotesk 700  48px  line-height: 1.1   (hero heading)
H1:        Space Grotesk 700  36px  line-height: 1.2
H2:        Space Grotesk 600  28px  line-height: 1.3
H3:        Inter 600          20px  line-height: 1.4
H4:        Inter 600          16px  line-height: 1.5
Body:      Inter 400          15px  line-height: 1.6
Small:     Inter 400          13px  line-height: 1.5
Mono:      JetBrains Mono 500 13px  line-height: 1.5   (ULPINs, codes)
Label:     Inter 500          11px  UPPERCASE + letter-spacing: 0.08em
```

---

## 4. Spacing System

Uses Tailwind defaults (4px base unit):
```
xs:  4px   (p-1)
sm:  8px   (p-2)
md:  12px  (p-3)
lg:  16px  (p-4)
xl:  24px  (p-6)
2xl: 32px  (p-8)
3xl: 48px  (p-12)
4xl: 64px  (p-16)
```

---

## 5. Component Library

### 5.1 ULPIN Badge
```
Background: #1e3a8a (blue-900)
Text: #bfdbfe (blue-200) — JetBrains Mono
Padding: 6px 12px
Border-radius: 6px
Border: 1px solid #3b82f6
```
Usage: Always display ULPIN in this badge, never as plain text.

### 5.2 Risk Level Badge
```
LOW:    bg-emerald-100 text-emerald-800 border-emerald-200
MEDIUM: bg-amber-100   text-amber-800   border-amber-200
HIGH:   bg-red-100     text-red-800     border-red-200
```
Shape: pill (rounded-full), padding: px-3 py-1, text-xs font-semibold

### 5.3 Land Use Badge
```
Agricultural:  bg-lime-100    text-lime-800
Residential:   bg-blue-100    text-blue-800
Commercial:    bg-purple-100  text-purple-800
Industrial:    bg-orange-100  text-orange-800
Government:    bg-slate-100   text-slate-800
Forest:        bg-green-100   text-green-800
```

### 5.4 Status Badge
```
VERIFIED / APPROVED / PAID / ACTIVE:    bg-emerald-500 text-white
PENDING / IN_PROGRESS:                  bg-amber-500   text-white
REJECTED / OVERDUE / HIGH_RISK:         bg-red-500     text-white
RELEASED / RESOLVED / HISTORICAL:       bg-gray-400    text-white
```

### 5.5 Cards
```css
.data-card {
  background: white;
  border: 1px solid #e2e8f0;  /* slate-200 */
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
.data-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
}
```

### 5.6 KPI Cards
```
Large number:  Space Grotesk 700 40px  text-slate-900
Label:         Inter 500 12px UPPERCASE text-slate-500
Delta/change:  Inter 500 13px  green (up) / red (down) with arrow icon
Background:    gradient or solid per department color
```

### 5.7 Risk Score Gauge
```
Arc-style SVG gauge (180° semicircle)
0–30:   stroke #10b981
31–60:  stroke #f59e0b
61–100: stroke #ef4444
Center text: Space Grotesk 700 48px
Label: "Risk Score" Inter 500 12px
```

### 5.8 Tab Navigation (Parcel Dashboard)
```
Container: border-b border-slate-200
Tab item: px-4 py-3 text-sm font-medium
Active:   text-primary-600 border-b-2 border-primary-600
Inactive: text-slate-500 hover:text-slate-700
```

### 5.9 Flag/Alert Cards (Land Truth Engine)
```
HIGH severity:
  border-l: 4px solid #ef4444
  bg: #fef2f2
  header text: #991b1b

MEDIUM severity:
  border-l: 4px solid #f59e0b
  bg: #fffbeb
  header text: #92400e

LOW severity:
  border-l: 4px solid #6b7280
  bg: #f9fafb
  header text: #374151
```

### 5.10 Timeline (History Tab)
```
Vertical line: 2px solid #e2e8f0
Node circle: 32px, colored by event type
  - Owner change: blue circle
  - Registration: green circle
  - Dispute: red circle
  - Mutation: amber circle
  - Verification: emerald circle
Content card: white, border, shadow-sm
```

### 5.11 Verification Certificate
```
Container: max-w-2xl, white, border, print-friendly
Header: BhoomiStack logo + "LAND VERIFICATION REPORT" UPPERCASE
ULPIN: prominent, centered
Status ribbon: full-width colored bar (VERIFIED=green, FLAGGED=amber)
Fields: two-column grid
Footer: QR code (right) + verification ID (left)
Print styles: hide nav, show full certificate
```

---

## 6. Layout System

### Page Structure
```
┌─────────────────────────────────────────────┐
│  Navbar (64px fixed)                        │
├─────────────────────────────────────────────┤
│                                             │
│  Page Content                               │
│  (calc(100vh - 64px))                       │
│                                             │
└─────────────────────────────────────────────┘
```

### Map + Panel Layout
```
┌──────────────────────────┬───────────────────┐
│                          │                   │
│   Map Canvas             │  Parcel Dashboard │
│   (flex: 1)              │  (420px fixed)    │
│                          │  (overflow-y: auto│
│                          │   max-h: 100%)    │
└──────────────────────────┴───────────────────┘
```

### Dashboard Layout
```
┌─────────────────────────────────────────────┐
│  Page title + breadcrumb + date range       │
├───────────┬───────────┬──────────┬──────────┤
│  KPI Card │  KPI Card │ KPI Card │ KPI Card │
├───────────┴───────────┴──────────┴──────────┤
│                                   │         │
│  Large Chart (2/3 width)          │ Sidebar │
│                                   │         │
├───────────────────────────────────┤  widget │
│  Data Table (full width)          │         │
└───────────────────────────────────┴─────────┘
```

---

## 7. Navbar

```
┌────────────────────────────────────────────────────────────┐
│  🗺 BhoomiStack      Map  Verify  Dashboard  Docs          │
│                                                    [Role Badge] [User] │
└────────────────────────────────────────────────────────────┘
```

- Background: `#0f172a` (dark)
- Logo: Space Grotesk 700 white + accent color dot
- Nav links: Inter 500 text-slate-300 hover:text-white
- Active: text-white with bottom accent border
- Role badge: colored by department (Revenue=blue, Planning=purple, Municipal=green)

---

## 8. Animations & Micro-interactions

### Page Load
- Fade in + slide up: `opacity: 0→1, translateY: 12px→0, duration: 300ms ease-out`

### Verification Steps
- Each step: stagger 400ms apart
- Checkmark: draw-on SVG animation, 200ms
- Alert icon: shake + pulse for warnings

### Risk Score Gauge
- Arc draw animation from 0 to final score: 1s ease-out
- Score counter: count-up animation

### Land Truth Engine Loading
- Scanning animation: pulsing dots + "Analyzing..." text cycling
- "Checking GIS records..." → "Comparing RoR data..." → "Validating registrations..."

### Map Parcel Selection
- Selected parcel: glow pulse on outline
- Dashboard panel: slide-in from right, 250ms ease-out

### KPI Cards
- Number count-up on dashboard load
- Subtle pulse on anomaly counts

### Hover Effects
- Cards: `translateY(-2px)` + shadow increase
- Buttons: `scale(1.02)` + brightness increase
- Nav links: underline slide-in from left

---

## 9. Iconography

Use **Lucide React** exclusively. Consistent icon sizes:
- Navigation: 20px
- In-line with text: 16px
- Feature icons (cards): 24px
- Hero/empty state: 48px

### Icon Assignments
```
Map:              MapPin
Parcel:           Square
Owner:            User / Users
Registration:     FileText
Planning:         LayoutGrid
Building:         Building2
Tax:              Receipt
Utilities:        Zap (electricity), Droplets (water)
Dispute:          AlertTriangle
Land Truth:       ScanSearch / ShieldCheck
Verification:     BadgeCheck
High Risk:        AlertCircle (red)
Medium Risk:      AlertTriangle (amber)
Low Risk:         CheckCircle2 (green)
Audit:            History
Admin:            Settings
Export/Download:  Download
Copy:             Copy
QR:               QrCode
Search:           Search
Filter:           SlidersHorizontal
```

---

## 10. Responsive Breakpoints

```
Mobile:  < 768px   (basic citizen view, map fullscreen, no side panel)
Tablet:  768–1024px  (narrower side panel, 420px→320px)
Desktop: 1024–1440px (full layout)
Large:   > 1440px  (wider dashboard, 3-column KPI grids)
```

---

## 11. Data Visualization Conventions (Recharts)

- **Colors**: always use risk/status semantic colors
- **Grid lines**: subtle (`#f1f5f9`)
- **Axis text**: Inter 12px `#94a3b8`
- **Tooltips**: white card, shadow-md, border-slate-200
- **Animations**: `isAnimationActive={true}` always on
- **Empty data**: show placeholder chart with "No data available" overlay

### Chart Type Guide
```
Anomaly over time:  LineChart (continuous trend)
Land use split:     PieChart / RadialBar
KPI comparison:     BarChart (grouped)
Risk distribution:  AreaChart
Coverage (%):       RadialBarChart or progress bars
```

---

## 12. Print / Certificate Styles

For the Verification Certificate page:
```css
@media print {
  .no-print { display: none; }
  .certificate {
    width: 210mm;
    min-height: 148mm;
    padding: 20mm;
    border: 2px solid #1a56db;
  }
}
```
