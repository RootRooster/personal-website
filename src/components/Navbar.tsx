import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, User, Menu, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mailCopied, setMailCopied] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('gmail@nikcadez.com');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = 'gmail@nikcadez.com';
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setMailCopied(true);
    setTimeout(() => setMailCopied(false), 2000);
  };

  const navLinks = [
    { name: 'Work', path: '/work' },
    { name: 'Experience', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313]/60 backdrop-blur-2xl border-b border-outline-variant/15">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
        <Link to="/" className="text-2xl font-black tracking-tighter text-on-surface hover:text-primary transition-colors">
          NIKCADEZ.COM
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 font-semibold tracking-tighter text-sm uppercase items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "transition-colors hover:text-on-surface active:scale-95",
                location.pathname === link.path ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface/60"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button onClick={handleCopyEmail} className="text-primary hover:text-primary/80 transition-colors relative" title="Copy email">
            {mailCopied ? <Check size={24} /> : <Mail size={24} />}
          </button>
          <button onClick={() => navigate('/login')} className="text-primary hover:text-primary/80 transition-colors" title="Login">
            <User size={24} />
          </button>
          <button
            className="md:hidden text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-outline-variant/15 p-8 flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-lg font-bold uppercase tracking-tighter",
                  location.pathname === link.path ? "text-primary" : "text-on-surface/60"
                )}
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
