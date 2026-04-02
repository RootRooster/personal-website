# Architecture

## Overview

nikcadez.com is a full-stack personal portfolio and blog platform. A React single-page application talks to an Express API server backed by SQLite, all packaged in a single Docker container.

```
Browser
  |
  v
Cloudflare (CDN, DDoS protection, TLS termination)
  |
  | Cloudflare Tunnel (encrypted, no open ports)
  v
Docker container (RPi)
  |
  Express server (:3001)
  |-- Static files (Vite-built React SPA)
  |-- /api/* endpoints
  |-- /uploads/* (user-uploaded images)
  |
  v
SQLite (data/website.db, WAL mode)
  |
  v
Resend API (transactional email)
```

## Why This Stack

| Choice | Reason |
|--------|--------|
| **React + Vite** | Fast dev experience, optimized production build, Tailwind CSS v4 integration |
| **Express** | Lightweight, serves both the API and the built frontend in production (single process) |
| **SQLite** | Zero-config, single-file database — ideal for a personal site on an RPi |
| **Cloudflare Tunnel** | Exposes the RPi to the internet without opening ports or needing a public IP |
| **No nginx** | Cloudflare Tunnel connects directly to Express. TLS is terminated at Cloudflare's edge. No reverse proxy layer needed |
| **Docker** | Reproducible builds, isolation, and easy redeployment via CI/CD |
| **Self-hosted GitHub Actions runner** | Push-to-deploy pipeline without exposing SSH to the internet |

## Request Flow

1. User visits `https://nikcadez.com`
2. Cloudflare terminates TLS at the edge and routes through the tunnel
3. `cloudflared` on the RPi forwards the request to `localhost:3001`
4. Express serves the React SPA for page routes, or handles `/api/*` requests
5. The SPA makes `fetch()` calls to `/api/*` which Express handles on the same port
6. SQLite stores all persistent data; Resend handles outbound email

## Production Mode

When `NODE_ENV=production`, the Express server:
- Serves the Vite-built `dist/` directory as static files with 1-year cache headers
- Falls back to `index.html` for any non-API route (SPA routing)
- Trusts `X-Forwarded-For` headers from the proxy (`trust proxy: 1`)

This means a single process, single port, single container serves everything.

## Security Layers

1. **Cloudflare** — DDoS mitigation, bot protection, TLS
2. **Helmet** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options
3. **CORS** — Locked to a single origin (`APP_URL`)
4. **Rate limiting** — Per-endpoint limits (auth, contact, comments, etc.)
5. **bcrypt** — Password hashing with cost factor 12
6. **JWT** — Stateless auth with 24h expiry, admin claims verified against DB
7. **Input validation** — All inputs validated server-side (type, length, format)
8. **File upload validation** — MIME type whitelist + magic byte verification
9. **rehype-sanitize** — Markdown rendered client-side is sanitized against XSS
10. **Audit log** — All sensitive actions logged with IP, user-agent, and request path
