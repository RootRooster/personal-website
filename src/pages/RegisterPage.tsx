import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../lib/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      navigate('/blog');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel refractive-edge rounded-3xl p-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <UserPlus className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface">CREATE ACCOUNT</h1>
          <p className="text-on-surface-variant text-sm mt-2 uppercase tracking-widest font-bold opacity-60">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Username</label>
            <input
              required
              type="text"
              minLength={3}
              maxLength={50}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Password</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black tracking-widest text-on-surface-variant uppercase mb-2">Confirm Password</label>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Retype your password"
            />
          </div>
          {error && <p className="text-destructive text-xs font-bold uppercase tracking-wider">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-black tracking-widest uppercase py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          <p className="text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
