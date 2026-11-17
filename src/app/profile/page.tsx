'use client';

import React from 'react';
import Link from 'next/link';
import {
  Info,
  ArrowRight,
  LogOut,
  Database,
  ShieldCheck,
  GitMerge,
} from 'lucide-react';
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
      <div className="border-b border-[#DCE4DD] pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0]">
            Platform Scope &amp; Governance
          </span>
          <span className="text-[#9BA8A0] text-xs">•</span>
          <span className="text-xs text-[#53615A] font-medium">Leeg Executive Reference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#161B19] tracking-tight">
          Methodology &amp; Integration Scope
        </h1>
      </div>

      {/* Authenticated Operator Profile Card */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#123D32] flex items-center justify-center text-white font-bold text-sm">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#161B19] truncate">
                {user?.email || 'Authenticated Operator'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#123D32]" />
                Verified Session
              </span>
            </div>
            <p className="text-[11px] text-[#53615A] mt-0.5">
              VP of Product Workspace &bull; Row-Level Security Enforced
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-[#53615A] hidden md:flex items-center gap-1.5 mr-2">
            <Database className="w-3.5 h-3.5 text-[#6F9B86]" />
            <span>{isConfigured ? 'Supabase Live' : 'Supabase Ready'}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Part 7: Priority vs Flagged Methodology */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123D32]">
          <ShieldCheck className="w-4 h-4" />
          <span>Priority Classification vs. Flagged Marker</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#53615A]">
          <div className="p-3.5 rounded-lg bg-[#F8FAF7] border border-[#DCE4DD] space-y-1.5">
            <p className="font-bold text-[#161B19]">Priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)</p>
            <p className="leading-relaxed">
              Measures issue severity: <strong>CRITICAL</strong> for privacy/security risks or severe outages (e.g., Feedback #10), <strong>HIGH</strong> for major product blockers, <strong>MEDIUM</strong> for recurring usability friction, and <strong>LOW</strong> for minor suggestions.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#F8FAF7] border border-[#DCE4DD] space-y-1.5">
            <p className="font-bold text-[#161B19]">Flagged (`is_flagged`) &amp; AI Suggestions</p>
            <p className="leading-relaxed">
              <strong>Flagged</strong> is an independent review marker that can apply at any priority level. Live AI Analysis provides advisory priority suggestions requiring human review and does not overwrite stored database priorities.
            </p>
          </div>
        </div>
      </div>

      {/* Part 10: External Channel Feasibility Note */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123D32]">
            <GitMerge className="w-4 h-4" />
            <span>Channel Ingestion Architecture (Seeded vs. Future Live Connectors)</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
            6 Sources Table Rows
          </span>
        </div>
        <p className="text-xs text-[#53615A] leading-relaxed">
          Current channel tags (<strong>Slack</strong>, <strong>Gmail</strong>, <strong>LinkedIn</strong>, <strong>Instagram</strong>, <strong>User Research</strong>, and <strong>Product Analytics</strong>) represent seeded example sources stored in the `public.&quot;Sources&quot;` table. Future live connectors will require per-platform OAuth 2.0 scopes, webhook signature verification, rate-limit queuing, and PII scrubbing before database insertion.
        </p>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <Link
          href="/dashboard"
          className="font-semibold text-[#123D32] hover:underline"
        >
          ← Back to Executive Overview
        </Link>
        <Link
          href="/feedback"
          className="px-4 py-2 rounded-lg bg-[#123D32] text-white font-semibold hover:bg-[#0B2822] transition-colors inline-flex items-center gap-1.5"
        >
          <span>Open Feedback Explorer</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#A8CBB7]" />
        </Link>
      </div>
    </div>
  );
}
