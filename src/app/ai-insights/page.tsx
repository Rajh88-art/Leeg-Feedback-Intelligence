'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ChevronRight,
  GitMerge,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Database,
  ExternalLink,
} from 'lucide-react';
import { fetchAIInsightsData, fetchAllFeedbackData } from '@/services/feedbackDbService';
import { EnrichedAIInsight, EnrichedTheme, EnrichedFeedback } from '@/types/database';
import ThemeDrilldownModal from '../../components/ThemeDrilldownModal';

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<EnrichedAIInsight[]>([]);
  const [themes, setThemes] = useState<EnrichedTheme[]>([]);
  const [feedback, setFeedback] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<EnrichedTheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [aiRes, fbRes] = await Promise.all([
        fetchAIInsightsData(),
        fetchAllFeedbackData(),
      ]);
      setInsights(aiRes.insights);
      setThemes(fbRes.themes);
      setFeedback(fbRes.feedback);
    } catch (err: any) {
      console.error('Failed to load AI Insights from Supabase:', err);
      setError(err?.message || 'Failed to connect to Supabase database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openThemeModal = (theme: EnrichedTheme) => {
    setSelectedTheme(theme);
    setIsModalOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/80';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-600" />
              Supabase Intelligence Synthesis
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {loading ? 'Connecting...' : `${insights.length} Database Insights • ${themes.length} Themes`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Customer Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Automated semantic clustering, cross-channel pattern detection, and strategic product focus areas generated from live customer feedback records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh AI insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {themes.length > 0 && (
            <button
              onClick={() => openThemeModal(themes[0])}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Theme Drilldown Modal</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Database query issue: {error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 rounded bg-rose-700 text-white font-medium text-xs hover:bg-rose-800 transition-colors"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Executive Briefing Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs border-l-4 border-l-purple-600 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Executive Member Voice Digest • VP of Product Briefing</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Synthetic Demonstration Data
          </span>
          <span className="text-[10px] text-slate-400">Pre-generated from seeded Supabase records &middot; Not live AI output</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Career Development Momentum Strong; Critical Privacy Concern &amp; Mobile Reliability Flagged for Triage
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          Across <strong>20 seeded feedback records</strong> and <strong>7 product themes</strong>, member engagement clusters around <strong>career development progress</strong>, <strong>AI interview preparation</strong>, and <strong>mentorship interest</strong>. Members report meaningful gains using AI-assisted resume scoring and mock interview coaching. A critical one-off concern in <strong>Feedback #10</strong> &mdash; involving account access restrictions and privacy permissions &mdash; is escalated as a high-severity product risk and must not be overlooked despite being a single data point. Supporting signals also identify recurring <strong>mobile reliability friction</strong> (audio lag on iOS) and unmet demand for <strong>structured mentorship matching</strong>.
        </p>
      </div>

      {/* Database Stored AI Insights (6 Live Rows from public."AI Insights") */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Database Synthesized AI Insights ({insights.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real strategic insights generated and stored in Supabase with linked customer evidence records.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3 animate-pulse"
              >
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-14 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        Insight #{insight.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70">
                        {insight.insightType}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                        insight.priority
                      )}`}
                    >
                      {insight.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors mb-1.5 leading-snug">
                    {insight.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {insight.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium truncate max-w-[200px]">
                      Theme: {insight.themeName}
                    </span>

                    {/* Evidence links */}
                    {insight.referencedFeedbackIds.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-slate-400 text-[10px]">Evidence:</span>
                        {insight.referencedFeedbackIds.map((fId) => (
                          <Link
                            key={fId}
                            href={`/feedback/${fId}`}
                            className="font-mono font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200/60 text-[10px] transition-colors"
                          >
                            #{fId}
                          </Link>
                        ))}
                      </div>
                    ) : insight.feedbackId ? (
                      <Link
                        href={`/feedback/${insight.feedbackId}`}
                        className="font-mono font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60 text-[10px]"
                      >
                        Evidence #{insight.feedbackId}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Themes Grid (7 Themes from Supabase) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Recurring Themes & Product Focus Areas ({themes.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any theme card to open the exact supporting quotes stored in the database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => openThemeModal(theme)}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                    {theme.category || 'Theme'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                    {theme.count} {theme.count === 1 ? 'quote' : 'quotes'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors mb-1.5 leading-snug">
                  {theme.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {theme.description}
                </p>

                {theme.flaggedCount > 0 && (
                  <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{theme.flaggedCount} flagged friction item requiring triage</span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">
                  Theme #{theme.id}
                </span>
                <span className="font-semibold text-purple-600 group-hover:underline flex items-center gap-0.5 shrink-0">
                  Inspect evidence <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Channel Converging Feedback Patterns */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-purple-600" />
            <span>Cross-Channel Converging Patterns</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connecting isolated feedback from Slack, Gmail, user interviews, and social channels into cohesive root causes.
          </p>
        </div>

        <div className="space-y-3.5">
          {insights.slice(0, 3).map((cluster) => {
            const matchingTheme = themes.find((t) => t.id === cluster.themeId || t.name === cluster.themeName);
            return (
              <div
                key={cluster.id}
                className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[11px] font-semibold text-purple-700">
                      Theme: {cluster.themeName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {cluster.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium self-start sm:self-auto">
                    Priority: {cluster.priority.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                  <p>{cluster.summary}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-200 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">Referenced Evidence:</span>
                    {cluster.referencedFeedbackIds.length > 0 ? (
                      cluster.referencedFeedbackIds.map((id) => (
                        <Link
                          key={id}
                          href={`/feedback/${id}`}
                          className="font-mono text-purple-700 font-semibold bg-white px-2 py-0.5 rounded border border-purple-200 hover:bg-purple-50 transition-colors"
                        >
                          Feedback #{id}
                        </Link>
                      ))
                    ) : (
                      <span className="text-slate-500">Synthesized from customer signals</span>
                    )}
                  </div>

                  {matchingTheme && (
                    <button
                      onClick={() => openThemeModal(matchingTheme)}
                      className="shrink-0 px-3 py-1 rounded-md bg-slate-900 text-white font-medium text-[11px] hover:bg-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      Inspect All {matchingTheme.count} Quotes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drilldown Modal */}
      <ThemeDrilldownModal
        theme={selectedTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={feedback}
      />
    </div>
  );
}
