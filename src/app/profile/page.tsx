'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Info,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  User,
  LogOut,
  Database,
} from 'lucide-react';
import { sampleSourceStats, themeInsights } from '../../data/feedbackData';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
            Internal Platform Scope
          </span>
          <span className="text-slate-300 text-xs">•</span>
          <span className="text-xs text-slate-500 font-medium">Leeg Client Briefing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Prototype Scope & Design System
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          This discovery prototype demonstrates how Leeg centralizes member signals from community channels and user interviews into actionable product intelligence.
        </p>
      </div>

      {/* Authenticated Operator Profile Card */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0c111d] border border-slate-850 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {user?.email || 'vp.product@leeg.ai'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Role: VP of Product &bull; Internal Intelligence Access &bull; Session Persisted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-1.5 mr-2">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{isConfigured ? 'Supabase Live' : 'Supabase Config Ready'}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Scope Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Info className="w-3.5 h-3.5 text-purple-600" />
          <span>Product Intelligence Objectives</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The purpose of this platform is to provide the Leeg product leadership (especially the VP of Product) with an executive command center to organize scattered feedback across community channels, identify high-frequency themes, surface emerging friction before it escalates, and inspect verbatim customer evidence backing each recommendation.
        </p>

        <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200 text-xs space-y-2">
          <p className="font-semibold text-slate-900">Core Design & Functional Principles:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <strong className="text-slate-800">Career OS Focus:</strong> Synthetic signals are specifically anchored in career development use cases (mock interviews, resume scoring, mentor chats, and application pipelines).
            </li>
            <li>
              <strong className="text-slate-800">Verbatim Attribution:</strong> Every aggregated theme links directly to authentic member quotes with author context and intake channel tags.
            </li>
            <li>
              <strong className="text-slate-800">Professional SaaS Aesthetics:</strong> Clean dark navy navigation, off-white background canvas, restrained purple branding, and Linear-inspired card hierarchy.
            </li>
            <li>
              <strong className="text-slate-800">Zero Speculative Integrations:</strong> No fake API credentials or unvalidated enterprise IT noise.
            </li>
          </ul>
        </div>
      </div>

      {/* Synthesized Channels Grid */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900">
            Synthesized Ingestion Channels
          </h2>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
            6 Intake Feeds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {sampleSourceStats.map((src) => (
            <div
              key={src.source}
              className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900 block text-xs">{src.label}</span>
                <span className="text-slate-500 text-[11px]">{src.count} sample records ({src.percentage}%)</span>
              </div>
              <Link
                href={`/feedback?source=${encodeURIComponent(src.source)}`}
                className="font-medium text-purple-600 hover:text-purple-800 flex items-center gap-0.5 text-[11px]"
              >
                Inspect <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <Link
          href="/"
          className="font-medium text-slate-600 hover:text-slate-900"
        >
          ← Return to Dashboard
        </Link>
        <Link
          href="/feedback"
          className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          Explore Feedback Quotes
        </Link>
      </div>
    </div>
  );
}
