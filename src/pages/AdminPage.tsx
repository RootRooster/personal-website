import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  FileText,
  Briefcase,
  Plus,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  ChevronRight,
  Eye
} from 'lucide-react';
import {
  getProjects, createProject, deleteProject,
  getBlogs, createBlog, deleteBlog,
  getImages, uploadImage, deleteImage,
  login, logout, getToken, getCurrentUser,
  type Project, type BlogPost, type UploadedImage
} from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';

function ImageUploadField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(value ? 'url' : 'upload');

  const onDropField = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const result = await uploadImage(acceptedFiles[0]);
      onChange(result.url);
      setMode('url');
    } catch {
      // error handled by parent
    } finally {
      setUploading(false);
    }
  };

  const dropzone = useDropzone({ onDrop: onDropField, accept: { 'image/*': [] }, multiple: false });

  return (
    <div>
      <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">{label}</label>
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => setMode('upload')} className={cn(
          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors",
          mode === 'upload' ? "bg-primary text-on-primary" : "bg-surface-container-highest/50 text-on-surface-variant border border-outline-variant/30"
        )}>Upload</button>
        <button type="button" onClick={() => setMode('url')} className={cn(
          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors",
          mode === 'url' ? "bg-primary text-on-primary" : "bg-surface-container-highest/50 text-on-surface-variant border border-outline-variant/30"
        )}>URL</button>
      </div>
      {mode === 'upload' ? (
        <div
          {...dropzone.getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
            dropzone.isDragActive ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-primary/50"
          )}
        >
          <input {...dropzone.getInputProps()} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-on-surface-variant text-sm">Uploading...</span>
            </div>
          ) : value ? (
            <div className="space-y-2">
              <img src={value} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
              <p className="text-on-surface-variant text-xs">Click or drag to replace</p>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-2" />
              <p className="text-on-surface-variant text-sm">Click or drag image here</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
          />
          {value && (
            <img src={value} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const currentUser = getCurrentUser();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken() && !!currentUser?.isAdmin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'blogs' | 'images'>('projects');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', category: '', description: '', image: '', tags: '', link: '', featured: false });
  const [newBlog, setNewBlog] = useState({ title: '', excerpt: '', content: '', imageUrl: '', category: '', featured: false });

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, b, i] = await Promise.all([getProjects(), getBlogs(), getImages()]);
      setProjects(p);
      setBlogs(b);
      setImages(i);
    } catch (err) {
      console.error(err);
      const msg = (err as Error)?.message || '';
      if (msg.includes('Authentication') || msg.includes('expired')) {
        logout();
        setIsLoggedIn(false);
        setError('Session expired. Please sign in again.');
      } else {
        setError('Failed to fetch data. Is the API server running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(username, password);
      if (!result.isAdmin) {
        navigate('/blog');
        return;
      }
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} MIN read`;
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createProject({
        ...newProject,
        tags: newProject.tags.split(',').map(t => t.trim()).filter(t => t),
      });
      setShowAddModal(false);
      setNewProject({ title: '', category: '', description: '', image: '', tags: '', link: '', featured: false });
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createBlog({
        ...newBlog,
        category: newBlog.category.split(',').map(t => t.trim()).filter(t => t),
        read_time: calculateReadTime(newBlog.content),
        image_url: newBlog.imageUrl,
      });
      setShowAddModal(false);
      setNewBlog({ title: '', excerpt: '', content: '', imageUrl: '', category: '', featured: false });
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to publish article.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'projects' | 'blogs' | 'images', id: number) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    setError(null);
    try {
      if (type === 'projects') await deleteProject(id);
      else if (type === 'blogs') await deleteBlog(id);
      else await deleteImage(id);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(`Failed to delete from ${type}.`);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setLoading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadImage(file);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-panel refractive-edge rounded-3xl p-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <User className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-on-surface">WELCOME BACK</h1>
            <p className="text-on-surface-variant text-sm mt-2 uppercase tracking-widest font-bold opacity-60">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-destructive text-xs font-bold uppercase tracking-wider">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-black tracking-widest uppercase py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-center text-sm text-on-surface-variant mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-on-surface">MY SPACE</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-on-surface-variant text-sm uppercase tracking-widest font-bold opacity-60">Content Manager</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 glass-panel refractive-edge rounded-xl text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-between"
            >
              <p className="text-destructive text-sm font-bold uppercase tracking-wider">{error}</p>
              <button onClick={() => setError(null)} className="p-1 hover:bg-destructive/10 rounded-full transition-colors">
                <X className="w-4 h-4 text-destructive" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'projects', label: 'Work Projects', icon: Briefcase },
            { id: 'blogs', label: 'Blog Posts', icon: FileText },
            { id: 'images', label: 'Image Assets', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border",
                activeTab === tab.id
                  ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                  : "bg-surface-container-highest/30 text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass-panel refractive-edge rounded-3xl p-8 min-h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight uppercase">
              {activeTab === 'projects' ? 'Projects' : activeTab === 'blogs' ? 'Articles' : 'Assets'}
            </h2>
            {activeTab !== 'images' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-on-surface text-surface font-black text-xs tracking-widest uppercase rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeTab === 'projects' && projects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-6 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/20 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-6">
                    <img src={project.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-xl font-bold text-on-surface">{project.title}</h3>
                      <p className="text-on-surface-variant text-sm">{project.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleDelete('projects', project.id)} className="p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'blogs' && blogs.map(blog => (
                <div key={blog.id} className="flex items-center justify-between p-6 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/20 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-6">
                    <img src={blog.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-xl font-bold text-on-surface">{blog.title}</h3>
                      <p className="text-on-surface-variant text-sm">{blog.read_time} • {format(new Date(blog.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleDelete('blogs', blog.id)} className="p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'images' && (
                <div className="space-y-8">
                  <div {...getRootProps()} className={cn(
                    "border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer",
                    isDragActive ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-primary/50"
                  )}>
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
                    <p className="text-on-surface font-bold">Drag & drop images here, or click to select</p>
                    <p className="text-on-surface-variant text-sm mt-2">Used for blog content embedding</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map(img => (
                      <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-outline-variant/20">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(img.url);
                              alert('URL copied to clipboard!');
                            }}
                            className="w-full py-2 bg-on-surface text-surface text-[10px] font-black uppercase tracking-widest rounded-lg"
                          >
                            Copy URL
                          </button>
                          <button
                            onClick={() => handleDelete('images', img.id)}
                            className="w-full py-2 bg-destructive text-on-destructive text-[10px] font-black uppercase tracking-widest rounded-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && ((activeTab === 'projects' && projects.length === 0) || (activeTab === 'blogs' && blogs.length === 0) || (activeTab === 'images' && images.length === 0)) && (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant/40">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No items found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modals */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-surface/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl glass-panel refractive-edge rounded-3xl p-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter uppercase">
                  Add {activeTab === 'projects' ? 'Project' : 'Article'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {activeTab === 'projects' ? (
                <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Title</label>
                      <input
                        required
                        type="text"
                        value={newProject.title}
                        onChange={e => setNewProject({...newProject, title: e.target.value})}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Category</label>
                      <input
                        required
                        type="text"
                        value={newProject.category}
                        onChange={e => setNewProject({...newProject, category: e.target.value})}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <ImageUploadField
                      label="Image"
                      value={newProject.image}
                      onChange={url => setNewProject({...newProject, image: url})}
                    />
                    <div>
                      <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">External Link (Optional)</label>
                      <input
                        type="text"
                        value={newProject.link}
                        onChange={e => setNewProject({...newProject, link: e.target.value})}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Description</label>
                      <textarea
                        required
                        rows={4}
                        value={newProject.description}
                        onChange={e => setNewProject({...newProject, description: e.target.value})}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={newProject.tags}
                        onChange={e => setNewProject({...newProject, tags: e.target.value})}
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="React, AI, Python"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={newProject.featured}
                        onChange={e => setNewProject({...newProject, featured: e.target.checked})}
                        className="w-5 h-5 rounded-md border-outline-variant/30 bg-surface-container-highest/50 text-primary focus:ring-primary"
                      />
                      <label htmlFor="featured" className="text-sm font-bold text-on-surface">Mark as Featured</label>
                    </div>
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full bg-primary text-on-primary font-black tracking-widest uppercase py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddBlog} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Title</label>
                        <input
                          required
                          type="text"
                          value={newBlog.title}
                          onChange={e => setNewBlog({...newBlog, title: e.target.value})}
                          className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <ImageUploadField
                        label="Header Image"
                        value={newBlog.imageUrl}
                        onChange={url => setNewBlog({...newBlog, imageUrl: url})}
                      />
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Topics (comma separated)</label>
                        <input
                          required
                          type="text"
                          value={newBlog.category}
                          onChange={e => setNewBlog({...newBlog, category: e.target.value})}
                          className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                          placeholder="AI, Tech, Future"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Short Description / Excerpt</label>
                        <input
                          required
                          type="text"
                          value={newBlog.excerpt}
                          onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})}
                          className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Content (Markdown)</label>
                    <textarea
                      required
                      rows={12}
                      value={newBlog.content}
                      onChange={e => setNewBlog({...newBlog, content: e.target.value})}
                      className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      placeholder="# Your story starts here..."
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="blogFeatured"
                        checked={newBlog.featured}
                        onChange={e => setNewBlog({...newBlog, featured: e.target.checked})}
                        className="w-5 h-5 rounded-md border-outline-variant/30 bg-surface-container-highest/50 text-primary focus:ring-primary"
                      />
                      <label htmlFor="blogFeatured" className="text-sm font-bold text-on-surface">Featured Article</label>
                    </div>
                    <button
                      disabled={loading}
                      type="submit"
                      className="px-12 bg-primary text-on-primary font-black tracking-widest uppercase py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {loading ? 'Publishing...' : 'Publish Article'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
