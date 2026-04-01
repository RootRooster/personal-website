# Security

## Authentication

- **Passwords** are hashed with bcrypt (cost factor 12)
- **JWTs** are signed with a server-side secret and expire after 24 hours
- **Admin verification** is checked against the database on every admin request, not just the JWT claim — revoking admin access takes effect immediately
- **Login timing attacks** are mitigated by always running bcrypt compare, even for nonexistent usernames (using a pre-computed dummy hash)
- **User enumeration** is prevented — registration returns a generic error on duplicate usernames

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Global | 100 requests/minute/IP |
| Login | 5 failed attempts/15 minutes |
| Register | 3/hour |
| Contact | 5/minute |
| Subscribe | 5/minute |
| Comment | 10/minute |
| Like | 30/minute |

Rate limiting uses `express-rate-limit`. The server trusts one proxy hop (`trust proxy: 1`) so the real client IP from Cloudflare is used.

## Input Validation

All inputs are validated server-side:
- String fields: type-checked, trimmed, length-limited
- Email: regex validation
- Arrays (tags, categories): filtered to strings only, item length capped, array size capped
- Dates: parsed and re-serialized as ISO strings
- File uploads: MIME type whitelist + magic byte verification

## File Upload Security

1. **MIME type whitelist** — Only `image/jpeg`, `image/png`, `image/gif`, `image/webp`
2. **Magic byte validation** — File header bytes are checked against the declared MIME type (WebP validates all 12 bytes including the WEBP signature)
3. **Filename sanitization** — Only `[a-zA-Z0-9._-]` allowed, max 100 chars
4. **Size limit** — 5 MB per file
5. **Orphan cleanup** — If the database insert fails after upload, the file is deleted from disk
6. **Physical deletion** — Deleting an image removes both the database record and the file from disk

## HTTP Security Headers (Helmet)

- **Content-Security-Policy** — Restricts script, style, font, image, and connect sources to `'self'` and specific trusted domains
- **Strict-Transport-Security** — 1 year max-age with includeSubDomains and preload
- **X-Frame-Options** — DENY (prevents clickjacking)
- **X-Content-Type-Options** — nosniff
- **Cross-Origin-Embedder-Policy** — Disabled (required for cross-origin images from Unsplash)

## CORS

Locked to a single origin defined by the `APP_URL` environment variable. Credentials are allowed.

## Email Security

- **HTML escaping** — All user input in email templates is HTML-escaped
- **Header injection prevention** — Control characters (`\r\n` and all C0 controls) are stripped from email subject lines

## XSS Prevention

- **React** auto-escapes all rendered content
- **Blog markdown** is rendered through `rehype-sanitize` with a strict schema
- **Comments** are rendered as plain text in JSX (not as HTML)

## Audit Logging

All sensitive actions are logged to the `audit_log` table:
- Login attempts (success and failure)
- User registration
- Content creation and deletion (projects, blogs, images)
- Contact form submissions

Each log entry includes: action, details, client IP, user ID, user-agent, and request path.
