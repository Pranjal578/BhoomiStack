# BhoomiStack — Build Phases

**Version**: 1.0  
**Date**: 2026-09-15  
**Timeline**: 1-day sprint (~10–12 hours)

---

## Overview

The 1-day build is split into **5 phases**, ordered so that each phase produces a working, demo-able state. At any point after Phase 2, the project can be shown to judges.

```
Phase 1 (2h)   → Foundation: scaffold + synthetic data + backend
Phase 2 (2h)   → Map + Parcel: the core GIS experience
Phase 3 (2.5h) → Land Truth Engine + Verification
Phase 4 (2h)   → Officer Dashboards + Auth
Phase 5 (1.5h) → Document Intelligence + Polish + Docker
```

---

## Phase 1 — Foundation (2 hours)

**Goal**: Both servers running. APIs returning real data from SQLite.

### Tasks

#### 1.1 Synthetic Data Generation
- [ ] Write Python script `data/generate_parcels.py` to produce 500 synthetic parcels
  - District: Prayagraj, UP
  - 3 zones: Jhunsi village (rural), Naini (peri-urban), Civil Lines (urban)
  - Each parcel: ULPIN, khasra_no, area_gis, land_use, geometry (GeoJSON polygon)
  - Intentional inconsistencies in ~30% of parcels (area mismatch, zoning conflict)
  - ~10% high-risk parcels (disputes, encumbrances, satellite change flags)
- [ ] Output: `backend/app/seed/parcels.geojson`

#### 1.2 Backend Scaffold
- [ ] `python -m venv venv && pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib qrcode`
- [ ] `backend/app/database.py` — SQLAlchemy engine + session + Base
- [ ] `backend/app/models.py` — all 10 ORM models per architecture.md schema
- [ ] `backend/app/schemas.py` — all Pydantic request/response schemas
- [ ] `backend/app/main.py` — FastAPI app, CORS, router registration

#### 1.3 Seed Script
- [ ] `backend/app/seed/seed.py`:
  - Creates all tables
  - Loads `parcels.geojson` → inserts parcel records
  - Generates synthetic owners (200 unique owners)
  - Generates ownership_records, registrations, encumbrances, property_tax, utilities
  - Creates 5 demo users (one per role)
  - Creates building_permissions, land_use_records, disputes

#### 1.4 Core API Routes (all returning data)
- [ ] `GET /api/v1/parcels/geojson` — FeatureCollection of all parcels
- [ ] `GET /api/v1/parcels/search?q=` — search by ULPIN/khasra/name
- [ ] `GET /api/v1/parcels/{ulpin}` — single parcel detail
- [ ] `GET /api/v1/parcels/{ulpin}/ownership`
- [ ] `GET /api/v1/parcels/{ulpin}/registrations`
- [ ] `GET /api/v1/parcels/{ulpin}/encumbrances`
- [ ] `GET /api/v1/parcels/{ulpin}/planning`
- [ ] `GET /api/v1/parcels/{ulpin}/buildings`
- [ ] `GET /api/v1/parcels/{ulpin}/tax`
- [ ] `GET /api/v1/parcels/{ulpin}/disputes`
- [ ] `GET /api/v1/parcels/{ulpin}/utilities`
- [ ] `POST /api/v1/auth/login`

#### 1.5 Frontend Scaffold
- [ ] `cd frontend && npm create vite@latest . -- --template react-ts`
- [ ] Install: `tailwindcss postcss autoprefixer react-router-dom zustand axios maplibre-gl recharts lucide-react qrcode.react`
- [ ] Configure Tailwind, set up BhoomiStack design tokens in `tailwind.config.ts`
- [ ] Set up `src/api/client.ts` (axios instance)
- [ ] Set up `src/types/index.ts` (all TypeScript interfaces)
- [ ] Set up `src/store/` (parcelStore, authStore, uiStore)
- [ ] Set up React Router with all page routes

**Phase 1 Exit Criteria**:
- `uvicorn` running at `localhost:8000`, `/api/docs` shows all endpoints
- `npm run dev` starts at `localhost:5173` without errors
- `GET /api/v1/parcels/geojson` returns 500 features

