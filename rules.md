# BhoomiStack — Development Rules & Conventions

**Version**: 1.0  
**Date**: 2026-09-15  
**Applies to**: All contributors, AI agents, code generators

---

## 0. Golden Rules

1. **ULPIN is sacred.** Every data record must link back to a ULPIN. No orphan records.
2. **Never display raw data.** Always format: areas in hectares (2 decimal), currency in ₹ with commas, dates as `DD MMM YYYY`.
3. **Every API must be documented.** No undocumented endpoints. FastAPI OpenAPI docs must stay current.
4. **Never store Aadhaar raw.** Always hash (SHA-256) before persisting.
5. **Audit everything.** Every write operation (POST/PUT/PATCH/DELETE) must create an audit_log entry.
6. **Error messages must be actionable.** No generic "Something went wrong." Give context and next steps.

---

## 1. Project-Wide Conventions

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `ParcelDashboard.tsx` |
| React hooks | camelCase prefixed with `use` | `useParcelData.ts` |
| Zustand stores | camelCase + Store suffix | `parcelStore.ts` |
| API functions | camelCase + verb | `fetchParcelById()` |
| API routes (backend) | snake_case | `/api/v1/land_truth` |
| DB tables | snake_case, plural | `ownership_records` |
| DB columns | snake_case | `area_gis`, `risk_score` |
| Python files | snake_case | `land_truth_engine.py` |
| Python classes | PascalCase | `LandTruthReport` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RISK_SCORE = 100` |
| Env variables | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

### File Organization Rules
- One component per file. No multi-component files.
- Types go in `src/types/`. Never define interfaces inline in components.
- API calls go in `src/api/`. No `fetch`/`axios` calls inside components.
- Never put business logic in JSX. Extract to hooks or utils.

---

## 2. Frontend (React + TypeScript)

### TypeScript Rules
- **Strict mode ON.** `tsconfig.json` must have `"strict": true`.
- **No `any`.** Use `unknown` and narrow it. If you must use `any`, add a comment explaining why.
- **All props must be typed.** No implicit `any` in props.
- **Use interfaces for object shapes, types for unions/primitives.**

```typescript
// ✅ Correct
interface Parcel {
  ulpin: string;
  khasraNo: string;
  areaGis: number;
  landUse: LandUseType;
}

type LandUseType = 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Government';

// ❌ Wrong
const parcel: any = { ... };
```

### Component Rules
- Functional components only (no class components).
- Use `React.FC<Props>` typing.
- Keep components under 200 lines. Split if longer.
- Extract repetitive JSX into subcomponents.
- No inline styles. All styling via Tailwind classes.
- `useEffect` dependency arrays must be complete. No eslint-disable for exhaustive-deps.

```typescript
// ✅ Correct
const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const config = {
    LOW: { color: 'bg-emerald-100 text-emerald-800', label: 'Low Risk' },
    MEDIUM: { color: 'bg-amber-100 text-amber-800', label: 'Medium Risk' },
    HIGH: { color: 'bg-red-100 text-red-800', label: 'High Risk' },
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[level].color}`}>{config[level].label}</span>;
};
```

### State Management Rules
- **Zustand only** for global state. No Redux, no Context for data.
- React `useState` for local UI state (modals open/closed, form inputs).
- Never put derived values in state. Compute them from source state.

### API Client Rules
- All API calls via `src/api/client.ts` (axios instance with base URL + interceptors).
- Handle errors in the API layer, not components.
- Loading, error, and success states must be explicit.

```typescript
// src/api/parcels.ts
export const getParcelById = async (ulpin: string): Promise<Parcel> => {
  const { data } = await client.get<ApiResponse<Parcel>>(`/parcels/${ulpin}`);
  return data.data;
};
```

### Map Rules (MapLibre GL)
- All map sources registered once on mount, updated via `setData()`.
- Layer IDs must follow the pattern: `{entity}-{type}` e.g., `parcels-fill`, `parcels-outline`.
- All map event listeners must be cleaned up on component unmount.
- Parcel color is always driven by `risk_level` property on the GeoJSON feature.

---

## 3. Backend (FastAPI + Python)

### Python Style
- PEP 8 compliance. Max line length: 100 chars.
- Type hints on all function signatures (input + return type).
- Docstrings on all public functions and classes.
- No `print()` in production code. Use Python `logging`.

```python
# ✅ Correct
async def compute_risk_score(ulpin: str, db: Session) -> LandTruthReport:
    """
    Compute the Land Truth Engine risk score for a parcel.
    
    Args:
        ulpin: Unique Land Parcel Identification Number
        db: SQLAlchemy database session
    
    Returns:
        LandTruthReport with risk score, level, and flags
    """
    ...
```

