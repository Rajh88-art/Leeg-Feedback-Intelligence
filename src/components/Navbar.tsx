'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 sm:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Prototype Header Context */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/70 text-xs font-semibold text-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Discovery Prototype • Career OS Feedback Intelligence</span>
          </span>
        </div>

        {/* Right Section Actions & Quick Links */}
        <div className="flex items-center gap-3">
          <Link
            href="/ai-insights"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60 text-xs font-semibold transition-colors"
          >
            <span>AI Summaries</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <Link
            href="/profile"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Prototype Context"
          >
            <Info className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
