'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  feedbackList,
  themeInsights,
  emergingThemes,
  sampleSourceStats,
} from '../data/feedbackData';
import { ThemeInsight } from '../types/feedback';
import ThemeDrilldownModal from '../components/ThemeDrilldownModal';

export default function DashboardPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeInsight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openThemeModal = (theme: ThemeInsight) => {
    setSelectedTheme(theme);
    setIsModalOpen(true);
  };

  const openThemeByName = (themeName: string) => {
    const found = themeInsights.find(
      (t) => t.name.toLowerCase() === themeName.toLowerCase()
    );
    if (found) {
      setSelectedTheme(found);
      setIsModalOpen(true);
    }
  };

  const recentFeedback = feedbackList.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
              VP of Product Overview
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">Leeg Career OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Customer Feedback Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Synthesizing customer signals from community channels, member emails, interviews, and social touchpoints into validated product momentum.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-all shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Browse All Quotes</span>
          </Link>
          <Link
            href="/ai-insights"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Insights Digest</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Feedback Collected */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Feedback Records
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">48</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Aggregated across 6 multi-channel intake streams
          </p>
        </div>

        {/* Top Recurring Themes */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Identified Themes
            </span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{themeInsights.length}</span>
            <span className="text-xs text-slate-500 font-medium">Core Product Clusters</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Top: AI Interview Practice (14) & Resume ATS (12)
          </p>
        </div>

        {/* Emerging Issues */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Emerging Friction Points
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{emergingThemes.length}</span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70">
              Active Triage
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Mobile Safari latency & resume score breakdown
          </p>
        </div>
      </div>

      {/* Emerging Themes & Friction Alert Banner */}
      <div className="p-5 rounded-xl bg-white border border-amber-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase tracking-wider">
              Emerging Member Friction • Needs Product Attention
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            3 Active Patterns Flagged by AI Triage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {emergingThemes.map((issue) => (
            <div
              key={issue.id}
              onClick={() => openThemeByName(issue.theme)}
              className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    Friction
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {issue.sourceHighlight}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 mb-1">
                  {issue.title}
                </h3>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {issue.userObservation}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate max-w-[170px]">
                  Focus: {issue.suggestedFocus}
                </span>
                <span className="font-semibold text-purple-600 group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Column Section: Top Recurring Themes & Ingestion Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Top Recurring Themes</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any theme card to inspect the original customer quotes backing that insight.
            </p>
          </div>
          <Link
            href="/ai-insights"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            All Themes ({themeInsights.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themeInsights.map((theme) => (
            <div
              key={theme.id}
              onClick={() => openThemeModal(theme)}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                    {theme.careerProductArea}
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                    {theme.count} quotes
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors mb-1.5 leading-snug">
                  {theme.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
                  {theme.summary}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-[11px] text-slate-700 mb-3">
                  <span className="font-semibold text-slate-900 block mb-0.5">User Goal:</span>
                  <span className="italic line-clamp-1">"{theme.coreUserGoal}"</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[160px]">
                  {theme.trendLabel}
                </span>
                <span className="font-semibold text-purple-600 group-hover:underline flex items-center gap-0.5 shrink-0">
                  Inspect quotes <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Channels Distribution Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-slate-600" />
              <span>Feedback Distribution by Ingested Source</span>
            </h2>
            <p className="text-xs text-slate-500">
              Proportional breakdown of member input across community, survey, and direct channels.
            </p>
          </div>
          <Link
            href="/feedback"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 self-start sm:self-auto"
          >
            Filter by source <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Distribution Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-100 flex overflow-hidden my-3">
          {sampleSourceStats.map((src) => (
            <div
              key={src.source}
              style={{
                width: `${src.percentage}%`,
                backgroundColor: src.color,
              }}
              title={`${src.label}: ${src.count} (${src.percentage}%)`}
            />
          ))}
        </div>

        {/* Source Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
          {sampleSourceStats.map((src) => (
            <Link
              key={src.source}
              href={`/feedback?source=${encodeURIComponent(src.source)}`}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: src.color }}
                />
                <span className="font-medium text-slate-700 truncate text-[11px]">{src.source}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{src.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Feedback Feed (Real Customer Intelligence Records) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Recent Customer Feedback Records</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live chronological feed of verbatim member inputs with AI-extracted user goals.
            </p>
          </div>
          <Link
            href="/feedback"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            View all 12 records <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentFeedback.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Record Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.author.avatar}
                      alt={item.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {item.author.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.author.role} • {item.author.location}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                    {item.source}
                  </span>
                </div>

                {/* Verbatim Quote with clean left border */}
                <div className="text-xs text-slate-800 italic leading-relaxed border-l-2 border-purple-500 bg-slate-50/60 p-3 rounded-r-lg mb-2.5">
                  "{item.rawQuote.replace(/^"|"$/g, '')}"
                </div>

                {/* Extracted Goal */}
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-900">Extracted Goal: </span>
                  <span>{item.userGoal}</span>
                </div>
              </div>

              {/* Record Footer */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {new Date(item.date).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                  })} • {item.careerProductArea}
                </span>
                <Link
                  href={`/feedback/${item.id}`}
                  className="font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Detail <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drilldown Modal */}
      <ThemeDrilldownModal
        theme={selectedTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