### FastAPI Rules
- All routers use `APIRouter` with `prefix` and `tags`.
- All endpoints use Pydantic response models (`response_model=...`).
- Use `Depends()` for auth, DB session, and shared logic.
- HTTP status codes must be semantically correct (200, 201, 400, 401, 403, 404, 422, 500).
- Never return raw SQLAlchemy ORM objects. Always serialize via Pydantic schema.

```python
# ✅ Correct
@router.get("/{ulpin}", response_model=ApiResponse[ParcelSchema])
async def get_parcel(
    ulpin: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    parcel = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel {ulpin} not found")
    return success_response(parcel)
```

### Database Rules
- SQLAlchemy models in `models.py`. One class per table.
- Pydantic schemas in `schemas.py`. One schema per use case (Create, Read, Update).
- Always use `Session` from `Depends(get_db)`. Never create sessions manually in routers.
- Migrations: for prototype, `Base.metadata.create_all()` on startup. For prod: Alembic.

### Security Rules
- Passwords hashed with `bcrypt` (passlib). Never store plaintext.
- JWT expiry: 8 hours for officer accounts, 24 hours for citizen sessions.
- CORS: restrict to frontend origin in production.
- Never log sensitive data: Aadhaar numbers, passwords, JWT secrets.

### Audit Rule (MANDATORY)
Every write endpoint must call `create_audit_log()` before returning:
```python
create_audit_log(
    db=db,
    actor_id=current_user.id,
    actor_role=current_user.role,
    action="UPDATE",
    table_name="ownership_records",
    ulpin=ulpin,
    old_value=json.dumps(old_data),
    new_value=json.dumps(new_data)
)
```

---

## 4. Data Rules

### ULPIN Format
```
{STATE_CODE}-{DISTRICT_CODE}-{KHASRA}
Example: UP-PRY-001245
         UP  = Uttar Pradesh
         PRY = Prayagraj
         001245 = 6-digit zero-padded khasra sequence
```

### Area Representation
- Store in **hectares** (floating point, 4 decimal places in DB).
- Display to 2 decimal places in UI.
- GIS area is ground truth. All other areas compared against it.

### Risk Score Rules
- Score is always 0–100 (capped at 100).
- Score is recomputed fresh on every `/land-truth` API call (not cached in DB).
- `risk_level` stored in `parcels` table is updated whenever the score is computed.

### Inconsistency Thresholds
| Comparison | Threshold | Severity |
|-----------|----------|----------|
| GIS vs RoR area | > 2% | HIGH |
| GIS vs Registration area | > 3% | MEDIUM |
| GIS vs Tax area | > 5% | MEDIUM |
| Any area > 10% mismatch | — | HIGH |

---

## 5. Git Conventions

### Branch Strategy
```
main              → always deployable
dev               → integration branch
feature/{name}    → feature branches
fix/{issue}       → bug fixes
```

### Commit Message Format (Conventional Commits)
```
feat(map): add parcel risk color coding
fix(auth): handle expired JWT gracefully
docs(api): add encumbrance endpoint schema
chore(deps): upgrade MapLibre to 4.x
```

### PR Rules
- No direct pushes to `main`.
- PRs must have a description linking to the feature in `phases.doc.md`.
- TypeScript must compile without errors before merging.

---

## 6. Testing Rules

### Frontend
- At least a smoke test for every page (renders without crashing).
- API mock layer (`src/api/__mocks__/`) must mirror real API response shapes.

### Backend
- Every router must have at least one `pytest` test for the happy path.
- Land Truth Engine must have unit tests for each scoring rule.
- Use `TestClient` from FastAPI for integration tests.

---

## 7. Environment Variables

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_MAP_STYLE=https://demotiles.maplibre.org/style.json
```

### Backend (`.env`)
```
DATABASE_URL=sqlite:///./bhoomistack.db
SECRET_KEY=<random 32-byte hex>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=8
CORS_ORIGINS=http://localhost:5173
```

---

## 8. Forbidden Practices

| ❌ Never do | ✅ Do instead |
|------------|-------------|
| Store raw Aadhaar | Hash with SHA-256 first |
| `console.log` in production | Use logging utilities |
| Inline styles in JSX | Tailwind classes |
| Hardcoded API URLs | Use env variables |
| `SELECT *` in production SQL | Explicit column selection |
| `any` type in TypeScript | Proper types or `unknown` |
| Skip audit log on writes | Always call `create_audit_log()` |
| Mock data in components | Fetch from API; use seed data |
| Commit `.env` files | Use `.env.example` pattern |
