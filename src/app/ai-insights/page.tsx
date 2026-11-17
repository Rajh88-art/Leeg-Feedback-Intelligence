'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  ChevronRight,
} from 'lucide-react';
import { fetchAIInsightsData, fetchAllFeedbackData } from '@/services/feedbackDbService';
import { EnrichedAIInsight, EnrichedTheme, EnrichedFeedback } from '@/types/database';
import ThemeDrilldownModal from '../../components/ThemeDrilldownModal';

// Helper to produce a clean 3-7 word plain-language title and 10-20 word 1-sentence takeaway
function getConciseInsightCopy(insight: EnrichedAIInsight): {
  shortTitle: string;
  oneSentenceTakeaway: string;
  suggestedFix: string;
} {
  const words = insight.title.trim().split(/\s+/);
  const shortTitle =
    words.length > 7 ? words.slice(0, 6).join(' ') : insight.title.trim();

  // Extract first sentence or first 16 words for the collapsed 1-sentence takeaway
  const firstSentenceMatch = insight.summary.match(/^[^.!?]+[.!?]/);
  const firstSentence = firstSentenceMatch
    ? firstSentenceMatch[0].trim()
    : insight.summary.trim();
  const sentenceWords = firstSentence.split(/\s+/);
  const oneSentenceTakeaway =
    sentenceWords.length > 18
      ? sentenceWords.slice(0, 16).join(' ') + '.'
      : firstSentence;

  // Derive a clear suggested fix from the second sentence or theme context
  const remaining = insight.summary
    .replace(firstSentence, '')
    .trim();
  const suggestedFix =
    remaining ||
    `Review the linked ${insight.themeName.toLowerCase()} feedback records and prioritize product improvements.`;

  return { shortTitle, oneSentenceTakeaway, suggestedFix };
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<EnrichedAIInsight[]>([]);
  const [themes, setThemes] = useState<EnrichedTheme[]>([]);
  const [feedback, setFeedback] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<EnrichedTheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'all' | 'findings' | 'repeated'>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

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
      console.error('Failed to load AI Insights:', err);
      setError(err?.message || 'Unable to load insights.');
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

  const toggleExpand = (key: string) => {
    setExpandedIds((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'high':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      case 'medium':
        return 'bg-[#E8E0D3]/70 text-[#5C4930] border-[#D5C9B8] font-medium';
      case 'low':
      default:
        return 'bg-[#EFF3EF] text-[#123D32] border-[#CED9D0] font-medium';
    }
  };

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

  // Repeated Issues: Strictly topics supported by 2+ linked records
  const repeatedIssues = useMemo(() => {
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
        const words = theme.description.trim().split(/\s+/);
        const shortTakeaway =
          words.length > 16
            ? words.slice(0, 15).join(' ') + '.'
            : theme.description.trim();

        return {
          theme,
          channels,
          shortTakeaway,
        };
      })
      .sort((a, b) => b.theme.count - a.theme.count);
  }, [themes, feedback]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#161B19] tracking-tight">
            AI Insights
          </h1>
          <p className="text-xs text-[#53615A] mt-0.5">
            Sample insights from stored records (not live AI). Use{' '}
            <Link href="/ai-analysis" className="text-[#123D32] font-semibold underline">
              AI Analysis
            </Link>{' '}
            for live generation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-[#DCE4DD] text-[#53615A] hover:text-[#161B19] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/ai-analysis"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#B89B72]" />
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
            className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-semibold text-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#DCE4DD] pb-3">
        {[
          { id: 'all', label: 'All' },
          { id: 'findings', label: `Key Findings (${insights.length})` },
          { id: 'repeated', label: `Repeated Issues (${repeatedIssues.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#123D32] text-white'
                : 'bg-white border border-[#DCE4DD] text-[#53615A] hover:text-[#161B19]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: KEY FINDINGS (Short summary first, details on click) */}
      {(activeTab === 'all' || activeTab === 'findings') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161B19]">
              Key Findings
            </h2>
            <span className="text-[11px] text-[#53615A]">
              Individual concerns &amp; notable findings
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-xl bg-white border border-[#DCE4DD] h-24 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sortedInsights.map((insight) => {
                const key = `insight-${insight.id}`;
                const isExpanded = expandedIds.includes(key);
                const { shortTitle, oneSentenceTakeaway, suggestedFix } =
                  getConciseInsightCopy(insight);

                return (
                  <div
                    key={insight.id}
                    onClick={() => toggleExpand(key)}
                    className={`p-4 rounded-xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
                      insight.priority === 'critical'
                        ? 'border-red-300'
                        : 'border-[#DCE4DD] hover:border-[#B89B72]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-[#161B19] leading-snug">
                          {shortTitle}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border uppercase shrink-0 ${getPriorityBadge(
                            insight.priority
                          )}`}
                        >
                          {insight.priority}
                        </span>
                      </div>

                      <p className="text-xs text-[#53615A] leading-relaxed">
                        {oneSentenceTakeaway}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#EFF3EF] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#53615A]">
                        {insight.referencedFeedbackIds.length === 1 &&
                        insight.priority === 'critical'
                          ? 'Single critical report'
                          : insight.themeName}
                      </span>
                      <span className="font-semibold text-[#123D32] inline-flex items-center gap-1">
                        {isExpanded ? (
                          <>
                            Hide details <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            View details <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </span>
                    </div>

                    {isExpanded && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 pt-3 border-t border-[#DCE4DD] space-y-2.5 text-xs animate-in fade-in duration-150 cursor-default"
                      >
                        <div>
                          <span className="font-semibold text-[#161B19] block mb-0.5">
                            Why it matters
                          </span>
                          <p className="text-[#53615A] leading-relaxed">
                            {insight.summary}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-[#161B19] block mb-0.5">
                            Suggested Fix
                          </span>
                          <p className="text-[#53615A] leading-relaxed">
                            {suggestedFix}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[#161B19]">
                              Related Feedback:
                            </span>
                            {insight.referencedFeedbackIds.map((fId) => (
                              <Link
                                key={fId}
                                href={`/feedback/${fId}`}
                                className="font-mono font-semibold text-[#123D32] bg-[#EFF3EF] hover:bg-[#DCE4DD] px-2 py-0.5 rounded border border-[#CED9D0] text-[11px]"
                              >
                                #{fId}
                              </Link>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openThemeByName(insight.themeName, insight.themeId)
                            }
                            className="text-[#123D32] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            All quotes in topic <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: REPEATED ISSUES (Strictly 2+ linked records) */}
      {(activeTab === 'all' || activeTab === 'repeated') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#161B19]">
              Repeated Issues
            </h2>
            <span className="text-[11px] text-[#53615A]">
              Topics backed by 2 or more feedback records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {repeatedIssues.map(({ theme, channels, shortTakeaway }) => {
              const key = `pattern-${theme.id}`;
              const isExpanded = expandedIds.includes(key);

              return (
                <div
                  key={theme.id}
                  onClick={() => toggleExpand(key)}
                  className="p-4 rounded-xl bg-white border border-[#DCE4DD] hover:border-[#B89B72] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-[#161B19] leading-snug">
                        {theme.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E8E0D3]/80 text-[#5C4930] border border-[#D5C9B8] shrink-0">
                        {theme.count} records
                      </span>
                    </div>

                    <p className="text-xs text-[#53615A] leading-relaxed">
                      {shortTakeaway}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#EFF3EF] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#53615A]">
                      {channels.join(', ')}
                    </span>
                    <span className="font-semibold text-[#123D32] inline-flex items-center gap-1">
                      {isExpanded ? (
                        <>
                          Hide details <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          View details <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </div>

                  {isExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 pt-3 border-t border-[#DCE4DD] space-y-2.5 text-xs animate-in fade-in duration-150 cursor-default"
                    >
                      <p className="text-[#53615A] leading-relaxed">
                        {theme.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#161B19]">
                            Related Feedback:
                          </span>
                          {theme.feedbackIds.map((fId) => (
                            <Link
                              key={fId}
                              href={`/feedback/${fId}`}
                              className="font-mono font-semibold text-[#123D32] bg-[#EFF3EF] hover:bg-[#DCE4DD] px-2 py-0.5 rounded border border-[#CED9D0] text-[11px]"
                            >
                              #{fId}
                            </Link>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => openThemeModal(theme)}
                          className="px-2.5 py-1 rounded-md bg-[#123D32] text-white font-semibold text-[11px] hover:bg-[#0B2822] cursor-pointer"
                        >
                          Read all {theme.count} quotes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Topic Quotes Modal */}
      <ThemeDrilldownModal
        theme={selectedTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={feedback}
      />
    </div>
  );
}
