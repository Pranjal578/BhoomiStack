# BhoomiStack — Dev Memory & Decision Log

This file is the living memory of the project. Every significant decision, gotcha, and architectural choice is recorded here chronologically. **Update this file whenever you make a non-obvious decision.**

---

## Session 1 — 2026-09-15 (Sprint Day 1)

### Project Context
- **Hackathon**: Smart India Hackathon (SIH) 2026
- **Problem**: Land governance fragmentation — multiple departments, no single source of truth
- **Solution**: Parcel-centric DPI using ULPIN as the spine
- **Timeline**: 1-day build sprint

### Key Decisions

#### D-001: Frontend-first, no raw PostGIS
**Decision**: Use SQLite (not PostgreSQL + PostGIS) for the prototype.  
**Reason**: PostGIS requires a running Postgres server + extension setup, adding ~30min overhead. SQLite stores GeoJSON as a text column. For a demo with 500 parcels, spatial queries aren't needed — all geometry is fetched as GeoJSON and rendered client-side via MapLibre GL.  
**Future path**: SQLAlchemy models are PostgreSQL-compatible. Swapping `DATABASE_URL` to a PostGIS connection string is the only change needed for production.

#### D-002: Rule-based Land Truth Engine (no ML model)
**Decision**: Land Truth Engine uses deterministic rules, not scikit-learn.  
**Reason**: ML model training takes hours and is a black box for demo purposes. Rule-based scoring with explicit thresholds is:
- Immediately explainable ("area mismatch > 2% → +25 points")
- Fully auditable
- Equally impressive visually
- Adjustable at demo time  
**Future path**: The scoring function can be replaced with a trained model that takes the same inputs and returns the same output structure.

#### D-003: Simulated OCR for Document Intelligence
**Decision**: Document upload triggers a deterministic simulation, not real Tesseract/Google Vision OCR.  
**Reason**: Real OCR on a demo scan of a land document takes 5–15 seconds and can fail on image quality. Simulation is instant, always works, and demonstrates the concept equally well.  
**Implementation**: Backend receives `{ ulpin, document_type }`. Returns pre-crafted field extraction with ±10% area noise to simulate real OCR variance. The mismatch is always on the "area" field for demo clarity.

#### D-004: MapLibre GL over Leaflet
**Decision**: Use MapLibre GL JS (not Leaflet) for the cadastral map.  
**Reason**: 
- MapLibre supports WebGL rendering (handles 500+ polygons smoothly)
- Built-in support for custom styles and raster tiles
- Can switch to satellite base map for demo wow factor
- Vector tiles path available for production scalability
**Note**: Use `maplibre-gl` npm package. Free, open-source fork of Mapbox GL JS.

#### D-005: Prayagraj district as demo scope
**Decision**: All synthetic data is in Prayagraj (Allahabad) district, UP.  
**Reason**: 
- Real district with real context (khasra numbering, tehsils: Sadar, Phulpur, Soraon, Meja)
- Visible on satellite maps
- ULPIN format: `UP-PRY-XXXXXX` is clean and memorable for demo
- 3 zones cover urban/peri-urban/rural diversity

#### D-006: Tailwind CSS for styling
**Decision**: Use Tailwind CSS v3 (user specified).  
**Config**: Extended with BhoomiStack brand colors and custom `font-display: 'Space Grotesk'`.

#### D-007: QR verification endpoint is public
**Decision**: `GET /api/v1/verify/{verification_id}` requires no auth.  
**Reason**: The QR on a land certificate must be scannable by anyone (bank, buyer, court). It only returns the verification summary — no sensitive data.

#### D-008: Zustand over Redux/Context
**Decision**: State management via Zustand only.  
**Reason**: Simpler API, less boilerplate, ideal for this scale. Three stores:
- `parcelStore`: active parcel, search results, GeoJSON
- `authStore`: current user, JWT token, role
- `uiStore`: sidebar open/closed, active dashboard tab, loading states

---

## Known Gotchas & Warnings

### G-001: MapLibre source update
When the active parcel changes, update the `selected-parcel` source using:
```javascript
map.getSource('selected-parcel').setData(newGeoJSON);
```
Do NOT remove and re-add the source — this causes a flash.