---

## Phase 2 — Map + Parcel Dashboard (2 hours)

**Goal**: The core GIS experience — map with clickable parcels, full dashboard.

### Tasks

#### 2.1 Citizen Home Page
- [ ] Hero section: BhoomiStack logo, tagline, animated search bar
- [ ] Search input with autocomplete (ULPIN / Khasra / owner name)
- [ ] Quick stats ticker: "48,215 Parcels · 41,842 Verified · 761 Anomalies"
- [ ] CTA buttons: "View Map", "Verify Land", "Document Check"
- [ ] Background: subtle animated gradient/particle effect

#### 2.2 Cadastral Map
- [ ] MapLibre GL canvas, satellite/vector base layer
- [ ] Load GeoJSON from `GET /api/v1/parcels/geojson`
- [ ] Render parcel polygons with risk-level color:
  - Green (`#10b981`) → LOW risk (verified)
  - Amber (`#f59e0b`) → MEDIUM risk (attention)
  - Red (`#ef4444`) → HIGH risk
  - Blue (`#3b82f6`) → Government land
- [ ] Hover → highlight parcel + show tooltip (ULPIN, area, land_use)
- [ ] Click → open parcel dashboard side panel
- [ ] Layer toggles: Parcel Boundaries, Land Use, Risk Heatmap
- [ ] Map controls: zoom, compass, fullscreen
- [ ] Search bar on map (same search as home)

#### 2.3 Parcel Dashboard (Side Panel)
9 tabs, all populated from API:

**Tab 1: Overview**
- ULPIN badge (prominent, copyable)
- Khasra No, Village, District, Tehsil
- Area (GIS): formatted in hectares
- Land Use badge (color coded)
- Land Type (Private / Government / Forest)
- Data Confidence Score (animated percentage ring)
- Risk Score badge
- Map thumbnail of the selected parcel

**Tab 2: Ownership**
- Current owner(s): name, share, ownership type
- Ownership timeline (visual chain)
- Last mutation date

**Tab 3: Registration**
- Deed history table: doc_no, type, date, seller, buyer, area, amount
- Latest deed highlighted

**Tab 4: Planning**
- Zoning code, Master Plan reference
- Current vs Permitted use (visual comparison)
- Zoning conflict alert if applicable

**Tab 5: Buildings**
- Building permission cards: app_no, type, floors, status badge
- Status: APPROVED (green) / PENDING (amber) / REJECTED (red)

**Tab 6: Tax**
- Annual tax amount (₹ formatted)
- Assessed area (vs GIS area)
- Payment status badge
- Last 3 years assessment history

**Tab 7: Utilities**
- Grid of utility icons: Water, Electricity, Sewage, Gas
- Each: provider, connection_id, status badge

**Tab 8: Documents**
- Placeholder for document upload (links to Document Intelligence page)
- List of associated documents (mock)

**Tab 9: History**
- Chronological audit timeline for this parcel
- Each event: icon, description, actor, timestamp

**Phase 2 Exit Criteria**:
- Map loads in < 3s with all 500 parcels
- Clicking any parcel opens dashboard with all 9 tabs
- All tabs show real API data

---

## Phase 3 — Land Truth Engine + Verification (2.5 hours)

**Goal**: The flagship features — anomaly detection + verification certificate.

### Tasks

#### 3.1 Land Truth Engine Backend
- [ ] `backend/app/services/land_truth_engine.py` — full scoring algorithm
- [ ] `GET /api/v1/parcels/{ulpin}/land-truth` router
- [ ] Returns: `{ risk_score, risk_level, flags[], area_comparison{}, recommendations[] }`

#### 3.2 Land Truth Engine UI
- [ ] "Land Truth" button on parcel dashboard (prominent, pulsing for high-risk parcels)
- [ ] Loading animation: "Cross-checking 8 data sources..."
- [ ] **Area Comparison Panel**:
  ```
  GIS Area         0.84 ha  ████████████████ (baseline)
  RoR Area         0.72 ha  ██████████████   ⚠ -0.12 ha (14.3%)
  Registration     0.84 ha  ████████████████ ✓ Match
  Property Tax     0.80 ha  ███████████████  ⚠ -0.04 ha (4.8%)
  ```
