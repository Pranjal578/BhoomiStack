# BhoomiStack — System Architecture

**Version**: 1.0  
**Date**: 2026-09-15

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│                                                              │
│   ┌─────────────────────┐    ┌──────────────────────────┐   │
│   │   Citizen Portal    │    │   Officer Dashboards     │   │
│   │  React + MapLibre   │    │  Revenue / Planning /    │   │
│   │  (port 5173)        │    │  Municipal / Admin       │   │
│   └──────────┬──────────┘    └─────────────┬────────────┘   │
└──────────────┼──────────────────────────────┼───────────────┘
               │  REST + JSON                  │
               ▼                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│                                                              │
│              FastAPI  (port 8000)                            │
│        CORS · JWT Auth · RBAC Middleware                     │
│           OpenAPI docs at /api/docs                          │
└──────────────────────────┬───────────────────────────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
      ▼                    ▼                    ▼
┌──────────┐        ┌──────────┐        ┌──────────┐
│  Parcel  │        │  Gov.    │        │  Service │
│  Module  │        │  Record  │        │  Layer   │
│          │        │  Modules │        │          │
│ parcels  │        │ownership │        │ taxation │
│ search   │        │registrat.│        │utilities │
│ geojson  │        │planning  │        │disputes  │
│ verify   │        │buildings │        │audit     │
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │
     └───────────────────┼───────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│                                                              │
│   SQLite (prototype)  ←→  PostgreSQL + PostGIS (production)  │
│                                                              │
│   Tables: parcels, owners, ownership_records, registrations, │
│   encumbrances, building_permissions, land_use_records,      │
│   disputes, property_tax, utilities, audit_logs, users       │
└──────────────────────────────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
         ┌───────────┐     ┌───────────┐
         │ Land Truth│     │  GeoJSON  │
         │  Engine   │     │  Store    │
         │(rule-based│     │(500 parcel│
         │ scoring)  │     │ polygons) │
         └───────────┘     └───────────┘
```

---

## 2. Repository Structure

```
BhoomiStack/
│
├── PRD.md                    # Product Requirements Document
├── architecture.md           # This file
├── rules.md                  # Coding conventions
├── phases.doc.md             # Build phases
├── design.md                 # UI/UX design system
├── memory.md                 # Dev log / decisions
│
├── frontend/                 # React + Vite + TypeScript
│   ├── public/
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # Shared UI components
│   │   │   ├── map/          # MapLibre components
│   │   │   ├── parcel/       # Parcel dashboard tabs
│   │   │   ├── land-truth/   # Land Truth Engine UI
│   │   │   ├── verification/ # Verification flow + certificate
│   │   │   └── shared/       # Buttons, cards, badges, etc.
│   │   ├── pages/
│   │   │   ├── CitizenHome.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── ParcelDashboard.tsx
│   │   │   ├── LandTruth.tsx
│   │   │   ├── Verification.tsx
│   │   │   ├── DocumentIntelligence.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── RevenueDashboard.tsx
│   │   │   │   ├── PlanningDashboard.tsx
│   │   │   │   └── MunicipalDashboard.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   └── Login.tsx
│   │   ├── store/            # Zustand state stores
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Helpers, formatters
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                  # FastAPI
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── database.py       # SQLAlchemy + SQLite setup
│   │   ├── models.py         # ORM models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth/
│   │   │   ├── jwt.py
│   │   │   └── rbac.py
│   │   ├── routers/
│   │   │   ├── parcels.py
│   │   │   ├── ownership.py
│   │   │   ├── registration.py
│   │   │   ├── encumbrances.py
│   │   │   ├── planning.py
│   │   │   ├── buildings.py
│   │   │   ├── taxation.py
│   │   │   ├── disputes.py
│   │   │   ├── utilities.py
│   │   │   ├── verification.py
│   │   │   ├── land_truth.py
│   │   │   ├── documents.py
│   │   │   ├── dashboard.py
│   │   │   └── audit.py
│   │   ├── services/
│   │   │   ├── land_truth_engine.py   # Risk scoring logic
│   │   │   ├── verification_service.py
│   │   │   ├── qr_service.py
│   │   │   └── document_service.py    # Simulated OCR
│   │   └── seed/
│   │       ├── seed.py
│   │       └── parcels.geojson        # 500 synthetic parcels
│   ├── requirements.txt
│   └── run.py
│
└── docker/
    ├── docker-compose.yml
    ├── Dockerfile.frontend
    └── Dockerfile.backend
