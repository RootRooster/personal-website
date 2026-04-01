const API_BASE = '/api';

// ─── Auth token management ───────────────────────────────

let authToken: string | null = localStorage.getItem('auth_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export function getToken(): string | null {
  return authToken;
}

// ─── Request helpers ─────────────────────────────────────

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────

interface AuthResponse { token: string; username: string; isAdmin: boolean }

export async function login(username: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export function logout() {
  setToken(null);
}

export function getCurrentUser(): { userId: number; username: string; isAdmin: boolean } | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check token expiry client-side for UX (server still validates authoritatively)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      setToken(null);
      return null;
    }
    return { userId: payload.userId, username: payload.username, isAdmin: payload.isAdmin };
  } catch {
    setToken(null);
    return null;
  }
}

// ─── Projects ────────────────────────────────────────────

export interface Project {
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

export async function getProjects(): Promise<Project[]> {
  return request<Project[]>('/projects');
}

export async function createProject(data: {
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  featured?: boolean;
}): Promise<Project> {
  return request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: number | string): Promise<void> {
  await request(`/projects/${id}`, { method: 'DELETE' });
}

// ─── Blogs ───────────────────────────────────────────────

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  category: string[];
  image_url: string;
  featured: boolean;
  created_at: string;
}

export async function getBlogs(): Promise<BlogPost[]> {
  return request<BlogPost[]>('/blogs');
}

export async function getBlog(id: number | string): Promise<BlogPost> {
  return request<BlogPost>(`/blogs/${id}`);
}

export async function createBlog(data: {
  title: string;
  excerpt: string;
  content: string;
  read_time: string;
  category: string[];
  image_url: string;
  featured?: boolean;
}): Promise<BlogPost> {
  return request<BlogPost>('/blogs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteBlog(id: number | string): Promise<void> {
  await request(`/blogs/${id}`, { method: 'DELETE' });
}

// ─── Images ──────────────────────────────────────────────

export interface UploadedImage {
  id: number;
  url: string;
  name: string;
  created_at: string;
}

export async function getImages(): Promise<UploadedImage[]> {
  return request<UploadedImage[]>('/images');
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('file', file);
  const headers: Record<string, string> = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE}/images`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Upload failed');
  }
  return res.json();
}

export async function deleteImage(id: number | string): Promise<void> {
  await request(`/images/${id}`, { method: 'DELETE' });
}

// ─── Subscribers ─────────────────────────────────────────

export async function subscribe(email: string): Promise<{ id: number; email: string; created_at: string }> {
  return request('/subscribers', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ─── Contact ─────────────────────────────────────────────

export async function sendContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  await request('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Comments ────────────────────────────────────────────

export interface Comment {
  id: number;
  blog_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

export async function getComments(blogId: number | string): Promise<Comment[]> {
  return request<Comment[]>(`/blogs/${blogId}/comments`);
}

export async function postComment(blogId: number | string, content: string): Promise<Comment> {
  return request<Comment>(`/blogs/${blogId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(id: number): Promise<void> {
  await request(`/comments/${id}`, { method: 'DELETE' });
}

// ─── Likes ───────────────────────────────────────────────

export async function getLikes(blogId: number | string): Promise<{ count: number; liked: boolean }> {
  return request(`/blogs/${blogId}/likes`);
}

export async function toggleLike(blogId: number | string): Promise<{ count: number; liked: boolean }> {
  return request(`/blogs/${blogId}/like`, { method: 'POST' });
}
