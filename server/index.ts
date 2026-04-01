import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import db from './db.js';
import { sendContactEmail, sendNewPostNotification } from './mail.js';
import { requireAuth, requireAdmin, optionalAuth, verifyPassword, createToken, hashPassword, getDummyHash, audit } from './auth.js';

const app = express();
const PORT = process.env.API_PORT || 3001;
const ALLOWED_ORIGIN = process.env.APP_URL || 'http://localhost:3000';
const IS_PROD = process.env.NODE_ENV === 'production';

// Trust reverse proxy (Caddy/nginx) so rate limiting uses the real client IP
app.set('trust proxy', 1);

// ─── SECURITY MIDDLEWARE ─────────────────────────────────

// Helmet: CSP + security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// CORS: only allow our frontend
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
}));

// Body parser with size limit
app.use(express.json({ limit: '1mb' }));

// Global rate limit: 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Strict rate limits for sensitive endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, skipSuccessfulRequests: true, message: { error: 'Too many login attempts, try again later' } });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { error: 'Too many registration attempts, try again later' } });
const contactLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'Too many messages, slow down' } });
const subscribeLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'Too many requests, slow down' } });
const commentLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Too many comments, slow down' } });
const likeLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: { error: 'Too many requests, slow down' } });

// Serve uploaded images statically with cache headers
app.use('/uploads', express.static(path.join(import.meta.dirname, '..', 'uploads'), {
  maxAge: '7d',
  immutable: true,
}));

// ─── FILE UPLOAD (secured) ───────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate actual file content matches declared MIME type via magic bytes
function validateMagicBytes(filePath: string, declaredMime: string): boolean {
  const buf = Buffer.alloc(12);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);

  switch (declaredMime) {
    case 'image/jpeg': return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
    case 'image/png':  return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    case 'image/gif':  return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46;
    case 'image/webp': return buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
                           && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
    default: return false;
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
}

const storage = multer.diskStorage({
  destination: path.join(import.meta.dirname, '..', 'uploads'),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  },
});

// ─── INPUT VALIDATION HELPERS ────────────────────────────

function validateString(val: unknown, name: string, maxLen: number): string {
  if (typeof val !== 'string' || val.trim().length === 0) throw new Error(`${name} is required`);
  if (val.length > maxLen) throw new Error(`${name} must be under ${maxLen} characters`);
  return val.trim();
}

function validateEmail(val: unknown): string {
  const s = validateString(val, 'Email', 320);
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(s)) {
    throw new Error('Invalid email format');
  }
  return s;
}

function validateISODate(val: unknown): string {
  if (typeof val !== 'string') throw new Error('Invalid date');
  const d = new Date(val);
  if (isNaN(d.getTime())) throw new Error('Invalid date format');
  return d.toISOString();
}

// ─── AUTH ────────────────────────────────────────────────

app.post('/api/login', authLimiter, (req, res) => {
  try {
    const username = validateString(req.body.username, 'Username', 100);
    const password = validateString(req.body.password, 'Password', 200);

    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    // Always run bcrypt compare to prevent timing-based username enumeration
    const hashToCheck = user ? user.password_hash : getDummyHash();
    if (!user || !verifyPassword(password, hashToCheck)) {
      audit('login_failed', `username: ${username}`, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user.id, user.username, !!user.is_admin);
    audit('login_success', `username: ${username}`, req, user.id);
    res.json({ token, username: user.username, isAdmin: !!user.is_admin });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/register', registerLimiter, (req, res) => {
  try {
    const username = validateString(req.body.username, 'Username', 50);
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) throw new Error('Username can only contain letters, numbers, hyphens, and underscores');
    if (username.length < 3) throw new Error('Username must be at least 3 characters');
    const password = validateString(req.body.password, 'Password', 200);
    if (password.length < 8) throw new Error('Password must be at least 8 characters');

    const hash = hashPassword(password);
    const result = db.prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 0)').run(username, hash);
    const user: any = db.prepare('SELECT id, username, is_admin FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = createToken(user.id, user.username, false);
    audit('user_registered', `username: ${username}`, req, user.id);
    res.status(201).json({ token, username: user.username, isAdmin: false });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Registration failed' });
    }
    res.status(400).json({ error: err.message });
  }
});

// ─── PROJECTS ────────────────────────────────────────────

app.get('/api/projects', (_req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  const projects = rows.map((r: any) => ({
    ...r,
    tags: JSON.parse(r.tags),
    featured: !!r.featured,
  }));
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const row: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Project not found' });
  res.json({ ...row, tags: JSON.parse(row.tags), featured: !!row.featured });
});

