# BhoomiStack — Cloudflare Deployment Guide

BhoomiStack is composed of two primary layers:
1. **Frontend**: Vite + React 18 SPA (TypeScript, MapLibre GL cadastral engine, Tailwind CSS)
2. **Backend**: Python FastAPI with SQLite or PostgreSQL/PostGIS geospatial database

This guide covers how to deploy BhoomiStack on **Cloudflare** using industry-standard architectures.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  CLOUDFLARE EDGE                                  |
|                                                                                   |
|   Users / Browsers                                                                |
|          |                                                                        |
|          +----------> Cloudflare Pages (Frontend SPA)                             |
|          |            - Serves React SPA (dist/index.html)                        |
|          |            - SPA Routing via public/_redirects                         |
|          |                                                                        |
|          +----------> Pages Functions (/api/[[path]].ts Edge Proxy)               |
|                       - Seamlessly proxies /api/v1/* to Backend                   |
|                       - Eliminates CORS issues, hides origin IP                   |
+-------------------------------------------+---------------------------------------+
                                            |
                                            v (Encrypted HTTPS / Cloudflare Tunnel)
+-----------------------------------------------------------------------------------+
|                        BACKEND HOST (VPS / Cloud / Container)                     |
|                                                                                   |
|   FastAPI + Gunicorn / Uvicorn + SQLite or PostgreSQL/PostGIS                     |
|   (Optional: Cloudflare Tunnel daemon 'cloudflared' for Zero-Port exposure)       |
+-----------------------------------------------------------------------------------+
```

---

## Approach 1: Frontend on Cloudflare Pages (Recommended)

Cloudflare Pages provides global CDN edge caching, unlimited bandwidth, instant previews, and automated git builds.

### Method A: Via Cloudflare Dashboard (GitHub / GitLab)

1. **Push your repository** to GitHub or GitLab.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the `BhoomiStack` repository.
4. Set the build configuration:
   - **Project name**: `bhoomistack`
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Under **Environment variables**, set:
   - `BACKEND_URL`: Your backend API URL (e.g., `https://api.yourdomain.com` or your Render/Railway/Fly.io URL).
   - `VITE_API_BASE_URL`: `/api/v1` (Cloudflare Pages Function will route `/api/*` to `BACKEND_URL`).
   - `VITE_MAP_STYLE`: `https://demotiles.maplibre.org/style.json`
6. Click **Save and Deploy**.

### Method B: Via Wrangler CLI (Direct Terminal Deployment)

You can build and deploy the frontend directly from your terminal:

```bash
cd frontend

# 1. Install dependencies and build the bundle
npm install
npm run build

# 2. Authenticate Wrangler with Cloudflare
npx wrangler login

# 3. Deploy the dist directory to Cloudflare Pages
npx wrangler pages deploy dist --project-name bhoomistack
```

> **Note**: A `public/_redirects` file (`/* /index.html 200`) has been added so React Router routes (`/map`, `/verify`, `/dashboard`) reload smoothly without 404 errors.
> A Cloudflare Pages Function has also been configured in `frontend/functions/api/[[path]].ts` to proxy API requests to your `BACKEND_URL`.

---

## Approach 2: Backend Deployment Options with Cloudflare

Because the backend is a persistent Python FastAPI service (with database access, GIS models, and PDF/QR rendering), it requires a container or server environment. Cloudflare integrates with it in two ways:

### Option A: Cloudflare Tunnel (Zero Trust / VPS / Homelab)

With **Cloudflare Tunnel (`cloudflared`)**, you do not need to open any inbound firewall ports (no port 80 or 443 needed) or have a static public IP.

1. **Install cloudflared or use Docker Compose**:
   We have included [docker-compose.cloudflare.yml](file:///home/pj/Projects/BhoomiStack/docker-compose.cloudflare.yml).

2. **Create a Cloudflare Tunnel**:
   - Go to [Cloudflare One / Zero Trust Dashboard](https://one.dash.cloudflare.com/) > **Networks** > **Tunnels**.
   - Click **Create a Tunnel** (name it e.g. `bhoomistack-tunnel`).
   - Copy your **Tunnel Token**.
   - Add a Public Hostname in the Tunnel UI:
     - Domain: `api.yourdomain.com`
     - Service: `HTTP` -> `backend:8000` (or `localhost:8000`)
     - (Optional) Domain: `bhoomi.yourdomain.com` -> `HTTP` -> `frontend:80`

3. **Start the stack with the Tunnel**:
   ```bash
   export CLOUDFLARE_TUNNEL_TOKEN="<your_cloudflare_tunnel_token>"
   docker compose -f docker-compose.cloudflare.yml up -d
   ```

### Option B: Cloud Provider (Render / Railway / Fly.io / AWS) + Cloudflare DNS

1. Deploy the FastAPI backend from `./backend` to any host (e.g. Render, Railway, Fly.io, or VPS) using the included [backend/Dockerfile](file:///home/pj/Projects/BhoomiStack/backend/Dockerfile).
2. Set environment variables on the host:
   ```env
   DATABASE_URL=sqlite:///./bhoomistack.db  # or postgresql://...
   SECRET_KEY=your-production-secret-key-32-chars-min
   CORS_ORIGINS=https://bhoomistack.pages.dev,https://yourdomain.com
   ```
3. In Cloudflare DNS:
   - Add a CNAME record: `api` -> `<your-backend-host-url>`
   - Enable the Cloudflare Proxy (**Orange Cloud**) for DDoS mitigation and free SSL.
4. In Cloudflare Pages Settings for BhoomiStack Frontend:
   - Add Environment Variable: `BACKEND_URL=https://api.yourdomain.com`

---

## Verification & Testing Checklist

- [ ] **Frontend CDN**: Visit `https://bhoomistack.pages.dev`. Confirm home page loads instantly.
- [ ] **SPA Routing**: Navigate to `/verify/UP-PRY-001245` and refresh the browser page. It should render without 404.
- [ ] **Cadastral Map**: Navigate to `/map` and ensure MapLibre tiles load correctly.
- [ ] **API Connectivity**: Test login or parcel search to confirm calls to `/api/v1/parcels` return 200 OK.
