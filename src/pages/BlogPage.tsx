import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { getBlogs, subscribe, type BlogPost } from '../lib/api';
import { ArrowRight, Search, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBlogs();
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];
  const otherPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full relative z-10">
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-12">
          <div className="relative glass-panel rounded-[3rem] overflow-hidden border border-outline-variant/10 shadow-2xl p-8 md:p-16 lg:p-20 min-h-[60vh] flex items-center">
            <div className="absolute inset-0 -z-10 bg-primary/5 blur-[120px] rounded-full" />
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-7 space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[0.6875rem] font-semibold tracking-[1px] uppercase text-primary">Featured Article</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-tight text-on-surface">
                  {featuredPost.title}
                </h1>
                <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-6 pt-4">
                  <Link
                    to={`/blog/${featuredPost.id}`}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(173,198,255,0.2)]"
                  >
                    Read Full Story
                    <ArrowRight size={20} />
                  </Link>
                  <div className="flex flex-col">
                    <span className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant">Estimated Read</span>
                    <span className="text-sm font-semibold text-on-surface">{featuredPost.read_time}</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-5 relative group"
              >
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
                <div className="relative glass-panel rounded-3xl overflow-hidden aspect-[4/5] border border-outline-variant/15 shadow-2xl">
                  <img
                    src={featuredPost.image_url}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-on-surface font-semibold text-xl">{featuredPost.category[0]}</p>
                    <p className="text-on-surface-variant text-sm mt-1">{format(new Date(featuredPost.date), 'MMMM yyyy')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Section */}
      <section className="py-12 border-y border-outline-variant/10 bg-surface-container-lowest/50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <button
                onClick={() => setSearchQuery('')}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-sm tracking-tight whitespace-nowrap transition-all",
                  searchQuery === '' ? "bg-on-surface text-background" : "glass-panel text-on-surface-variant border border-outline-variant/10"
                )}
              >
                All Insights
              </button>
              {Array.from(new Set(posts.flatMap(p => p.category))).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSearchQuery(cat)}
                  className={cn(
                    "px-5 py-2 rounded-full transition-all font-semibold text-sm tracking-tight whitespace-nowrap border border-outline-variant/10",
                    searchQuery === cat ? "bg-on-surface text-background" : "glass-panel text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-full px-6 py-3 text-sm focus:ring-1 focus:ring-primary/40 placeholder:text-on-surface-variant/40"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {otherPosts.map((post) => (
            <motion.article
              key={post.id}
              whileHover={{ y: -5 }}
              className="group space-y-6"
            >
              <Link to={`/blog/${post.id}`} className="block space-y-6">
                <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-outline-variant/10 shadow-lg">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-background/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                      {post.category[0]}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[11px] font-medium tracking-widest text-on-surface-variant uppercase">
                    <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span>{post.read_time}</span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-on-surface-variant text-lg">No articles found matching your search.</p>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-8 mb-24">
        <div className="relative glass-panel rounded-[2rem] p-12 md:p-20 overflow-hidden border border-outline-variant/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full -z-10 opacity-40 blur-3xl pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-full" />
          </div>
          <div className="max-w-2xl space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Stay within the <span className="text-primary">refraction</span>.</h2>
            <p className="text-on-surface-variant text-lg">Join 12,000+ designers and developers who receive our bi-weekly deep dives into digital craftsmanship and future interfaces.</p>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={async (e) => {
              e.preventDefault();
              if (!subEmail) return;
              setSubStatus('loading');
              try {
                await subscribe(subEmail);
                setSubStatus('success');
                setSubEmail('');
              } catch (err: any) {
                setSubStatus(err?.message?.includes('Already subscribed') ? 'duplicate' : 'error');
              }
            }}>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={subEmail}
                onChange={(e) => { setSubEmail(e.target.value); if (subStatus !== 'idle') setSubStatus('idle'); }}
                className="flex-grow bg-surface-container-lowest border-none rounded-full px-8 py-5 text-on-surface focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={subStatus === 'loading'}
                className="bg-on-surface text-background px-10 py-5 rounded-full font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {subStatus === 'loading' ? 'Subscribing...' : subStatus === 'success' ? (<><Check size={18} /> Subscribed!</>) : 'Subscribe Now'}
              </button>
            </form>
            <p className="text-[11px] text-on-surface-variant/60">
              {subStatus === 'success' ? "You're in! We'll notify you when new articles drop." :
               subStatus === 'duplicate' ? "You're already subscribed!" :
               subStatus === 'error' ? "Something went wrong. Try again." :
               "No spam. Only high-fidelity insights. Unsubscribe anytime."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
