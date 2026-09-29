'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Info,
  Layers,
  Compass,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { sampleSourceStats, themeInsights } from '../../data/feedbackData';

export default function ProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
            Project Overview
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs text-slate-500 font-medium">Leeg Client Demonstration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Prototype Scope & Purpose
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          This discovery prototype demonstrates how Leeg can aggregate scattered feedback across community channels and surface actionable career product intelligence.
        </p>
      </div>

      {/* Scope Card */}
      <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
          <Info className="w-4 h-4 text-purple-600" />
          <span>About This Discovery Prototype</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          The purpose of this application is to give the Leeg team an interactive visualization of how multi-channel member feedback (from Slack, Gmail, LinkedIn, Instagram, user research, and in-app telemetry) can be centralized into a high-clarity dashboard.
        </p>

        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 space-y-2">
          <p className="font-bold text-purple-900">Key Product Principles Applied:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>
              <strong>Member-Centric Focus:</strong> Feedback is tailored directly to Leeg's Career Operating System (interview coaching, resume scoring, mentor chats, and application tracking).
            </li>
            <li>
              <strong>Transparent Evidence:</strong> Every recurring theme or emerging issue links directly to the original customer quote backing it.
            </li>
            <li>
              <strong>Zero False Credentials:</strong> All data is explicitly treated as realistic discovery sample data without fictitious API integrations.
            </li>
            <li>
              <strong>Uncluttered Hierarchy:</strong> Generous whitespace, readable typography, and purple accents replace generic enterprise clutter.
            </li>
          </ul>
        </div>
      </div>

      {/* Sample Channels Overview */}
      <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Synthesized Sample Channels
          </h2>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
            6 Intake Streams
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {sampleSourceStats.map((src) => (
            <div
              key={src.source}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 block text-sm">{src.label}</span>
                <span className="text-slate-500 text-[11px]">{src.count} sample records ({src.percentage}%)</span>
              </div>
              <Link
                href={`/feedback?source=${encodeURIComponent(src.source)}`}
                className="font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                Browse <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Return to Dashboard
        </Link>
        <Link
          href="/feedback"
          className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors shadow-xs"
        >
          Explore Feedback Quotes
        </Link>
      </div>
    </div>
  );
}