- [ ] **Risk Score Gauge**: animated dial 0–100 with color zones
- [ ] **Flag Cards**: each flag is a collapsible card with:
  - Severity badge (HIGH/MEDIUM/LOW)
  - Title and description
  - Recommended action
- [ ] **Recommendations** section: numbered actionable items
- [ ] "Generate Inspection Case" button (for officers, creates audit log entry)

#### 3.3 Verification Flow
- [ ] `POST /api/v1/parcels/{ulpin}/verify` — runs 10 checks, returns report + verification_id
- [ ] `GET /api/v1/verify/{verification_id}` — public endpoint to validate a certificate
- [ ] Backend generates: unique verification_id `LV-2026-XXXXXX`, QR code (base64 PNG)

- [ ] **Frontend Verification Flow** (step-by-step animation):
  ```
  ✓ Parcel exists in GIS registry         ← animated checkmark
  ✓ ULPIN is valid and registered
  ✓ RoR record available
  ✓ Owner information on record
  ✓ Registration record found
  ✓ No active dispute detected
  ✓ No mortgage/lien detected
  ✓ Land use verified
  ✓ Building permission checked
  ⚠ Minor area discrepancy noted          ← amber warning
  ```
- [ ] **Verification Certificate UI**:
  - ULPIN, status (VERIFIED / PARTIALLY VERIFIED / FLAGGED)
  - Owner name, area, land use, encumbrance status, dispute status
  - Verification ID (formatted)
  - QR code (renders from base64)
  - "Download Certificate" button (triggers window.print())
  - "Share" button (copies verification URL)

**Phase 3 Exit Criteria**:
- Land Truth Engine returns risk scores for all parcels
- At least one parcel (UP-PRY-001245) shows area mismatch + risk score ≥ 75
- Verification flow animates through 10 checks
- Certificate renders with QR code
- QR scan URL works (navigates to verification details)

---

## Phase 4 — Officer Dashboards + Auth (2 hours)

**Goal**: Role-based dashboards that show the system serves multiple departments.

### Tasks

#### 4.1 Authentication
- [ ] Login page: clean, professional form with role selector (demo mode shows role pills)
- [ ] 5 demo accounts: citizen / revenue_officer / planning_officer / municipal_officer / admin
- [ ] JWT stored in localStorage (with expiry handling)
- [ ] Auth store in Zustand
- [ ] Protected route wrapper `<ProtectedRoute roles={[...]}>`
- [ ] Role badge in navbar
- [ ] Logout clears token and redirects

#### 4.2 Revenue Officer Dashboard
- [ ] **KPI Bar**: Total Parcels | Verified | Pending Mutations | Disputed | Anomalies
- [ ] **Risk Map**: same cadastral map but with anomaly overlay
  - Risk heatmap toggle
  - Officer can click parcel → see full record + Land Truth result
- [ ] **Anomaly Queue**: sortable table of high-risk parcels
  - Columns: ULPIN, Village, Risk Score, Primary Flag, Last Updated, Action
  - "Review" action → opens parcel
- [ ] **Mutation Pending** list: parcels with pending mutation applications
- [ ] **Area Trend Chart**: weekly anomaly counts (bar chart, Recharts)

#### 4.3 Urban Planning Officer Dashboard
- [ ] **Land Use Distribution**: donut chart (Residential/Commercial/Agricultural/Government)
- [ ] **Zoning Conflict List**: parcels where current_use ≠ permitted_use
- [ ] **Building Permit Queue**: pending approvals with area info
- [ ] **Unauthorized Construction**: parcels with satellite change flag + no building permit

#### 4.4 Municipal Officer Dashboard
- [ ] **Tax Coverage**: pie chart (Paid/Pending/Overdue)
- [ ] **Tax Collection Summary**: total assessed, collected, outstanding (₹)
- [ ] **Utility Coverage by Zone**: Jhunsi / Naini / Civil Lines coverage %
- [ ] **Infrastructure Proximity**: bar chart (parcels within 100m of road/school/hospital)

