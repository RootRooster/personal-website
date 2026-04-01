import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AtSign, MapPin, Linkedin, Github, Check } from 'lucide-react';
import { sendContact } from '../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Collaboration Inquiry', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await sendContact(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: 'Collaboration Inquiry', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 min-h-[80vh] flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 space-y-8"
        >
          <div className="space-y-4">
            <span className="text-[#adc6ff] font-semibold tracking-[2px] uppercase text-xs">Contact</span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-on-surface">
              LET'S BUILD <br /> THE <span className="text-primary">FUTURE.</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-sm">
              Available for select collaborations and digital craftsmanship. Reach out to discuss your vision.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <AtSign size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email</p>
                <p className="text-on-surface font-semibold">gmail@nikcadez.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Studio</p>
                <p className="text-on-surface font-semibold">Remote / Worldwide</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 pt-4">
            <a href="https://si.linkedin.com/in/nik-%C4%8Dade%C5%BE-2068861b4" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-all">
              <Linkedin size={20} />
            </a>
            <a href="https://github.com/RootRooster/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-all">
              <Github size={20} />
            </a>
          </div>
        </motion.div>

        {/* Right Side: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 glass-panel rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[0.6875rem] tracking-[1.5px] uppercase font-bold text-on-surface-variant ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[0.6875rem] tracking-[1.5px] uppercase font-bold text-on-surface-variant ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[0.6875rem] tracking-[1.5px] uppercase font-bold text-on-surface-variant ml-1">Subject</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none appearance-none"
              >
                <option>Collaboration Inquiry</option>
                <option>Project Estimate</option>
                <option>Speaking Engagement</option>
                <option>Just Saying Hi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[0.6875rem] tracking-[1.5px] uppercase font-bold text-on-surface-variant ml-1">Message</label>
              <textarea
                required
                placeholder="Tell me about your project..."
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-black uppercase tracking-widest py-5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_10px_30px_rgba(173,198,255,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? 'Sending...' : status === 'success' ? (<><Check size={20} /> Message Sent!</>) : 'Send Message'}
            </button>
            <p className="text-center text-[0.6rem] text-on-surface-variant/50 uppercase tracking-tighter">
              {status === 'error' ? 'Something went wrong. Please try again or email directly.' :
               status === 'success' ? "Thanks! I'll get back to you soon." :
               'Your message will be sent directly to my inbox.'}
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