```

---

## 3. Data Flow — Parcel Dashboard Load

```
User clicks parcel on map
        │
        ▼
Frontend dispatches: selectParcel(ulpin)
        │
        ▼
Parallel API calls:
  GET /api/v1/parcels/{ulpin}
  GET /api/v1/parcels/{ulpin}/ownership
  GET /api/v1/parcels/{ulpin}/registrations
  GET /api/v1/parcels/{ulpin}/planning
  GET /api/v1/parcels/{ulpin}/land-truth
        │
        ▼
Zustand store: parcelStore.setActiveParcel(data)
        │
        ▼
ParcelDashboard renders with all tabs
```

---

## 4. Data Flow — Land Truth Engine

```
GET /api/v1/parcels/{ulpin}/land-truth
        │
        ▼
land_truth_engine.py
  1. Fetch: gis_area, ror_area, reg_area, tax_area
  2. Fetch: mutation_history, transaction_count
  3. Fetch: land_use (plan vs permit)
  4. Fetch: active_encumbrances, active_disputes
  5. Fetch: satellite_change_flag
        │
        ▼
Score computation:
  score = 0
  if |gis_area - ror_area| / gis_area > 0.02: score += 25
  if |gis_area - tax_area| / gis_area > 0.05: score += 20
  if recent_mutation: score += 15
  if transaction_count > 3: score += 15
  if land_use_conflict: score += 20
  if active_encumbrance: score += 10
  if active_dispute: score += 30
  if satellite_change: score += 25
        │
        ▼
Return: { risk_score, risk_level, flags[], recommendations[] }
```

---

## 5. Authentication & RBAC

```
POST /api/v1/auth/login
  { email, password, role }
        │
        ▼
JWT payload: { sub, role, exp }
        │
        ▼
Protected routes: Authorization: Bearer <token>
        │
        ▼
RBAC middleware checks:
  role_permissions = {
    "citizen": ["parcel:read", "verification:request"],
    "revenue_officer": ["parcel:read", "parcel:write", "ror:write", "mutation:approve"],
    "registration_officer": ["parcel:read", "registration:write"],
    "planning_officer": ["parcel:read", "planning:write", "building:write"],
    "municipal_officer": ["parcel:read", "tax:write", "utility:write"],
    "admin": ["*"]
  }
```

---

## 6. API Contract

### Base URL
- Development: `http://localhost:8000`
- API Prefix: `/api/v1`
- Docs: `/api/docs`

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | None | Get JWT token |
| GET | `/parcels/geojson` | None | All parcels as GeoJSON FeatureCollection |
| GET | `/parcels/search` | None | ?q=khasra_or_ulpin_or_name |
| GET | `/parcels/{ulpin}` | None | Full parcel record |
| GET | `/parcels/{ulpin}/ownership` | None | Ownership chain |
| GET | `/parcels/{ulpin}/registrations` | None | Deed history |
| GET | `/parcels/{ulpin}/encumbrances` | None | Mortgages/liens |
| GET | `/parcels/{ulpin}/planning` | None | Zoning + master plan |
| GET | `/parcels/{ulpin}/buildings` | None | Building permissions |
| GET | `/parcels/{ulpin}/tax` | None | Property tax records |
| GET | `/parcels/{ulpin}/disputes` | None | Dispute records |
| GET | `/parcels/{ulpin}/utilities` | None | Utility connections |
| GET | `/parcels/{ulpin}/land-truth` | JWT | Risk + validation report |
| POST | `/parcels/{ulpin}/verify` | None | Generate verification report |
| GET | `/parcels/{ulpin}/change-analysis` | JWT | Satellite change simulation |
| POST | `/documents/analyze` | JWT | Simulated OCR + field match |
| GET | `/dashboard/revenue` | JWT (officer) | Revenue KPIs |
| GET | `/dashboard/planning` | JWT (officer) | Planning KPIs |
| GET | `/dashboard/municipal` | JWT (officer) | Municipal KPIs |
| GET | `/audit-logs` | JWT (admin) | Audit trail with filters |
| GET | `/users` | JWT (admin) | User list |

### Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-09-15T14:47:00Z",
  "version": "1.0"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "PARCEL_NOT_FOUND",
    "message": "Parcel UP-PRY-001245 does not exist",
    "status": 404
  }
}
```

---

## 7. Database Schema

### `parcels`
```sql
CREATE TABLE parcels (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin         TEXT UNIQUE NOT NULL,          -- UP-PRY-001245
  khasra_no     TEXT NOT NULL,                 -- 125/2
  state         TEXT DEFAULT 'Uttar Pradesh',
  district      TEXT DEFAULT 'Prayagraj',
  tehsil        TEXT,
  village       TEXT,
  area_gis      REAL,                          -- hectares (GIS ground truth)
  land_use      TEXT,                          -- Agricultural/Residential/Commercial
  land_type     TEXT,                          -- Private/Government/Forest
  geometry      TEXT,                          -- GeoJSON polygon (JSON string)
  risk_score    INTEGER DEFAULT 0,
  risk_level    TEXT DEFAULT 'LOW',
  satellite_change_flag INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### `owners`
```sql
CREATE TABLE owners (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  aadhaar_hash  TEXT,                          -- hashed, never store raw
  mobile        TEXT,
  email         TEXT
);
```

### `ownership_records`
```sql
CREATE TABLE ownership_records (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin          TEXT REFERENCES parcels(ulpin),
  owner_id       INTEGER REFERENCES owners(id),
  ownership_type TEXT,                         -- Sole/Joint/Inherited
  share          REAL DEFAULT 1.0,             -- fraction 0-1
  area_ror       REAL,                         -- area per RoR (may differ from GIS)
  valid_from     TEXT,
  valid_to       TEXT,
  status         TEXT DEFAULT 'ACTIVE'         -- ACTIVE/HISTORICAL
);
```

### `registrations`
```sql
CREATE TABLE registrations (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin            TEXT REFERENCES parcels(ulpin),
  document_no      TEXT UNIQUE,
  transaction_type TEXT,                       -- Sale/Gift/Mortgage/Partition
  transaction_date TEXT,
  seller           TEXT,
  buyer            TEXT,
  area_registered  REAL,
  amount           REAL,
  status           TEXT DEFAULT 'REGISTERED'
);
```

### `encumbrances`
```sql
CREATE TABLE encumbrances (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin         TEXT REFERENCES parcels(ulpin),
  type          TEXT,                          -- Mortgage/Lien/Charge
  institution   TEXT,
  amount        REAL,
  start_date    TEXT,
  end_date      TEXT,
  status        TEXT DEFAULT 'ACTIVE'          -- ACTIVE/RELEASED
);
```

### `building_permissions`
```sql
CREATE TABLE building_permissions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin          TEXT REFERENCES parcels(ulpin),
  application_no TEXT UNIQUE,
  building_type  TEXT,                         -- Residential/Commercial/Industrial
  floors         INTEGER,
  area_sqm       REAL,
  approval_date  TEXT,
  valid_until    TEXT,
  status         TEXT DEFAULT 'APPROVED'       -- APPROVED/PENDING/REJECTED/EXPIRED
);
```

### `land_use_records`
```sql
CREATE TABLE land_use_records (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin           TEXT REFERENCES parcels(ulpin),
  current_use     TEXT,
  permitted_use   TEXT,
  zoning          TEXT,                        -- R1/R2/C1/C2/I1/AG
  master_plan_ref TEXT,
  has_conflict    INTEGER DEFAULT 0
);
```

### `disputes`
```sql
CREATE TABLE disputes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin      TEXT REFERENCES parcels(ulpin),
  case_no    TEXT UNIQUE,
  type       TEXT,                             -- Boundary/Title/Inheritance/Encroachment
  status     TEXT DEFAULT 'PENDING',           -- PENDING/RESOLVED/APPEALED
  court      TEXT,
  filed_date TEXT
);
```

### `property_tax`
```sql
CREATE TABLE property_tax (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin            TEXT REFERENCES parcels(ulpin),
  assessment_year  TEXT,
  area_taxed       REAL,                       -- may differ from GIS area
  annual_tax       REAL,
  paid_amount      REAL,
  payment_date     TEXT,
  status           TEXT DEFAULT 'PAID'         -- PAID/PENDING/OVERDUE
);
```

### `utilities`
```sql
CREATE TABLE utilities (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ulpin          TEXT REFERENCES parcels(ulpin),
  utility_type   TEXT,                         -- Water/Electricity/Sewage/Gas
  provider       TEXT,
  connection_id  TEXT,
  status         TEXT DEFAULT 'ACTIVE'
);
```

### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id    TEXT,
  actor_role  TEXT,
  action      TEXT,                            -- CREATE/UPDATE/DELETE/VIEW
  table_name  TEXT,
  ulpin       TEXT,
  old_value   TEXT,                            -- JSON
  new_value   TEXT,                            -- JSON
  ip_address  TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### `users`
```sql
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,                  -- bcrypt hash
  name         TEXT,
  role         TEXT NOT NULL,
  department   TEXT,
  is_active    INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Land Truth Engine Algorithm

```python
def compute_risk_score(ulpin: str) -> LandTruthReport:
    flags = []
    score = 0

    # Area cross-validation
    p = get_parcel(ulpin)
    o = get_ownership(ulpin)
    r = get_registration(ulpin)
    t = get_tax(ulpin)

    areas = { "GIS": p.area_gis, "RoR": o.area_ror,
              "Registration": r.area_registered, "Tax": t.area_taxed }

    if o.area_ror and abs(p.area_gis - o.area_ror) / p.area_gis > 0.02:
        score += 25
        flags.append(Flag("AREA_MISMATCH_ROR", "HIGH", f"GIS {p.area_gis} vs RoR {o.area_ror} ha"))

    if t.area_taxed and abs(p.area_gis - t.area_taxed) / p.area_gis > 0.05:
        score += 20
        flags.append(Flag("AREA_MISMATCH_TAX", "MEDIUM", ...))

    # Ownership velocity
    recent_tx = count_transactions(ulpin, months=6)
    if recent_tx > 0:
        score += 15
        flags.append(Flag("RECENT_OWNERSHIP_CHANGE", "MEDIUM", ...))
    if recent_tx >= 3:
        score += 15
        flags.append(Flag("HIGH_TRANSACTION_FREQUENCY", "HIGH", ...))

    # Zoning conflict
    lu = get_land_use(ulpin)
    bp = get_building_permission(ulpin)
    if lu and bp and lu.permitted_use != bp.building_type:
        score += 20
        flags.append(Flag("ZONING_CONFLICT", "HIGH", ...))

    # Encumbrance
    if get_active_encumbrances(ulpin):
        score += 10
        flags.append(Flag("ACTIVE_ENCUMBRANCE", "LOW", ...))

    # Dispute
    if get_active_disputes(ulpin):
        score += 30
        flags.append(Flag("ACTIVE_DISPUTE", "HIGH", ...))

    # Satellite change
    if p.satellite_change_flag:
        score += 25
        flags.append(Flag("SATELLITE_CHANGE_DETECTED", "HIGH", ...))

    risk_level = "LOW" if score <= 30 else "MEDIUM" if score <= 60 else "HIGH"
    return LandTruthReport(score=min(score, 100), level=risk_level, flags=flags)
```

---

## 9. Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend framework | React | 18.x |
| Build tool | Vite | 5.x |
| Language (FE) | TypeScript | 5.x |
| CSS | Tailwind CSS | 3.x |
| Map | MapLibre GL JS | 4.x |
| Charts | Recharts | 2.x |
| State | Zustand | 4.x |
| Router | React Router | 6.x |
| Icons | Lucide React | latest |
| HTTP client | Axios | 1.x |
| QR (FE) | qrcode.react | 3.x |
| Backend | FastAPI | 0.111 |
| ASGI | Uvicorn | 0.30 |
| ORM | SQLAlchemy | 2.x |
| Validation | Pydantic | 2.x |
| Auth | python-jose + passlib | latest |
| QR (BE) | qrcode | 7.x |
| DB (prototype) | SQLite | built-in |
| DB (production) | PostgreSQL 16 + PostGIS 3.4 | — |
| Container | Docker + docker-compose | — |
