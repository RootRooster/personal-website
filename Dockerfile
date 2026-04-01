# ── Stage 1: Build frontend ──────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production image ────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Install build tools for better-sqlite3, then clean up after install
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && apk del python3 make g++

# Copy built frontend and server source
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY tsconfig.json ./

# Create directories for persistent data
RUN mkdir -p data uploads && chown -R node:node /app

USER node

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "--import", "tsx", "server/index.ts"]
