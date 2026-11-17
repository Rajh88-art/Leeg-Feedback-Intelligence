'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Info,
  BrainCircuit,
} from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Executive Overview',
  '/feedback': 'Feedback Explorer',
  '/ai-insights': 'Synthesized Insights & Patterns',
  '/ai-analysis': 'Live AI Prioritization',
  '/research': 'External Research Context',
  '/profile': 'Platform Scope & Governance',
};

export default function Navbar() {
  const pathname = usePathname();
  const currentLabel = pathname.startsWith('/feedback/')
    ? `Feedback Record #${pathname.split('/').pop()}`
    : ROUTE_LABELS[pathname] || 'Product Intelligence';

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAF7]/90 backdrop-blur-md border-b border-[#DCE4DD] px-4 sm:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Workspace Breadcrumb & Context */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-[#161B19] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#123D32] shrink-0" />
            <span>Leeg Product Intelligence</span>
          </span>
          <span className="text-[#9BA8A0] text-xs hidden sm:inline">/</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF3EF] text-[#123D32] border border-[#DCE4DD]">
            {currentLabel}
          </span>
        </div>

        {/* Right Section Actions & Quick Links */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/ai-analysis"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0] hover:bg-[#E2EBE4] text-xs font-semibold transition-all"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#123D32]" />
            <span className="hidden sm:inline">Live AI Analysis</span>
            <span className="sm:hidden">AI</span>
          </Link>

          <Link
            href="/ai-insights"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#123D32] text-white hover:bg-[#0B2822] text-xs font-semibold transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A8CBB7]" />
            <span>Insights &amp; Patterns</span>
          </Link>

          <Link
            href="/profile"
            className="p-1.5 rounded-lg text-[#53615A] hover:text-[#123D32] hover:bg-[#EFF3EF] transition-colors"
            title="Platform Scope & Methodology"
          >
            <Info className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
