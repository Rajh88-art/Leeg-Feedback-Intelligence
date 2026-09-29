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
  Compass,
  ChevronRight,
  User,
  HeartHandshake,
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
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Leeg Career OS
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">Customer Voice Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Feedback Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Organizing member feedback from Slack, Gmail, LinkedIn, Instagram, user research, and analytics to surface recurring themes and emerging needs.
          </p>
        </div>

        <Link
          href="/ai-insights"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all shadow-xs hover:shadow-purple-100 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>View AI Insights</span>
        </Link>
      </div>

      {/* Top 3 Prioritized Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Feedback Collected */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Feedback Collected
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">48</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              Sample records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Aggregated across 6 discovery channels
          </p>
        </div>

        {/* Top Recurring Themes */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Recurring Themes
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{themeInsights.length}</span>
            <span className="text-xs font-medium text-slate-500">core topic areas</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Leading: AI Interview Practice & Resume Scoring
          </p>
        </div>

        {/* Emerging Issues */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Emerging Themes & Issues
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{emergingThemes.length}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Needs attention
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Mobile audio delay & score transparency
          </p>
        </div>
      </div>

      {/* Top Recurring Themes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Top Recurring Themes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any theme card below to see the supporting customer quotes and notes.
            </p>
          </div>
          <Link
            href="/ai-insights"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            Explore all themes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themeInsights.map((theme) => (
            <div
              key={theme.id}
              onClick={() => openThemeModal(theme)}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {theme.careerProductArea}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {theme.count} mentions
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2 leading-snug">
                  {theme.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {theme.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {theme.trendLabel}
                </span>
                <span className="font-bold text-purple-600 group-hover:underline flex items-center gap-1">
                  View quotes <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Themes & Issues Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Emerging Issues & Member Friction</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
              Needs Product Attention
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            New patterns emerging from recent member correspondence and discovery interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {emergingThemes.map((issue) => (
            <div
              key={issue.id}
              onClick={() => openThemeByName(issue.theme)}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Recent Friction
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {issue.sourceHighlight}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors mb-2 leading-snug">
                  {issue.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {issue.userObservation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Focus: {issue.suggestedFocus.substring(0, 32)}...
                </span>
                <span className="font-semibold text-purple-600 group-hover:underline flex items-center gap-0.5 shrink-0">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recent Member Feedback
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Original voice of Leeg job seekers, career switchers, and mentors.
            </p>
          </div>
          <Link
            href="/feedback"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            Browse all feedback <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recentFeedback.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.author.avatar}
                      alt={item.author.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {item.author.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.author.role} • {item.author.location}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.source}
                  </span>
                </div>

                <p className="text-sm text-slate-700 italic font-serif leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {item.rawQuote}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Goal: "{item.userGoal.substring(0, 48)}..."
                </span>
                <Link
                  href={`/feedback/${item.id}`}
                  className="font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  Detail <ArrowRight className="w-3.5 h-3.5" />
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
