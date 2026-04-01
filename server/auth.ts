import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required. Set it in .env');
  process.exit(1);
}
const TOKEN_EXPIRY = '24h';

export interface TokenPayload {
  userId: number;
  username: string;
  isAdmin: boolean;
}

// Pre-computed dummy hash used to prevent timing side-channels on login
const DUMMY_HASH = bcrypt.hashSync('dummy-timing-safe', 12);

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

export function getDummyHash(): string {
  return DUMMY_HASH;
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function createToken(userId: number, username: string, isAdmin: boolean): string {
  return jwt.sign({ userId, username, isAdmin }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Requires a valid token (any user)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as TokenPayload;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Requires a valid token AND is_admin = true (verified against DB)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const tokenUser = (req as any).user;
    if (!tokenUser?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    // Verify admin status against the database in case it was revoked after token issuance
    const dbUser: any = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(tokenUser.userId);
    if (!dbUser || !dbUser.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// Optionally parses token if present (doesn't reject if missing)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as TokenPayload;
      (req as any).user = payload;
    } catch { /* ignore invalid tokens */ }
  }
  next();
}

export function audit(action: string, details: string | null, req: Request, userId?: number) {
  db.prepare('INSERT INTO audit_log (action, details, ip, user_id, user_agent, request_path) VALUES (?, ?, ?, ?, ?, ?)').run(
    action, details, req.ip || 'unknown', userId ?? null,
    req.headers['user-agent'] || null, req.path
  );
}
