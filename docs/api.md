# API Reference

Base URL: `/api`

All endpoints return JSON. Authenticated endpoints require a `Authorization: Bearer <token>` header.

## Authentication

### `POST /api/login`
Login and receive a JWT.

- **Rate limit:** 5 per 15 minutes (failed attempts only)
- **Body:** `{ "username": string, "password": string }`
- **Response:** `{ "token": string, "username": string, "isAdmin": boolean }`
- **Errors:** `401` invalid credentials, `400` validation error

### `POST /api/register`
Create a new user account.

- **Rate limit:** 3 per hour
- **Body:** `{ "username": string, "password": string }`
- **Validation:** Username 3-50 chars (alphanumeric, hyphens, underscores). Password 8+ chars.
- **Response:** `201` `{ "token": string, "username": string, "isAdmin": false }`
- **Errors:** `409` registration failed, `400` validation error

---

## Projects

### `GET /api/projects`
List all projects, newest first.

- **Auth:** None
- **Response:** `Project[]`

### `GET /api/projects/:id`
Get a single project.

- **Auth:** None
- **Response:** `Project`
- **Errors:** `404` not found

### `POST /api/projects`
Create a project.

- **Auth:** Admin required
- **Body:** `{ "title": string, "category": string, "description": string, "image": string, "tags": string[], "link"?: string, "featured"?: boolean }`
- **Response:** `201` `Project`

### `DELETE /api/projects/:id`
Delete a project.

- **Auth:** Admin required
- **Response:** `{ "success": true }`

---

## Blog Posts

### `GET /api/blogs`
List all blog posts, newest first.

- **Auth:** None
- **Response:** `BlogPost[]`

### `GET /api/blogs/:id`
Get a single blog post with full content.

- **Auth:** None
- **Response:** `BlogPost`
- **Errors:** `404` not found

### `POST /api/blogs`
Create a blog post. Sends email notification to all subscribers.

- **Auth:** Admin required
- **Body:** `{ "title": string, "excerpt": string, "content": string, "read_time": string, "category": string[], "image_url": string, "featured"?: boolean, "date"?: string }`
- **Response:** `BlogPost`

### `DELETE /api/blogs/:id`
Delete a blog post. Associated comments and likes are cascade-deleted.

- **Auth:** Admin required
- **Response:** `{ "success": true }`

---

## Comments

### `GET /api/blogs/:id/comments`
List all comments on a blog post, oldest first.

- **Auth:** None
- **Response:** `Comment[]` (includes `username` from joined user)

### `POST /api/blogs/:id/comments`
Post a comment on a blog post.

- **Auth:** Logged in user
- **Rate limit:** 10 per minute
- **Body:** `{ "content": string }` (max 2000 chars)
- **Response:** `201` `Comment`
- **Errors:** `404` blog not found

### `DELETE /api/comments/:id`
Delete a comment. Users can delete their own; admins can delete any.

- **Auth:** Logged in user (owner or admin, admin verified against DB)
- **Response:** `{ "success": true }`
- **Errors:** `403` not authorized, `404` not found

---

## Likes

### `GET /api/blogs/:id/likes`
Get like count and whether the current user has liked.

- **Auth:** Optional (if logged in, returns `liked` status)
- **Response:** `{ "count": number, "liked": boolean }`

### `POST /api/blogs/:id/like`
Toggle like on a blog post.

- **Auth:** Logged in user
- **Rate limit:** 30 per minute
- **Response:** `{ "count": number, "liked": boolean }`
- **Errors:** `404` blog not found

---

## Images

### `GET /api/images`
List all uploaded images.

- **Auth:** Admin required
- **Response:** `UploadedImage[]`

### `POST /api/images`
Upload an image file. Validates MIME type and magic bytes.

- **Auth:** Admin required
- **Body:** `multipart/form-data` with `file` field
- **Allowed types:** JPEG, PNG, GIF, WebP
- **Max size:** 5 MB
- **Response:** `201` `UploadedImage`

### `DELETE /api/images/:id`
Delete an image (removes DB record and file from disk).

- **Auth:** Admin required
- **Response:** `{ "success": true }`
- **Errors:** `404` not found

---

## Subscribers

### `GET /api/subscribers`
List all newsletter subscribers.

- **Auth:** Admin required
- **Response:** `Subscriber[]`

### `POST /api/subscribers`
Subscribe an email to the newsletter.

- **Rate limit:** 5 per minute
- **Body:** `{ "email": string }`
- **Response:** `201` `Subscriber`
- **Errors:** `409` already subscribed

### `DELETE /api/subscribers/:id`
Remove a subscriber.

- **Auth:** Admin required
- **Response:** `{ "success": true }`

---

## Contact

### `POST /api/contact`
Send a contact form email via Resend.

- **Rate limit:** 5 per minute
- **Body:** `{ "name": string, "email": string, "subject": string, "message": string }`
- **Response:** `{ "success": true }`

---

## Data Types

```typescript
interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  link?: string | null;
  featured: boolean;
  created_at: string;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;       // Markdown
  date: string;
  read_time: string;
  category: string[];
  image_url: string;
  featured: boolean;
  created_at: string;
}

interface Comment {
  id: number;
  blog_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

interface UploadedImage {
  id: number;
  url: string;
  name: string;
  created_at: string;
}
```
