'use client';

import React from 'react';
import Link from 'next/link';
import LeegLogo from '@/components/LeegLogo';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#161B19]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#F8FAF7]/90 backdrop-blur-md border-b border-[#DCE4DD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LeegLogo size={30} />
            <span className="font-bold text-[#161B19] text-sm tracking-tight">
              Leeg Feedback Intelligence
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B89B72]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#161B19] hover:text-[#123D32]"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-[#E8E0D3]/70 text-[#5C4930] border border-[#D5C9B8] text-[11px] font-semibold mb-4">
          Customer Feedback Workspace
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#161B19] leading-tight">
          Understand customer feedback at a glance.
        </h1>

        <p className="mt-3 text-sm sm:text-base text-[#53615A] max-w-xl mx-auto leading-relaxed">
          Search customer quotes, spot repeated issues across topics, and prioritize what to fix next.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={user ? '/dashboard' : '/login'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors"
          >
            <span>{user ? 'Go to Dashboard' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B89B72]" />
          </Link>
          {!user && (
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white border border-[#DCE4DD] text-[#161B19] text-xs font-semibold hover:bg-[#EFF3EF] transition-colors"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>

      {/* 3 Simple Feature Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#123D32] text-white flex items-center justify-center">
              <Search className="w-4 h-4 text-[#B89B72]" />
            </div>
            <h2 className="text-sm font-bold text-[#161B19]">
              Searchable Feedback
            </h2>
            <p className="text-xs text-[#53615A] leading-relaxed">
              Filter customer quotes by topic, source, priority, or date and open any record for the full quote.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#123D32] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#B89B72]" />
            </div>
            <h2 className="text-sm font-bold text-[#161B19]">
              AI Prioritization
            </h2>
            <p className="text-xs text-[#53615A] leading-relaxed">
              Review key findings, repeated issues, and live AI suggestions with links to actual customer feedback.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#123D32] text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#B89B72]" />
            </div>
            <h2 className="text-sm font-bold text-[#161B19]">
              External Research
            </h2>
            <p className="text-xs text-[#53615A] leading-relaxed">
              Look up published OpenAlex research related to interview coaching, mentorship, and career tools.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DCE4DD] py-6 px-4 sm:px-6 lg:px-8 text-xs text-[#53615A]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LeegLogo size={18} />
            <span className="font-semibold text-[#161B19]">Leeg</span>
          </div>
          <span>Internal Product Workspace</span>
        </div>
      </footer>
    </div>
  );
}
