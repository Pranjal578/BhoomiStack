# BhoomiStack — Product Requirements Document (PRD)

**Version**: 1.0  
**Date**: 2026-09-15  
**Status**: Approved  
**One-line pitch**: *"One Parcel. One Identity. Every Land Record Connected."*

---

## 1. Problem Statement

India's land governance suffers from **record fragmentation**. A single parcel of land has its data split across:

- Revenue Department (RoR / खसरा)
- Registration Department (Sale deeds, mortgages)
- Urban Planning / Master Plan authority
- Municipal Corporation (Building permissions, property tax)
- Utilities (Water, electricity connections)

These records exist in **siloed databases**, preventing cross-validation, enabling fraud, and creating friction for citizens, officers, and banks.

**Key pain points:**
1. Duplicate/forged land records go undetected across departments
2. Citizens visit 4–6 government offices for basic land information
3. Officers cannot detect boundary encroachments or record mismatches
4. No single "source of truth" for a land parcel
5. Mutation and registration processes are opaque and slow

---

## 2. Vision

Build a **Digital Public Infrastructure (DPI)** layer — **BhoomiStack** — that assigns every land parcel a **ULPIN (Unique Land Parcel Identification Number)**, connects all departmental records through this single ID, and exposes unified services to citizens, officers, and developers via open APIs.

BhoomiStack does **not** replace existing departmental systems. It acts as an **interoperability layer** on top of them.

---

## 3. Target Users

| Role | Primary Need | Access Level |
|------|-------------|--------------|
| **Citizen** | View parcel status, verify land, download certificates | Public read + request submission |
| **Revenue Officer** | Manage mutations, resolve anomalies, view RoR | Read/write land records |
| **Registration Officer** | View and update registration/deed records | Read/write registrations |
| **Urban Planning Officer** | Manage master plan, zoning, building permits | Read/write planning data |
| **Municipal Officer** | Property tax, utilities, infrastructure | Read/write municipal data |
| **System Administrator** | User management, audit logs, system config | Full access |

---

## 4. Scope — MVP (1-day build)

### In Scope
- [x] Interactive cadastral map (MapLibre GL) with ~500 synthetic parcels, Prayagraj district, UP
- [x] ULPIN-based unified parcel record (all departments in one view)
- [x] **Land Truth Engine** — cross-department data validation + risk scoring
- [x] Land Verification flow → QR-enabled verification certificate
- [x] 3 officer dashboards (Revenue, Planning, Municipal)
- [x] Document Intelligence (simulated OCR → field match)
- [x] JWT authentication with RBAC (5 roles)
- [x] Audit trail for all record changes
- [x] REST API (FastAPI) with OpenAPI docs
- [x] Citizen-facing parcel search (by ULPIN / Khasra / name)

### Out of Scope (post-MVP)
- Real PostGIS spatial queries (prototype uses GeoJSON + SQLite)
- Live integration with state government APIs
- Real OCR/ML model training
- Mobile app
- Multi-state dataset

---

## 5. Functional Requirements

### FR-01: Parcel Map
- Display cadastral boundaries as interactive GeoJSON polygons
- Color parcels by risk level: Green (verified), Yellow (attention), Red (high risk), Blue (government land)
- Click parcel → open parcel dashboard panel
- Support search by ULPIN, Khasra number, or owner name
- Layer toggles: Boundaries, Land Use, Risk Heatmap, Utilities

### FR-02: Parcel Dashboard
- Single-pane view with 9 tabs: Overview, Ownership, Registration, Planning, Buildings, Tax, Utilities, Documents, History
- Display ULPIN, Khasra No, Village, District, Area (in hectares)
- Show data confidence score (0–100%)
- Real-time data loaded from backend API

### FR-03: Land Truth Engine
- Compare area figures from: GIS, RoR, Registration record, Property Tax
- Detect and display inconsistencies with severity (LOW / MEDIUM / HIGH)
- Compute composite Risk Score (0–100)
- Show actionable alerts: ⚠ Area Mismatch, ⚠ Zoning Conflict, 🔴 Encroachment Alert, ⚠ Ownership Dispute
- Auto-generate alert cases that appear in officer dashboards

### FR-04: Land Verification
- Step-by-step verification checklist (10 checks, animated)
- Generate verification report (PDF-style) with:
  - ULPIN, status, owner name, area, encumbrance status, dispute status
  - Unique Verification ID (format: `LV-2026-XXXXXX`)
  - QR code pointing to `/verify/{id}`
- Shareable, download-ready certificate

### FR-05: Document Intelligence
- Upload interface (mock PDF/JPG of land document)
- Simulated OCR extraction: Owner, Khasra No, Area, Village, Registration No, Date
- Field-by-field comparison against live parcel record
- Visual MATCH / MISMATCH / PARTIAL per field
- Confidence score per extracted field

### FR-06: Officer Dashboards

**Revenue Officer:**
- KPI cards: Total Parcels, Verified, Pending Mutations, Disputed, Anomalies
- Risk heatmap over map
- Anomaly queue (sortable table)
- Mutation approval workflow

**Urban Planning Officer:**
- Land-use distribution (donut chart)
- Zoning conflict list
- Building permit approval queue
- Unauthorized construction alerts

**Municipal Officer:**
- Property tax coverage map
- Tax collection summary
- Utility coverage by ward
- Infrastructure proximity analysis

### FR-07: Authentication & RBAC
- Login page with role selection (demo mode)
- JWT-based session
- Route guards per role
- Role badge visible in nav bar

### FR-08: Audit Trail
- Log every GET (officer access) and all write operations
- Fields: actor, role, action, ULPIN, old value, new value, timestamp, IP
- Audit log viewer (admin only) with filters

### FR-09: REST API
- FastAPI backend with full OpenAPI documentation at `/api/docs`
- All endpoints listed in architecture.md
- CORS configured for frontend dev server

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| API response time | < 200ms (mock data, SQLite) |
| Map load time | < 3s for 500 parcels |
| Concurrent users | 50 (prototype) |
| Availability | Demo-stable (no production SLA) |
| Browser support | Chrome 120+, Firefox 120+ |
| Accessibility | WCAG 2.1 AA |
| Security | JWT expiry 8h, RBAC enforced server-side |

---

## 7. Success Criteria

The prototype is successful if a judge can:

1. Search a parcel by ULPIN and see all 9 data tabs populated
2. Watch the Land Truth Engine detect an area mismatch and produce a risk score
3. Complete a land verification and see a QR certificate generated
4. Switch roles (citizen → revenue officer) and see the flagged parcel in the dashboard
5. Upload a "document" and see field-level match/mismatch results
6. Review the audit log showing all actions taken during the demo

---

## 8. Constraints

- **Timeline**: 1 day (full build sprint)
- **Team**: Solo developer (or small team)
- **Infrastructure**: Local dev (no cloud deployment required for demo)
- **Data**: 100% synthetic, Prayagraj district context
- **AI/ML**: Rule-based scoring (no training required; explainable)