### G-002: SQLite JSON column
SQLAlchemy maps the `geometry` column as `Text`. When reading, parse with `json.loads()`. When writing, serialize with `json.dumps()`.

### G-003: CORS in dev
FastAPI CORS must include `http://localhost:5173`. In production, set to actual domain.

### G-004: React Router + MapLibre
MapLibre must be initialized inside a `useEffect` after component mounts. Do NOT initialize in the component body. Cleanup with `map.remove()` in the effect cleanup.

### G-005: qrcode.react import
```typescript
import QRCode from 'qrcode.react';
// Not: import { QRCode }
```

### G-006: Vite env variables
All env variables in Vite must be prefixed `VITE_`. Access via `import.meta.env.VITE_*`.

---

## Pending Decisions

- [ ] Satellite base map tile source: use `demotiles.maplibre.org` for free tiles, or use Esri World Imagery (requires key)
- [ ] Print CSS for certificate: browser print vs. html2canvas → jsPDF
- [ ] Phase 5: Docker is optional if time is tight. Document in README instead.

---

## Performance Notes

- GeoJSON with 500 polygon features: tested at ~800KB uncompressed. Enable gzip in uvicorn for <200KB wire size.
- MapLibre renders 500 polygons with fill + outline layers smoothly on modern hardware.
- If demo machine is slow, reduce to 200 parcels and note "scalable to 500K+".

---

## Demo Credentials (seed data)

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@demo.bhoomistack | demo1234 |
| Revenue Officer | revenue@demo.bhoomistack | demo1234 |
| Planning Officer | planning@demo.bhoomistack | demo1234 |
| Municipal Officer | municipal@demo.bhoomistack | demo1234 |
| Admin | admin@demo.bhoomistack | demo1234 |

**Demo ULPIN with all anomalies**: `UP-PRY-001245`
- Area mismatch: GIS 0.84ha vs RoR 0.72ha (14.3% discrepancy)
- Recent ownership change (3 months ago)
- Zoning conflict: Residential zone, Commercial building permit
- Satellite change flag: ON
- Risk score: ~95 (HIGH)

**Demo ULPIN — clean/verified**: `UP-PRY-000042`
- All areas match
- No disputes, no encumbrances
- Risk score: 5 (LOW)
- Status: VERIFIED

---

## Session 2 — 2026-09-15 (Implementation & Deployment)

### Full-Stack Build Completed
- **Backend**: FastAPI with SQLite database, 11 departmental data models, JWT authentication, Land Truth Engine service, full REST API endpoints for parcels, search, GeoJSON boundaries, verification certificates, document intelligence, and departmental dashboards.
- **Data Seeding**: 502 realistic parcels in Prayagraj district (Jhunsi, Naini, Phaphamau, Bamrauli, Civil Lines) seeded with realistic land uses, ownerships, registry deeds, mortgages, building permits, tax cycles, disputes, and satellite AI flags.
- **Land Truth Engine**: Automated batch scoring completed across all 502 parcels (385 LOW risk, 106 MEDIUM risk, 11 HIGH risk).
- **Frontend**: Vite + React 18 + TypeScript, MapLibre GL cadastral vector engine, custom modern responsive design system, Zustand global state, 360-degree parcel viewer drawer, public verification certificate generator with QR code, AI document cross-checking interface, and dedicated dashboards for Revenue, Planning, and Municipal departments.
- **Servers Active**:
  - FastAPI Backend running on `http://localhost:8000` (PID / daemon active)
  - Vite Frontend running on `http://localhost:5173` (proxied to `/api/v1` on port 8000)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-15 | Initial project setup, all 6 docs created |
| 1.1 | 2026-09-15 | Full-stack implementation complete: backend seeded with 502 parcels, Land Truth Engine running, frontend compiled and verified |
| 1.2 | 2026-09-24 | Cloudflare deployment configs added: _redirects, Pages function API reverse proxy, wrangler.jsonc, docker-compose.cloudflare.yml, CLOUDFLARE_DEPLOYMENT.md |