app.post('/api/projects', requireAdmin, (req, res) => {
  try {
    const title = validateString(req.body.title, 'Title', 200);
    const category = validateString(req.body.category, 'Category', 100);
    const description = validateString(req.body.description, 'Description', 5000);
    const image = validateString(req.body.image, 'Image', 2000);
    const tags = Array.isArray(req.body.tags) ? req.body.tags.filter((t: unknown) => typeof t === 'string').map((t: string) => t.substring(0, 100)).slice(0, 20) : [];
    const link = req.body.link ? String(req.body.link).substring(0, 2000) : null;
    const featured = req.body.featured ? 1 : 0;

    const result = db.prepare(
      'INSERT INTO projects (title, category, description, image, tags, link, featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(title, category, description, image, JSON.stringify(tags), link, featured);
    const created: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    audit('project_created', `id: ${created.id}, title: ${title}`, req, (req as any).user.userId);
    res.status(201).json({ ...created, tags: JSON.parse(created.tags), featured: !!created.featured });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  audit('project_deleted', `id: ${req.params.id}`, req, (req as any).user.userId);
  res.json({ success: true });
});

// ─── BLOGS ───────────────────────────────────────────────

app.get('/api/blogs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM blogs ORDER BY created_at DESC').all();
  const blogs = rows.map((r: any) => ({
    ...r,
    category: JSON.parse(r.category),
    featured: !!r.featured,
  }));
  res.json(blogs);
});

app.get('/api/blogs/:id', (req, res) => {
  const row: any = db.prepare('SELECT * FROM blogs WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Blog post not found' });
  res.json({ ...row, category: JSON.parse(row.category), featured: !!row.featured });
});

app.post('/api/blogs', requireAdmin, async (req, res) => {
  try {
    const title = validateString(req.body.title, 'Title', 200);
    const excerpt = validateString(req.body.excerpt, 'Excerpt', 1000);
    const content = validateString(req.body.content, 'Content', 100000);
    const read_time = validateString(req.body.read_time, 'Read time', 50);
    const category = Array.isArray(req.body.category) ? req.body.category.filter((c: unknown) => typeof c === 'string').map((c: string) => c.substring(0, 100)).slice(0, 10) : [];
    const image_url = validateString(req.body.image_url, 'Image URL', 2000);
    const featured = req.body.featured ? 1 : 0;
    const date = req.body.date ? validateISODate(req.body.date) : new Date().toISOString();

    const result = db.prepare(
      'INSERT INTO blogs (title, excerpt, content, date, read_time, category, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, excerpt, content, date, read_time, JSON.stringify(category), image_url, featured);
    const created: any = db.prepare('SELECT * FROM blogs WHERE id = ?').get(result.lastInsertRowid);

    audit('blog_created', `id: ${created.id}, title: ${title}`, req, (req as any).user.userId);

    // Notify subscribers in the background
    const subscribers = db.prepare('SELECT email FROM subscribers').all() as { email: string }[];
    const siteUrl = process.env.APP_URL || 'http://localhost:3000';
    sendNewPostNotification(subscribers, { id: created.id, title, excerpt }, siteUrl).catch((err) =>
      console.error('Newsletter send error:', err)
    );

    res.json({ ...created, category: JSON.parse(created.category), featured: !!created.featured });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/blogs/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM blogs WHERE id = ?').run(req.params.id);
  audit('blog_deleted', `id: ${req.params.id}`, req, (req as any).user.userId);
  res.json({ success: true });
});

// ─── IMAGES ──────────────────────────────────────────────

app.get('/api/images', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM images ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/images', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Verify file content matches declared MIME type
  if (!validateMagicBytes(req.file.path, req.file.mimetype)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'File content does not match declared type' });
  }

  const url = `/uploads/${req.file.filename}`;
  try {
    const result = db.prepare('INSERT INTO images (url, name) VALUES (?, ?)').run(url, sanitizeFilename(req.file.originalname));
    const created = db.prepare('SELECT * FROM images WHERE id = ?').get(result.lastInsertRowid);
    audit('image_uploaded', `file: ${req.file.filename}`, req, (req as any).user.userId);
    res.status(201).json(created);
  } catch (err) {
    // Clean up orphaned file if DB insert fails
    fs.unlinkSync(req.file.path);
    throw err;
  }
});

app.delete('/api/images/:id', requireAdmin, (req, res) => {
  const image: any = db.prepare('SELECT url FROM images WHERE id = ?').get(req.params.id);
  if (!image) return res.status(404).json({ error: 'Image not found' });

  db.prepare('DELETE FROM images WHERE id = ?').run(req.params.id);

  // Delete physical file from disk
  if (image.url.startsWith('/uploads/')) {
    const filePath = path.join(import.meta.dirname, '..', image.url);
    try { fs.unlinkSync(filePath); } catch { /* file may already be gone */ }
  }

  audit('image_deleted', `id: ${req.params.id}`, req, (req as any).user.userId);
  res.json({ success: true });
});

