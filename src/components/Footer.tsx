import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-outline-variant/10 bg-[#0e0e0e]">
      <div className="flex justify-center items-center max-w-7xl mx-auto px-8">
        <div className="text-[11px] tracking-widest uppercase font-medium text-on-surface-variant">
          © {new Date().getFullYear()} NIK.PRO. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
