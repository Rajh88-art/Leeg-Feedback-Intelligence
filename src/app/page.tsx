'use client';

import React from 'react';
import Link from 'next/link';
import LeegLogo from '@/components/LeegLogo';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  Search,
  Sparkles,
  AlertCircle,
  FileText,
  ArrowRight,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { sampleSourceStats, themeInsights, emergingThemes } from '@/data/feedbackData';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#161B19] selection:bg-[#EFF3EF] selection:text-[#123D32]">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#F8FAF7]/90 backdrop-blur-md border-b border-[#DCE4DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <LeegLogo size={32} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#161B19] text-sm tracking-tight">Leeg</span>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
                Feedback Intelligence
              </span>
            </div>
          </Link>

          {/* Top-Right Action Navigation */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-all shadow-2xs"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8CBB7]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#161B19] hover:text-[#123D32] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-all shadow-2xs"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-14 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-80 bg-[#6F9B86]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0] text-[11px] font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#123D32]" />
            <span>Executive Product Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#161B19] leading-tight">
            Turn scattered member feedback into{' '}
            <span className="text-[#123D32] bg-[#EFF3EF] border border-[#DCE4DD] px-2.5 py-0.5 rounded-xl">
              clear product decisions.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#53615A] max-w-2xl mx-auto leading-relaxed">
            Organize multi-channel customer signals, detect high-priority product risks, and
            validate roadmap priorities with direct verbatim evidence and academic research context.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-all shadow-xs"
            >
              <span>{user ? 'Go to Dashboard' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A8CBB7]" />
            </Link>
            {!user && (
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white border border-[#CED9D0] text-[#161B19] text-xs font-semibold hover:bg-[#EFF3EF] transition-all shadow-2xs"
              >
                Register Employee Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 3. VISUAL PRODUCT PREVIEW */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl border border-[#CED9D0] bg-white shadow-sm overflow-hidden">
          <div className="bg-[#0B2822] px-4 py-3 border-b border-[#1A4237] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#245A4B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#245A4B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#245A4B]" />
              <span className="text-[11px] font-mono text-[#A8CBB7] ml-2">
                leeg-intelligence / executive-overview
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#D7E8DF] bg-[#123D32] border border-[#296353] px-2 py-0.5 rounded">
              VP of Product Workspace
            </span>
          </div>

          <div className="p-5 sm:p-6 bg-[#F8FAF7] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#DCE4DD]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#53615A] uppercase tracking-wider">
                <span>Seeded Feedback</span>
                <MessageSquare className="w-3.5 h-3.5 text-[#6F9B86]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#161B19]">20</span>
                <span className="text-[10px] font-medium text-[#123D32] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0]">
                  6 Channels
                </span>
              </div>
              <p className="text-[11px] text-[#53615A] mt-1">
                Verbatim records linked to product themes
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#DCE4DD]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#53615A] uppercase tracking-wider">
                <span>Product Themes</span>
                <Layers className="w-3.5 h-3.5 text-[#123D32]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#161B19]">7</span>
                <span className="text-[10px] text-[#53615A]">Core Areas</span>
              </div>
              <p className="text-[11px] text-[#53615A] mt-1">
                Interview prep, mentorship, mobile &amp; privacy
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#DCE4DD]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#53615A] uppercase tracking-wider">
                <span>Critical &amp; Flagged</span>
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#161B19]">
                  {emergingThemes.length + 1}
                </span>
                <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300">
                  Priority Triage
                </span>
              </div>
              <p className="text-[11px] text-[#53615A] mt-1">
                Includes critical one-off privacy escalations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONCISE CAPABILITIES GRID */}
      <section className="bg-white border-y border-[#DCE4DD] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32] bg-[#EFF3EF] px-2.5 py-0.5 rounded border border-[#CED9D0]">
              Platform Capabilities
            </span>
            <h2 className="text-2xl font-extrabold text-[#161B19] tracking-tight mt-2">
              Focused intelligence without information overload
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-[#F8FAF7] border border-[#DCE4DD] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#123D32] text-white flex items-center justify-center">
                <Search className="w-4 h-4 text-[#A8CBB7]" />
              </div>
              <h3 className="text-sm font-bold text-[#161B19]">
                Scannable Feedback Explorer
              </h3>
              <p className="text-xs text-[#53615A] leading-relaxed">
                Filter records by source, theme, date, or priority with progressive disclosure for long verbatim quotes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAF7] border border-[#DCE4DD] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#123D32] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#A8CBB7]" />
              </div>
              <h3 className="text-sm font-bold text-[#161B19]">
                Live AI Prioritization
              </h3>
              <p className="text-xs text-[#53615A] leading-relaxed">
                On-demand OpenRouter analysis with code-enforced citation validation and one-off privacy risk escalation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAF7] border border-[#DCE4DD] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#123D32] text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#A8CBB7]" />
              </div>
              <h3 className="text-sm font-bold text-[#161B19]">
                External Research Context
              </h3>
              <p className="text-xs text-[#53615A] leading-relaxed">
                Search published OpenAlex academic literature alongside internal feedback to validate product hypotheses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#53615A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LeegLogo size={20} />
            <span className="font-semibold text-[#161B19]">Leeg Feedback Intelligence</span>
          </div>
          <p className="text-[11px] text-[#53615A]">
            Leeg Technologies Inc. &bull; Internal Product Intelligence Workspace
          </p>
        </div>
      </footer>
    </div>
  );
}
