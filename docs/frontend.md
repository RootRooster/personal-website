# Frontend

React 19 SPA built with Vite 6 and Tailwind CSS v4. Uses a dark glassmorphism design language.

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 6 | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| React Router v7 | Client-side routing |
| Framer Motion | Page transitions and animations |
| Lucide React | Icon library |
| React Markdown | Blog content rendering |
| rehype-sanitize | XSS prevention in rendered markdown |
| react-syntax-highlighter | Code block syntax highlighting |
| react-dropzone | Drag-and-drop file uploads |
| date-fns | Date formatting |

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `ExperiencePage` | Hero, education, certifications, work timeline |
| `/work` | `WorkPage` | Project portfolio grid |
| `/blog` | `BlogPage` | Blog listing with search, filter, and newsletter |
| `/blog/:id` | `BlogPostPage` | Full blog post with markdown, comments, likes |
| `/contact` | `ContactPage` | Contact form and social links |
| `/login` | `AdminPage` | Admin login and content management dashboard |
| `/register` | `RegisterPage` | User registration |

## Component Tree

```
App
|-- LavaLampBackground    (animated blob background)
|-- Navbar                (fixed header, nav links, email copy, login)
|-- Routes
|   |-- ExperiencePage    (hero, bento grid, timeline)
|   |-- WorkPage          (project cards grid)
|   |-- BlogPage          (post grid, filters, newsletter)
|   |-- BlogPostPage      (markdown renderer, comments, likes)
|   |-- ContactPage       (contact form, social links)
|   |-- AdminPage         (login form / admin dashboard with tabs)
|   |-- RegisterPage      (registration form)
|-- Footer                (copyright)
```

## Key Components

### `LavaLampBackground`
Renders 12 animated blobs with spring-physics cursor interaction. Each blob is pushed away from the mouse within a 300px radius. Includes a grain texture overlay.

### `AdminPage`
Dual-purpose page: shows a login form for unauthenticated users, and a full content management dashboard for admins. The dashboard has three tabs:
- **Projects** — Create and delete projects
- **Blogs** — Write and publish articles (Markdown editor)
- **Images** — Upload images via drag-and-drop, copy URLs for embedding

### `BlogPostPage`
Renders markdown blog content with:
- Syntax-highlighted code blocks (Prism, One Dark theme) with copy button
- Sanitized HTML output (rehype-sanitize)
- Like button (toggle)
- Comment section (post, delete own/admin)

## API Client (`src/lib/api.ts`)

All API calls go through a central `request()` helper that:
- Prepends `/api` to all paths
- Attaches the JWT Bearer token from localStorage
- Parses JSON responses
- Throws on non-2xx responses with the server's error message

Auth state is managed via `setToken()` / `getToken()` / `getCurrentUser()`. The current user is decoded from the JWT payload client-side (with expiry check), while the server validates authoritatively.

## Styling

The design uses a custom dark theme defined in `src/index.css` with CSS custom properties:

- **Glass panels** — Semi-transparent backgrounds with backdrop blur
- **Refractive edges** — Gradient border effect
- **Typography** — Inter font, heavy use of tracking-tighter and uppercase
- **Color tokens** — Surface, primary (blue), secondary, destructive variants

Blog content is styled via `.markdown-body` with custom heading, code block, table, image, and blockquote styles.
