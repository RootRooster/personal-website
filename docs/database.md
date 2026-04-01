# Database

SQLite database stored at `data/website.db`. Uses WAL mode for concurrent read performance and has foreign keys enabled.

## Schema

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `title` | TEXT | NOT NULL |
| `category` | TEXT | NOT NULL |
| `description` | TEXT | NOT NULL |
| `image` | TEXT | NOT NULL (URL or /uploads/ path) |
| `tags` | TEXT | JSON array, default `'[]'` |
| `link` | TEXT | Nullable, external URL |
| `featured` | INTEGER | 0 or 1 |
| `created_at` | TEXT | ISO datetime, default `datetime('now')` |

### `blogs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `title` | TEXT | NOT NULL |
| `excerpt` | TEXT | NOT NULL |
| `content` | TEXT | NOT NULL (Markdown) |
| `date` | TEXT | ISO datetime |
| `read_time` | TEXT | e.g. "5 MIN read" |
| `category` | TEXT | JSON array |
| `image_url` | TEXT | NOT NULL |
| `featured` | INTEGER | 0 or 1 |
| `created_at` | TEXT | ISO datetime |

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `username` | TEXT | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL (bcrypt, cost 12) |
| `is_admin` | INTEGER | 0 or 1 |
| `created_at` | TEXT | ISO datetime |

### `comments`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `blog_id` | INTEGER | FK -> blogs(id) ON DELETE CASCADE |
| `user_id` | INTEGER | FK -> users(id) ON DELETE CASCADE |
| `content` | TEXT | NOT NULL |
| `created_at` | TEXT | ISO datetime |

### `likes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `blog_id` | INTEGER | FK -> blogs(id) ON DELETE CASCADE |
| `user_id` | INTEGER | FK -> users(id) ON DELETE CASCADE |
| `created_at` | TEXT | ISO datetime |
| | | UNIQUE(blog_id, user_id) |

### `images`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `url` | TEXT | NOT NULL (e.g. `/uploads/1234-photo.jpg`) |
| `name` | TEXT | NOT NULL (sanitized original filename) |
| `created_at` | TEXT | ISO datetime |

### `subscribers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `email` | TEXT | NOT NULL, UNIQUE |
| `created_at` | TEXT | ISO datetime |

### `audit_log`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, autoincrement |
| `action` | TEXT | NOT NULL (e.g. `login_success`, `blog_created`) |
| `details` | TEXT | Nullable, context string |
| `ip` | TEXT | Client IP |
| `user_id` | INTEGER | Nullable |
| `user_agent` | TEXT | Request user-agent header |
| `request_path` | TEXT | Request URL path |
| `created_at` | TEXT | ISO datetime |

## Backup

The database is a single file. To back up:

```bash
cp data/website.db data/website.db.bak
```

Or from outside the container:

```bash
docker cp nikpro:/app/data/website.db ./backup.db
```
