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
  ShieldCheck,
  BarChart2,
  TrendingUp,
  MessageSquare,
  Clock,
  Compass,
} from 'lucide-react';
import { sampleSourceStats, themeInsights, emergingThemes } from '@/data/feedbackData';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <LeegLogo size={32} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">Leeg</span>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200/70">
                Feedback Intelligence
              </span>
            </div>
          </Link>

          {/* Top-Right Action Navigation */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none opacity-60" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>Internal Product Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Turn scattered customer feedback into{' '}
            <span className="text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded-lg">
              clear product intelligence.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Leeg Feedback Intelligence is an internal platform designed to help Leeg's product team
            organize customer feedback from multiple sources, identify meaningful patterns,
            surface important issues, and investigate the evidence behind customer insights.
          </p>

          <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Instead of manually searching through scattered feedback, the platform creates one
            structured workspace where feedback can be reviewed, searched, filtered, categorized,
            and analyzed more efficiently.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* 3. VISUAL PRODUCT PREVIEW (Exact Reference to Existing Dashboard) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
            Interface Preview
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            Built for executive clarity and verbatim verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synthesizing customer input across Slack, emails, interviews, and community notes.
          </p>
        </div>

        {/* Dashboard Mock Shell */}
        <div className="rounded-2xl border border-slate-300/80 bg-white shadow-md overflow-hidden">
          {/* Mock Window Header */}
          <div className="bg-[#0c111d] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="text-[11px] font-mono text-slate-400 ml-2">
                leeg-intelligence.internal / dashboard
              </span>
            </div>
            <span className="text-[10px] font-medium text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
              VP of Product Workspace
            </span>
          </div>

          {/* Inner Dashboard Preview Body */}
          <div className="p-6 sm:p-8 bg-[#f8fafc] space-y-6">
            {/* KPI Metrics Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Total Feedback Records</span>
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">48</span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    +18% MoM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Aggregated across 6 multi-channel intake feeds
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Identified Themes</span>
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {themeInsights.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Core Product Clusters</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Top: AI Interview Practice & Resume ATS
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Emerging Friction Points</span>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {emergingThemes.length}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Active Triage
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mobile Safari latency & resume score breakdown
                </p>
              </div>
            </div>

            {/* Ingestion Distribution Preview */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-800">Feedback Distribution by Intake Source</span>
                <span className="text-[10px] text-slate-400 font-mono">6 Connected Streams</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 flex overflow-hidden mb-3">
                {sampleSourceStats.map((src) => (
                  <div
                    key={src.source}
                    style={{ width: `${src.percentage}%`, backgroundColor: src.color }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px]">
                {sampleSourceStats.map((src) => (
                  <div
                    key={src.source}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: src.color }}
                    />
                    <span className="text-slate-600 truncate">{src.source}</span>
                    <span className="text-slate-400 font-mono ml-auto">{src.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verbatim Quote Record Preview */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-800">Verbatim Feedback Sample</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                  Slack Community
                </span>
              </div>
              <div className="text-xs text-slate-700 italic border-l-2 border-purple-500 bg-slate-50/70 p-3 rounded-r-lg">
                "The mock interview generator gave great questions, but the speech analysis took almost 25 seconds to generate feedback on mobile. Can we get real-time pacing feedback while speaking?"
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Extracted Goal: Accelerate mobile speech feedback latency</span>
                <span className="text-purple-600 font-semibold">Verified Verbatim</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FIVE CONCISE FEATURE SECTIONS */}
      <section className="bg-white border-y border-slate-200/80 py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Structured feedback workflows for high-growth product teams
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Five essential mechanisms to transform raw customer noise into validated product decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Centralized Repository */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#0c111d] text-white flex items-center justify-center mb-3.5 shadow-2xs">
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Centralized Feedback Repository
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Brings customer signals from multiple intake channels—including member emails,
                  community Slack messages, user interviews, and direct inquiries—into one unified,
                  structured location.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400">
                Multi-channel aggregation
              </div>
            </div>

            {/* Feature 2: Search & Filtering */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#0c111d] text-white flex items-center justify-center mb-3.5 shadow-2xs">
                  <Search className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Search & Multi-Dimensional Filtering
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quickly search verbatim quotes and filter inputs by source channel, career product
                  area, recurring theme, sentiment, date range, or triage urgency in seconds.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400">
                Instant querying & CSV export
              </div>
            </div>

            {/* Feature 3: AI-Powered Insights */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#0c111d] text-white flex items-center justify-center mb-3.5 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  AI-Powered Insights & Synthesis
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatically groups similar customer requests, synthesizes recurring themes,
                  and surfaces emerging usability friction across the entire feedback dataset.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400">
                Automated clustering & summary
              </div>
            </div>

            {/* Feature 4: Important Feedback Detection */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#0c111d] text-white flex items-center justify-center mb-3.5 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Important Feedback Detection
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Highlights potentially critical one-off friction or blocker signals so vital
                  member pain points are not overlooked simply because they appear less frequently.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400">
                Proactive triage & anomaly alerts
              </div>
            </div>

            {/* Feature 5: Evidence-Based Investigation */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#0c111d] text-white flex items-center justify-center mb-3.5 shadow-2xs">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  Evidence-Based Investigation & Attribution
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every aggregated theme and AI insight traces directly back to original, verbatim
                  customer quotes. Product managers can inspect the exact author context, intake
                  channel, and member situation before committing engineering roadmap resources.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400">
                1-click drilldown into verbatim source records
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-10 rounded-2xl bg-[#0c111d] border border-slate-800 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center justify-center mb-1">
              <LeegLogo size={42} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              From raw feedback to clearer product decisions.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Consolidate member voice across channels, test product hypotheses with verbatim proof,
              and lead Leeg's Career OS forward with clarity.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                Sign In
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 pt-3">
              Internal product intelligence workspace for the Leeg team.
            </p>
          </div>
        </div>
      </section>

      {/* 6. SYSTEM FOOTER */}
      <footer className="border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LeegLogo size={20} />
            <span className="font-semibold text-slate-800">Leeg Feedback Intelligence</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Leeg Technologies Inc. &bull; Calgary Startup &bull; Career Operating System
          </p>
        </div>
      </footer>
    </div>
  );
}
