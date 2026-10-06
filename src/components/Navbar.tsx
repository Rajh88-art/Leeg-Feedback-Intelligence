'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Workspace Breadcrumb & Context */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
            <span>Product Intelligence Hub</span>
          </span>
          <span className="text-slate-300 text-xs hidden sm:inline">/</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
            Discovery Prototype
          </span>
        </div>

        {/* Right Section Actions & Quick Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/ai-insights"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Insights Digest</span>
          </Link>

          <Link
            href="/profile"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Prototype Context & Scope"
          >
            <Info className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
