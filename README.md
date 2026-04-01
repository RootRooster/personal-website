# nikcadez.com

Personal portfolio and blog platform. React + Express + SQLite, deployed via Docker on a Raspberry Pi behind Cloudflare Tunnel.

**Live:** [pro.nikcadez.com](https://pro.nikcadez.com)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS v4, Framer Motion |
| Backend | Express 4, TypeScript, better-sqlite3 |
| Auth | JWT + bcrypt |
| Email | Resend |
| Infrastructure | Docker, Cloudflare Tunnel, GitHub Actions (self-hosted runner) |

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Fill in JWT_SECRET and RESEND_KEY

# Start both frontend and backend
npm run dev:all

# Frontend: http://localhost:3000
# API:      http://localhost:3001
```

The Vite dev server proxies `/api` and `/uploads` to the Express server automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run dev:server` | Start Express API with hot reload (port 3001) |
| `npm run dev:all` | Start both in parallel |
| `npm run build` | Build frontend for production |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm run user -- <action> <args>` | Manage users (see below) |
| `npm run lint` | TypeScript type-check |

## User Management

```bash
# Create a regular user
npm run user -- create alice password123

# Create an admin
npm run user -- create admin securepass --admin

# Reset password
npm run user -- reset alice newpassword

# Promote to admin
npm run user -- promote alice

# Delete user
npm run user -- delete alice

# List all users
npm run user -- list
```

## Production (Docker)

```bash
# Build and start
docker compose up -d --build

# Create admin user
docker exec -it nikpro node --import tsx server/manage-user.ts create <user> <pass> --admin

# View logs
docker logs -f nikpro
```

### Persistent Data

| Path | Content |
|------|---------|
| `data/` | SQLite database |
| `uploads/` | User-uploaded images |
| `.env` | Environment variables (secrets) |

These are excluded from git and must be transferred manually to the server.

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `JWT_SECRET` | Yes | - |
| `RESEND_KEY` | Yes | - |
| `API_PORT` | No | `3001` |
| `APP_URL` | No | `http://localhost:3000` |
| `MAIL_FROM` | No | `nikcadez.com <blog@nikcadez.com>` |
| `MAIL_REPLY_TO` | No | `gmail@nikcadez.com` |
| `MAIL_CONTACT_FROM` | No | `nikcadez.com Contact <contact.me@nikcadez.com>` |
| `MAIL_CONTACT_TO` | No | `gmail@nikcadez.com` |

Generate a JWT secret: `openssl rand -hex 32`

## Documentation

Detailed documentation is in the [`docs/`](docs/) folder:

- [Architecture](docs/architecture.md) - System design, request flow, and tech choices
- [API Reference](docs/api.md) - All endpoints, request/response formats
- [Database](docs/database.md) - Schema, tables, and backup procedures
- [Frontend](docs/frontend.md) - Components, routing, and styling
- [Deployment](docs/deployment.md) - Docker, Cloudflare Tunnel, CI/CD, and operations
- [Security](docs/security.md) - Auth, rate limiting, input validation, and hardening

## Project Structure

```
.
|-- src/                    # React frontend
|   |-- components/         # Navbar, Footer, LavaLampBackground
|   |-- pages/              # Route pages (Experience, Work, Blog, Contact, Admin, Register)
|   |-- lib/                # API client, utilities
|   |-- types.ts            # TypeScript interfaces
|   |-- constants.ts        # Static resume data
|   |-- index.css           # Global styles and theme tokens
|-- server/                 # Express backend
|   |-- index.ts            # Main server, routes, middleware
|   |-- auth.ts             # JWT, bcrypt, middleware
|   |-- db.ts               # SQLite setup and schema
|   |-- mail.ts             # Resend email functions
|   |-- manage-user.ts      # CLI user management
|   |-- seed*.ts            # Database seed scripts
|-- docs/                   # Project documentation
|-- data/                   # SQLite database (gitignored)
|-- uploads/                # Uploaded images (gitignored)
|-- Dockerfile              # Multi-stage production build
|-- docker-compose.yml      # Container orchestration
|-- .github/workflows/      # CI/CD pipeline
```

## License

All rights reserved.
