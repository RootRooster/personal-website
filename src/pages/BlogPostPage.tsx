import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { getBlog, getComments, postComment, deleteComment, getLikes, toggleLike, getCurrentUser, type BlogPost, type Comment } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Calendar, Copy, Check, Heart, MessageCircle, Trash2, Send } from 'lucide-react';

// Allow className on code/span so syntax highlighting works with sanitizer
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), ['className', /^language-/], 'style'],
  },
};

// Custom theme that layers on top of the glass-panel pre from CSS
const glassTheme: { [key: string]: React.CSSProperties } = Object.fromEntries(
  Object.entries(oneDark).map(([key, val]) => {
    if (key === 'pre[class*="language-"]' || key === 'code[class*="language-"]') {
      return [key, { ...val, background: 'transparent' }];
    }
    return [key, val];
  })
);

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper group relative my-8">
      <div className="code-block-header">
        <span className="code-block-lang">{language}</span>
        <button type="button" onClick={handleCopy} className="code-block-copy" aria-label="Copy code">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={glassTheme}
        language={language}
        PreTag="div"
        customStyle={{
          background: 'transparent',
          padding: '1.5rem',
          margin: 0,
          fontSize: '0.85rem',
          lineHeight: '1.7',
        }}
        codeTagProps={{
          style: { fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const [data, cmts, likes] = await Promise.all([getBlog(id), getComments(id), getLikes(id)]);
        setPost(data);
        setComments(cmts);
        setLikeCount(likes.count);
        setLiked(likes.liked);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user || !id) return;
    const result = await toggleLike(id);
    setLikeCount(result.count);
    setLiked(result.liked);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const created = await postComment(id, newComment);
      setComments([...comments, created]);
      setNewComment('');
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteComment(commentId);
    setComments(comments.filter(c => c.id !== commentId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter mb-4">POST NOT FOUND</h1>
        <Link to="/blog" className="text-primary font-bold flex items-center gap-2 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/blog" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-12 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-12 border border-outline-variant/20">
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
            <Calendar className="w-4 h-4 text-primary" />
            {format(new Date(post.date), 'MMMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
            <Clock className="w-4 h-4 text-secondary" />
            {post.read_time}
          </div>
          <div className="flex items-center gap-2">
            {post.category.map((cat, i) => (
              <span key={i} className="px-3 py-1 bg-surface-container-highest/50 border border-outline-variant/30 rounded-full text-[10px] font-black text-primary uppercase tracking-wider">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface mb-12 leading-[0.9]">
          {post.title}
        </h1>

        <div className="markdown-body">
          <ReactMarkdown
            rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');

                if (!match) {
                  return <code className={className} {...props}>{children}</code>;
                }

                return (
                  <CodeBlock language={match[1]} value={codeString} />
                );
              },
              pre({ children }) {
                return <>{children}</>;
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Like & Comment Section */}
        <div className="mt-16 pt-12 border-t border-outline-variant/15 space-y-10">
          {/* Like Button */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all ${
                liked
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'glass-panel border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:text-primary'
              } ${!user ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-primary' : ''}`} />
              <span className="text-sm font-bold">{likeCount}</span>
            </button>
            <div className="flex items-center gap-2 text-on-surface-variant/50">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{comments.length}</span>
            </div>
            {!user && (
              <Link to="/login" className="text-xs text-primary font-bold uppercase tracking-wider hover:underline">
                Sign in to like & comment
              </Link>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-6">
            <h3 className="text-xl font-black tracking-tight uppercase text-on-surface">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h3>

            {user && (
              <form onSubmit={handleComment} className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  maxLength={2000}
                  className="flex-grow bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-5 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-5 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {comments.length === 0 && (
              <p className="text-on-surface-variant/40 text-sm">No comments yet. Be the first.</p>
            )}

            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="glass-panel rounded-2xl p-5 border border-outline-variant/10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-black uppercase">
                        {c.username[0]}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{c.username}</span>
                      <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">
                        {format(new Date(c.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {user && (user.userId === c.user_id || user.isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1.5 text-on-surface-variant/30 hover:text-destructive transition-colors rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed pl-11">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
