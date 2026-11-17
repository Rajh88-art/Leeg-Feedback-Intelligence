'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  ChevronRight,
  GitMerge,
  AlertTriangle,
  RefreshCw,
  Database,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  ShieldAlert,
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

  // Progressive disclosure states (Part 2 & Part 4)
  const [activeTab, setActiveTab] = useState<'all' | 'insights' | 'patterns'>('all');
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [expandedInsightIds, setExpandedInsightIds] = useState<number[]>([]);
  const [showDigestDetails, setShowDigestDetails] = useState(false);

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

  const openThemeByName = (themeName: string, themeId?: number) => {
    const found = themes.find(
      (t) =>
        (themeId && t.id === themeId) ||
        t.name.toLowerCase() === themeName.toLowerCase()
    );
    if (found) {
      setSelectedTheme(found);
      setIsModalOpen(true);
    }
  };

  const toggleInsightExpand = (id: number) => {
    setExpandedInsightIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'high':
        return 'bg-orange-50 text-orange-800 border-orange-200 font-semibold';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      case 'low':
      default:
        return 'bg-[#EFF3EF] text-[#123D32] border-[#CED9D0] font-medium';
    }
  };

  // Sort insights so critical & high priority takeaways appear in the top 4
  const sortedInsights = useMemo(() => {
    const weight: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return [...insights].sort(
      (a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0) || a.id - b.id
    );
  }, [insights]);

  const visibleInsights = showAllInsights
    ? sortedInsights
    : sortedInsights.slice(0, 4);

  // ============================================================
  // PART 4 — CONVERGING PATTERNS (Strictly Multi-Record Recurring Signals)
  // Only includes themes backed by >= 2 actual feedback records.
  // Isolated 1-record complaints (like Feedback #10) are NOT recurring patterns.
  // ============================================================
  const convergingPatterns = useMemo(() => {
    return themes
      .filter((t) => t.count >= 2)
      .map((theme) => {
        const matchingRecords = feedback.filter(
          (f) =>
            f.themes?.some((th) => th.id === theme.id) || f.theme === theme.name
        );
        const channels = Array.from(
          new Set(matchingRecords.map((r) => r.source).filter(Boolean))
        );
        return {
          theme,
          records: matchingRecords,
          channels,
        };
      })
      .sort((a, b) => b.theme.count - a.theme.count);
  }, [themes, feedback]);

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Header (Part 6: Disconnected "Theme Drilldown Modal" button removed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCE4DD]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-700" />
              Pre-Generated Seeded Insights (Not Live AI)
            </span>
            <span className="text-[#9BA8A0] text-xs">•</span>
            <span className="text-xs text-[#53615A] font-medium">
              {loading
                ? 'Loading...'
                : `${insights.length} Stored Findings • ${convergingPatterns.length} Recurring Patterns`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161B19] tracking-tight">
            Insights &amp; Converging Patterns
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE4DD] text-[#161B19] text-xs font-medium hover:bg-[#F8FAF7] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6F9B86] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/ai-analysis"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-all shadow-2xs"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#A8CBB7]" />
            <span>Run Live AI Analysis</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-semibold text-xs hover:bg-rose-800 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Concise Executive Digest with Progressive Disclosure */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] border-l-4 border-l-[#123D32] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#123D32]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#123D32]">
              Executive Digest
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Synthetic Demonstration Data
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDigestDetails(!showDigestDetails)}
            className="text-xs font-semibold text-[#123D32] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            {showDigestDetails ? (
              <>
                Hide Details <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Why This Matters <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <h2 className="text-base font-bold text-[#161B19]">
          Strong Career Development Momentum; One-Off Privacy Risk (#10) &amp; Mobile Reliability Flagged
        </h2>

        <p className="text-xs text-[#53615A] leading-relaxed">
          Synthesis of <strong>20 seeded feedback records</strong> shows high satisfaction with AI interview prep and career coaching, alongside an urgent single-record privacy concern (<strong>Feedback #10</strong>) and recurring mobile latency.
        </p>

        {showDigestDetails && (
          <div className="pt-2 border-t border-[#EFF3EF] text-xs text-[#53615A] space-y-1.5 leading-relaxed">
            <p>
              <strong>Note on Data Source:</strong> This digest summarizes pre-generated demonstration records stored in Supabase (`public.&quot;AI Insights&quot;`), not live LLM generation. To run a live real-time OpenRouter model analysis, use{' '}
              <Link href="/ai-analysis" className="text-[#123D32] font-semibold underline">
                Live AI Analysis
              </Link>
              .
            </p>
            <p>
              <strong>Key Distinction:</strong> Isolated high-severity complaints (such as Feedback #10 on account access/privacy) are surfaced under <em>Specific AI Insights</em> as single-record escalations, whereas <em>Converging Patterns</em> strictly require multiple corroborating customer records.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================
          PART 4 — CLEAR DISTINCTION TABS: SPECIFIC INSIGHTS VS CONVERGING PATTERNS
         ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EFF3EF] p-2 rounded-xl border border-[#DCE4DD]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#123D32] text-white shadow-2xs'
                : 'text-[#161B19] hover:bg-white/70'
            }`}
          >
            All Views
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-[#123D32] text-white shadow-2xs'
                : 'text-[#161B19] hover:bg-white/70'
            }`}
          >
            1. Specific AI Insights ({insights.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('patterns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'patterns'
                ? 'bg-[#123D32] text-white shadow-2xs'
                : 'text-[#161B19] hover:bg-white/70'
            }`}
          >
            2. Converging Patterns ({convergingPatterns.length})
          </button>
        </div>

        <span className="text-[11px] text-[#53615A] px-2">
          Click any theme tag or pattern card to open verbatim quotes
        </span>
      </div>

      {/* ============================================================
          SECTION 1: SPECIFIC AI INSIGHTS (Top 3-4 Prominent + Expandable)
         ============================================================ */}
      {(activeTab === 'all' || activeTab === 'insights') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#161B19] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#123D32]" />
                <span>Specific AI Insights — Notable Findings &amp; Escalations</span>
              </h2>
              <p className="text-xs text-[#53615A] mt-0.5">
                Actionable takeaways from `public.&quot;AI Insights&quot;`, including critical single-record escalations (such as Feedback #10) that require immediate review even without multiple reports.
              </p>
            </div>

            {sortedInsights.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllInsights(!showAllInsights)}
                className="text-xs font-semibold text-[#123D32] hover:underline shrink-0 cursor-pointer"
              >
                {showAllInsights
                  ? 'Show Top 4 Priority Takeaways'
                  : `View All ${sortedInsights.length} Stored Insights`}
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-3 animate-pulse"
                >
                  <div className="h-4 w-32 bg-[#EFF3EF] rounded" />
                  <div className="h-5 w-3/4 bg-[#EFF3EF] rounded" />
                  <div className="h-10 bg-[#F8FAF7] rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleInsights.map((insight) => {
                const isExpanded = expandedInsightIds.includes(insight.id);
                const isSingleEscalation =
                  insight.priority === 'critical' ||
                  insight.referencedFeedbackIds.length === 1;
                const shortSummary =
                  insight.summary.length > 135 && !isExpanded
                    ? `${insight.summary.slice(0, 135).trim()}...`
                    : insight.summary;

                return (
                  <div
                    key={insight.id}
                    className={`p-5 rounded-xl bg-white border transition-all flex flex-col justify-between space-y-3 ${
                      insight.priority === 'critical'
                        ? 'border-red-300 shadow-xs'
                        : 'border-[#DCE4DD] hover:border-[#6F9B86]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-[#161B19] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0]">
                            Insight #{insight.id}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
                            {isSingleEscalation && insight.priority === 'critical'
                              ? 'Single-Record Critical Escalation'
                              : insight.insightType}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                            insight.priority
                          )}`}
                        >
                          {insight.priority} Priority
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#161B19] mb-1.5 leading-snug">
                        {insight.title}
                      </h3>

                      <p className="text-xs text-[#53615A] leading-relaxed">
                        {shortSummary}
                      </p>

                      {isExpanded && (
                        <div className="mt-3 p-3 rounded-lg bg-[#F8FAF7] border border-[#DCE4DD] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#161B19]">
                              Linked Product Theme:
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                openThemeByName(insight.themeName, insight.themeId)
                              }
                              className="text-[#123D32] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Layers className="w-3 h-3" />
                              {insight.themeName}
                            </button>
                          </div>

                          {insight.referencedFeedbackIds.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="font-semibold text-[#161B19]">
                                Verbatim Evidence:
                              </span>
                              {insight.referencedFeedbackIds.map((fId) => (
                                <Link
                                  key={fId}
                                  href={`/feedback/${fId}`}
                                  className="font-mono font-semibold text-[#123D32] bg-[#EFF3EF] hover:bg-[#DCE4DD] px-2 py-0.5 rounded border border-[#CED9D0] text-[11px] transition-colors"
                                >
                                  Record #{fId}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-[#EFF3EF] flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() =>
                          openThemeByName(insight.themeName, insight.themeId)
                        }
                        className="text-[#123D32] font-semibold hover:underline truncate max-w-[210px] flex items-center gap-1 cursor-pointer"
                        title="Click to inspect all quotes in this theme"
                      >
                        <Layers className="w-3 h-3 shrink-0" />
                        <span className="truncate">{insight.themeName}</span>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        {insight.referencedFeedbackIds.map((fId) => (
                          <Link
                            key={fId}
                            href={`/feedback/${fId}`}
                            className="font-mono font-semibold text-[#123D32] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0] text-[10px]"
                          >
                            #{fId}
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={() => toggleInsightExpand(insight.id)}
                          className="font-semibold text-[#53615A] hover:text-[#161B19] inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Less <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Details <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 2: CONVERGING PATTERNS (Multi-Record Recurring Signals Only)
          Part 4 & Part 6: Click any pattern card to open ThemeDrilldownModal
         ============================================================ */}
      {(activeTab === 'all' || activeTab === 'patterns') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#161B19] flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-[#123D32]" />
                <span>
                  Converging Patterns — Multi-Record Recurring Signals ({convergingPatterns.length})
                </span>
              </h2>
              <p className="text-xs text-[#53615A] mt-0.5">
                Recurring themes supported by <strong>multiple independent feedback records</strong> across channels. Click any card to inspect the underlying customer quotes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {convergingPatterns.map(({ theme, channels }) => (
              <div
                key={theme.id}
                onClick={() => openThemeModal(theme)}
                className="p-4 rounded-xl bg-white border border-[#DCE4DD] hover:border-[#123D32] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
                      {theme.count} Corroborating Records
                    </span>
                    <span className="text-[10px] text-[#53615A] font-medium">
                      {channels.length} {channels.length === 1 ? 'Channel' : 'Channels'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#161B19] group-hover:text-[#123D32] transition-colors mb-1 leading-snug">
                    {theme.name}
                  </h3>

                  <p className="text-xs text-[#53615A] leading-relaxed line-clamp-2 mb-3">
                    {theme.description}
                  </p>

                  {/* Channels where this pattern recurred */}
                  <div className="flex items-center gap-1 flex-wrap mb-2.5">
                    {channels.map((ch) => (
                      <span
                        key={ch}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#F8FAF7] text-[#53615A] border border-[#DCE4DD]"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>

                  {theme.flaggedCount > 0 && (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        {theme.flaggedCount} flagged item{theme.flaggedCount > 1 ? 's' : ''} in cluster
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#EFF3EF] flex items-center justify-between text-[11px]">
                  <span className="text-[#53615A] font-mono text-[10px]">
                    Records: {theme.feedbackIds.map((id) => `#${id}`).join(', ')}
                  </span>
                  <span className="font-semibold text-[#123D32] group-hover:underline flex items-center gap-0.5 shrink-0">
                    Inspect {theme.count} quotes <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Note on Single-Record Themes */}
          {themes.some((t) => t.count === 1) && (
            <div className="p-3.5 rounded-xl bg-[#EFF3EF] border border-[#CED9D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#161B19]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
                <span>
                  <strong>Isolated High-Severity Escalations:</strong> Themes with only 1 feedback record (such as{' '}
                  {themes
                    .filter((t) => t.count === 1)
                    .map((t) => t.name)
                    .join(', ')}
                  ) are not recurring patterns, but can still be inspected directly.
                </span>
              </div>
              {themes
                .filter((t) => t.count === 1)
                .map((singleTheme) => (
                  <button
                    key={singleTheme.id}
                    type="button"
                    onClick={() => openThemeModal(singleTheme)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#CED9D0] text-[#123D32] font-semibold text-xs hover:bg-[#F8FAF7] shrink-0 cursor-pointer"
                  >
                    Inspect {singleTheme.name} (1 Quote)
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Contextual Theme Drilldown Modal */}
      <ThemeDrilldownModal
        theme={selectedTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={feedback}
      />
    </div>
  );
}