// ─── SUBSCRIBERS ─────────────────────────────────────────

app.get('/api/subscribers', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM subscribers ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/subscribers', subscribeLimiter, (req, res) => {
  try {
    const email = validateEmail(req.body.email);
    const result = db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);
    const created = db.prepare('SELECT * FROM subscribers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Already subscribed' });
    }
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/subscribers/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM subscribers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── CONTACT ─────────────────────────────────────────────

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const name = validateString(req.body.name, 'Name', 200);
    const email = validateEmail(req.body.email);
    const subject = validateString(req.body.subject, 'Subject', 200);
    const message = validateString(req.body.message, 'Message', 10000);

    await sendContactEmail({ name, email, subject, message });
    audit('contact_submitted', `from: ${email}, subject: ${subject}`, req);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Contact email error:', err);
    res.status(err.message?.includes('required') || err.message?.includes('Invalid') ? 400 : 500)
      .json({ error: err.message || 'Failed to send message' });
  }
});

// ─── COMMENTS ────────────────────────────────────────────

app.get('/api/blogs/:id/comments', (_req, res) => {
  const rows = db.prepare(
    `SELECT c.id, c.content, c.created_at, c.user_id, u.username
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.blog_id = ? ORDER BY c.created_at ASC`
  ).all(_req.params.id);
  res.json(rows);
});

app.post('/api/blogs/:id/comments', requireAuth, commentLimiter, (req, res) => {
  try {
    const content = validateString(req.body.content, 'Comment', 2000);
    const blogId = req.params.id;
    const userId = (req as any).user.userId;

    const blog = db.prepare('SELECT id FROM blogs WHERE id = ?').get(blogId);
    if (!blog) return res.status(404).json({ error: 'Blog post not found' });

    const result = db.prepare('INSERT INTO comments (blog_id, user_id, content) VALUES (?, ?, ?)').run(blogId, userId, content);
    const created = db.prepare(
      `SELECT c.id, c.content, c.created_at, c.user_id, u.username
       FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`
    ).get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', requireAuth, (req, res) => {
  const comment: any = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const user = (req as any).user;
  // Verify admin status from DB rather than trusting the JWT claim
  const isAdmin = !!(db.prepare('SELECT is_admin FROM users WHERE id = ?').get(user.userId) as any)?.is_admin;
  if (comment.user_id !== user.userId && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── LIKES ───────────────────────────────────────────────

app.get('/api/blogs/:id/likes', optionalAuth, (req, res) => {
  const count: any = db.prepare('SELECT COUNT(*) as count FROM likes WHERE blog_id = ?').get(req.params.id);
  const user = (req as any).user;
  let liked = false;
  if (user) {
    const row = db.prepare('SELECT id FROM likes WHERE blog_id = ? AND user_id = ?').get(req.params.id, user.userId);
    liked = !!row;
  }
  res.json({ count: count.count, liked });
});

app.post('/api/blogs/:id/like', requireAuth, likeLimiter, (req, res) => {
  const blogId = req.params.id;
  const userId = (req as any).user.userId;

  const blog = db.prepare('SELECT id FROM blogs WHERE id = ?').get(blogId);
  if (!blog) return res.status(404).json({ error: 'Blog post not found' });

  try {
    db.prepare('INSERT INTO likes (blog_id, user_id) VALUES (?, ?)').run(blogId, userId);
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      db.prepare('DELETE FROM likes WHERE blog_id = ? AND user_id = ?').run(blogId, userId);
    } else throw err;
  }

  const count: any = db.prepare('SELECT COUNT(*) as count FROM likes WHERE blog_id = ?').get(blogId);
  const liked = !!db.prepare('SELECT id FROM likes WHERE blog_id = ? AND user_id = ?').get(blogId, userId);
  res.json({ count: count.count, liked });
});

// ─── PRODUCTION: SERVE FRONTEND ─────────────────────────

if (IS_PROD) {
  const distPath = path.join(import.meta.dirname, '..', 'dist');
  app.use(express.static(distPath, { maxAge: '1y', immutable: true }));

  // SPA fallback: serve index.html for any non-API route
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── ERROR HANDLER ───────────────────────────────────────

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 5MB)' });
    return res.status(400).json({ error: err.message });
  }
  if (err.message?.includes('Only image files')) return res.status(400).json({ error: err.message });
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ───────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
