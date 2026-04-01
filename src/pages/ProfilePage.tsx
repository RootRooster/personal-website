import React from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Shield, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../lib/api';

export default function ProfilePage() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel refractive-edge rounded-3xl p-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary/20">
            <span className="text-primary text-3xl font-black uppercase">{user.username[0]}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface">{user.username.toUpperCase()}</h1>
          {user.isAdmin && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-primary text-xs font-black uppercase tracking-widest">Admin</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {user.isAdmin && (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl text-on-surface font-bold text-sm uppercase tracking-widest hover:border-primary/50 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-bold text-sm uppercase tracking-widest hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