#### 4.5 Admin Panel
- [ ] User management table: name, role, department, last login, status toggle
- [ ] Audit Log viewer: filterable by actor, action, ULPIN, date range
- [ ] System health: DB size, record counts per table

**Phase 4 Exit Criteria**:
- Login → role-appropriate dashboard
- Revenue dashboard shows real counts from DB
- Switching to `/dashboard/planning` shows planning-specific charts
- Audit log shows all previous verify + land-truth calls from this session

---

## Phase 5 — Document Intelligence + Polish + Docker (1.5 hours)

**Goal**: Final feature + production-ready packaging.

### Tasks

#### 5.1 Document Intelligence
- [ ] `POST /api/v1/documents/analyze` backend endpoint
  - Accepts: `{ ulpin, document_type }` (simulates document upload)
  - Returns: `{ extracted_fields[], match_results[], confidence_scores{} }`
  - Simulated OCR: returns plausible extracted values with ±10% noise on area
  - Matching: compares extracted vs. live parcel record field-by-field

- [ ] **Frontend UI**:
  - Upload zone (drag-and-drop, accepts PDF/JPG, simulated)
  - "Analyzing document..." spinner (2s delay for realism)
  - **Extracted Fields Panel** (left):
    ```
    Owner Name        Pranjal Kumar        95% confidence
    Khasra No         125/2                98% confidence
    Area              0.84 ha              91% confidence
    Village           Jhunsi               99% confidence
    Registration No   REG-2024-001245      88% confidence
    Date              15 Sep 2024          96% confidence
    ```
  - **Match Results Panel** (right):
    ```
    Owner Name        ✓ MATCH
    Khasra No         ✓ MATCH
    Area              ⚠ MISMATCH  (Doc: 0.84 ha vs RoR: 0.72 ha)
    Village           ✓ MATCH
    Registration No   ✓ MATCH
    Date              ✓ MATCH
    ```
  - Overall document authenticity score + recommendation

#### 5.2 UI Polish
- [ ] Responsive layout (mobile-friendly at 768px+)
- [ ] Loading skeletons for all async data loads
- [ ] Toast notifications for: verification complete, error states, copy actions
- [ ] Smooth page transitions (fade)
- [ ] Empty states: "No records found" illustrations
- [ ] 404 page

#### 5.3 Docker
- [ ] `docker/Dockerfile.backend` — Python 3.11 slim + pip install + seed on startup
- [ ] `docker/Dockerfile.frontend` — Node 20 build + nginx serve
- [ ] `docker/docker-compose.yml` — frontend:5173, backend:8000, shared network
- [ ] `README.md` with: one-command launch (`docker-compose up`)

**Phase 5 Exit Criteria**:
- Document Intelligence shows field-level match/mismatch
- `docker-compose up` launches full stack from scratch
- `README.md` documents the full demo walkthrough

---

## Demo Scenario (for judges)

Follow this sequence. Takes ~8 minutes.

1. **[00:00]** Open home page → search `UP-PRY-001245` → parcel highlights on map
2. **[01:00]** Click parcel → dashboard opens → scroll through 9 tabs
3. **[03:00]** Click "Land Truth Engine" → watch scoring animation → area mismatch flag
4. **[04:30]** Click "Verify Land" → 10-check animation → certificate with QR
5. **[05:30]** Switch role to Revenue Officer → login → dashboard with anomaly queue
6. **[06:30]** Parcel UP-PRY-001245 appears in anomaly queue → click → full record
7. **[07:00]** Go to Document Intelligence → upload "mock deed" → field match results
8. **[07:45]** Show Admin → Audit Log → every action from this session is logged

---

## Risk Log

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MapLibre slow with 500 polygons | LOW | HIGH | Cluster parcels, use tile layer |
| SQLite performance issues | LOW | MED | Index on `ulpin` column |
| QR code library issues | LOW | LOW | Fallback to text verification ID |
| Time overrun on Phase 5 | MED | LOW | Docker is optional for demo; skip if needed |
| Seed data inconsistency | LOW | HIGH | Generate and validate seed script first |
