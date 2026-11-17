'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const SAMPLE_SOURCES = [
  'Slack',
  'Gmail',
  'LinkedIn',
  'Instagram',
  'User Research',
  'Product Analytics',
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#161B19] tracking-tight">
        About
      </h1>

      {/* Signed-in Account */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#123D32] flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#161B19] truncate">
              {user?.email || 'Signed in'}
            </p>
            <p className="text-xs text-[#53615A]">
              Active Supabase session
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-[#161B19] bg-[#F8FAF7] border border-[#DCE4DD] hover:bg-[#EFF3EF] transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Priority vs Flagged */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-2 text-xs">
        <h2 className="text-sm font-bold text-[#161B19]">
          Priority vs. Flagged
        </h2>
        <p className="text-[#53615A] leading-relaxed">
          <strong className="text-[#161B19]">Priority</strong> indicates issue severity: <strong className="text-red-700">Critical</strong> (major privacy or security risks such as Feedback #10), <strong className="text-amber-800">High</strong> (serious product blockers), <strong className="text-[#5C4930]">Medium</strong> (usability issues), and <strong className="text-[#123D32]">Low</strong> (minor suggestions).
        </p>
        <p className="text-[#53615A] leading-relaxed">
          <strong className="text-[#161B19]">Flagged</strong> is a separate review marker indicating any feedback item that requires follow-up. AI-suggested priorities on the AI Analysis page are advisory and never overwrite stored priorities.
        </p>
      </div>

      {/* Sample Data Sources */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#161B19]">
            Sample Data Sources
          </h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#E8E0D3]/70 text-[#5C4930] border border-[#D5C9B8]">
            Seeded Demo Data
          </span>
        </div>
        <p className="text-[#53615A] leading-relaxed">
          The six channels below represent sample sources stored in Supabase, not live connected integrations:
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SAMPLE_SOURCES.map((src) => (
            <Link
              key={src}
              href={`/feedback?source=${encodeURIComponent(src)}`}
              className="px-2.5 py-1 rounded-md bg-[#F8FAF7] hover:bg-[#EFF3EF] border border-[#DCE4DD] text-[#161B19] font-medium transition-colors"
            >
              {src}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs">
        <Link
          href="/dashboard"
          className="font-semibold text-[#123D32] hover:underline"
        >
          ← Overview
        </Link>
        <Link
          href="/feedback"
          className="px-4 py-2 rounded-lg bg-[#123D32] text-white font-semibold hover:bg-[#0B2822] transition-colors inline-flex items-center gap-1.5"
        >
          <span>All Feedback</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B89B72]" />
        </Link>
      </div>
    </div>
  );
}
