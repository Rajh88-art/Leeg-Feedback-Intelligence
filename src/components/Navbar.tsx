'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, BrainCircuit } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Feedback Overview',
  '/feedback': 'All Feedback',
  '/ai-insights': 'AI Insights',
  '/ai-analysis': 'AI Analysis',
  '/research': 'Research',
  '/profile': 'About',
};

export default function Navbar() {
  const pathname = usePathname();
  const currentLabel = pathname.startsWith('/feedback/')
    ? `Feedback #${pathname.split('/').pop()}`
    : ROUTE_LABELS[pathname] || 'Overview';

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAF7]/90 backdrop-blur-md border-b border-[#DCE4DD] px-4 sm:px-8 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 min-w-0 text-xs">
          <span className="font-semibold text-[#161B19]">Leeg</span>
          <span className="text-[#B89B72]">/</span>
          <span className="font-medium text-[#53615A] truncate">
            {currentLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ai-analysis"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8E0D3]/60 text-[#161B19] border border-[#D5C9B8] hover:bg-[#E8E0D3] text-xs font-medium transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#123D32]" />
            <span>AI Analysis</span>
          </Link>

          <Link
            href="/ai-insights"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#123D32] text-white hover:bg-[#0B2822] text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B89B72]" />
            <span>AI Insights</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
