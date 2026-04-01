# Deployment

The application runs on a Raspberry Pi behind a Cloudflare Tunnel, deployed via a self-hosted GitHub Actions runner.

## Infrastructure

```
GitHub (push to main)
  |
  v
Self-hosted Actions runner (on RPi)
  |-- git pull
  |-- docker compose up -d --build
  v
Docker container (nikpro)
  |-- Express serves SPA + API on :3001
  |-- Bound to 127.0.0.1 only
  v
cloudflared (system service)
  |-- Connects to Cloudflare edge
  |-- Routes pro.nikcadez.com -> localhost:3001
  v
Cloudflare (TLS, CDN, DDoS protection)
  |
  v
User's browser
```

## Why No nginx

Cloudflare Tunnel creates an encrypted outbound connection from the RPi to Cloudflare's edge. TLS is terminated by Cloudflare, not on the RPi. This eliminates the need for:
- nginx as a reverse proxy
- Origin certificates
- Port forwarding on the router
- A public IP address

Express serves both the static frontend and the API on a single port, so there's nothing for nginx to do.

## Docker Setup

The `Dockerfile` uses a multi-stage build:

1. **Builder stage** — Installs all dependencies (including native build tools for `better-sqlite3`), runs `vite build`
2. **Production stage** — Installs production dependencies only, copies the built frontend and server source, runs as non-root `node` user

The `docker-compose.yml` defines a single service with:
- Port bound to `127.0.0.1:3001` (accessible only to cloudflared on the host)
- Persistent volumes for `data/` (SQLite DB) and `uploads/` (images)
- Environment from `.env` file
- Log rotation (30MB max total)

## CI/CD Pipeline

A self-hosted GitHub Actions runner lives on the RPi at `~/actions-runner`. On every push to `main`:

1. The runner pulls the latest code into `~/personal-website`
2. Runs `docker compose up -d --build`
3. Prunes old Docker images

The runner runs as a systemd service and starts on boot.

## Cloudflare Tunnel

`cloudflared` runs as a system service on the RPi. It was configured via the Cloudflare Zero Trust dashboard:

- **Public hostname:** `pro.nikcadez.com`
- **Service:** `http://localhost:3001`

No ports need to be opened on the router. The tunnel creates an outbound-only connection.

## Environment Variables

Create a `.env` file in the project root:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Random string for signing JWTs (64+ chars) |
| `RESEND_KEY` | Yes | Resend API key for transactional email |
| `API_PORT` | No | Server port (default: `3001`) |
| `APP_URL` | No | Public URL (default: `http://localhost:3000`) |
| `MAIL_FROM` | No | Newsletter sender address |
| `MAIL_REPLY_TO` | No | Reply-to address |
| `MAIL_CONTACT_FROM` | No | Contact form sender address |
| `MAIL_CONTACT_TO` | No | Contact form recipient address |

Generate a JWT secret:
```bash
openssl rand -hex 32
```

## First-Time Setup

```bash
# On the RPi
git clone https://github.com/RootRooster/personal-website.git ~/personal-website
cd ~/personal-website

# Create .env and fill in secrets
nano .env

# Build and start
docker compose up -d --build

# Create admin user
docker exec -it nikpro node --import tsx server/manage-user.ts create <username> <password> --admin

# Seed data (optional)
docker exec -it nikpro node --import tsx server/seed-projects.ts
```

## Updating

Push to `main` and the GitHub Actions runner handles the rest. To manually update:

```bash
cd ~/personal-website
git pull origin main
docker compose up -d --build
```

## User Management

```bash
# Create user
docker exec -it nikpro node --import tsx server/manage-user.ts create <username> <password> [--admin]

# Reset password
docker exec -it nikpro node --import tsx server/manage-user.ts reset <username> <newpassword>

# Promote to admin
docker exec -it nikpro node --import tsx server/manage-user.ts promote <username>

# Delete user
docker exec -it nikpro node --import tsx server/manage-user.ts delete <username>

# List all users
docker exec -it nikpro node --import tsx server/manage-user.ts list
```

## Logs

```bash
# Application logs
docker logs nikpro
docker logs -f nikpro        # follow

# Actions runner logs
journalctl -u actions.runner.RootRooster-personal-website.rpi -f

# Cloudflare tunnel logs
journalctl -u cloudflared -f
```
