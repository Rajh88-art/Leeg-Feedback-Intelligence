'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { fetchDashboardMetrics, fetchAllFeedbackData } from '@/services/feedbackDbService';
import { DashboardMetrics, EnrichedTheme, EnrichedFeedback } from '@/types/database';
import ThemeDrilldownModal from '../../components/ThemeDrilldownModal';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [allFeedback, setAllFeedback] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<EnrichedTheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPriorityHelp, setShowPriorityHelp] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsData, allFbData] = await Promise.all([
        fetchDashboardMetrics(),
        fetchAllFeedbackData(),
      ]);
      setMetrics(metricsData);
      setAllFeedback(allFbData.feedback);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err?.message || 'Unable to load feedback data.');
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

  // ============================================================
  // GRAPH 1: FEEDBACK BY WEEK (Truthful weekly grouping from Supabase dates)
  // Groups actual feedback_date values into Monday-start calendar weeks
  // ============================================================
  const weeklyVolume = useMemo(() => {
    if (!allFeedback.length) return [];

    const weekMap = new Map<
      string,
      { weekStart: string; label: string; count: number; hasCritical: boolean }
    >();

    const sorted = [...allFeedback].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((item) => {
      const parsed = new Date((item.date || '2026-09-01') + 'T00:00:00');
      if (isNaN(parsed.getTime())) return;

      // Calculate Monday of that calendar week
      const dayOfWeek = parsed.getDay(); // 0 (Sun) - 6 (Sat)
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(parsed);
      monday.setDate(parsed.getDate() + diffToMonday);

      const weekKey = monday.toISOString().split('T')[0];
      const label = monday.toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
      });

      const existing = weekMap.get(weekKey) || {
        weekStart: weekKey,
        label: `Wk of ${label}`,
        count: 0,
        hasCritical: false,
      };
      existing.count += 1;
      if (item.priority === 'critical') {
        existing.hasCritical = true;
      }
      weekMap.set(weekKey, existing);
    });

    return Array.from(weekMap.values());
  }, [allFeedback]);

  const maxWeeklyCount = useMemo(() => {
    if (!weeklyVolume.length) return 1;
    return Math.max(...weeklyVolume.map((w) => w.count), 1);
  }, [weeklyVolume]);

  // ============================================================
  // GRAPH 2: FEEDBACK BY TOPIC (Clickable bars from Supabase themes)
  // ============================================================
  const topicsChartData = useMemo(() => {
    if (!metrics?.themes?.length) return [];
    const maxCount = Math.max(...metrics.themes.map((t) => t.count), 1);
    return [...metrics.themes]
      .sort((a, b) => b.count - a.count)
      .map((t, index) => {
        const hasCritical = allFeedback.some(
          (f) =>
            (f.theme === t.name || f.themes?.some((th) => th.id === t.id)) &&
            f.priority === 'critical'
        );
        return {
          ...t,
          widthPct: Math.max(Math.round((t.count / maxCount) * 100), 10),
          hasCritical,
          barColor: hasCritical
            ? '#DC2626'
            : index === 0
            ? '#123D32'
            : index % 2 === 1
            ? '#6F9B86'
            : '#B89B72',
        };
      });
  }, [metrics, allFeedback]);

  const criticalCount = useMemo(
    () => allFeedback.filter((f) => f.priority === 'critical').length,
    [allFeedback]
  );

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header — Clean and Simple */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#161B19] tracking-tight">
          Feedback Overview
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPriorityHelp(!showPriorityHelp)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#DCE4DD] text-[#53615A] hover:text-[#161B19] text-xs font-medium transition-colors cursor-pointer"
            title="How Priority and Flagged work"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#B89B72]" />
            <span className="hidden sm:inline">Priority Guide</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-[#DCE4DD] text-[#53615A] hover:text-[#161B19] transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors"
          >
            <span>All Feedback</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B89B72]" />
          </Link>
        </div>
      </div>

      {/* Expandable Priority vs Flagged Help */}
      {showPriorityHelp && (
        <div className="p-4 rounded-xl bg-white border border-[#D5C9B8] text-xs text-[#53615A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#161B19]">
              Priority vs. Flagged
            </span>
            <button
              type="button"
              onClick={() => setShowPriorityHelp(false)}
              className="text-xs text-[#53615A] hover:text-[#161B19] cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="leading-relaxed">
            <strong className="text-[#161B19]">Priority</strong> shows how serious an issue is: <strong className="text-red-700">Critical</strong> (major privacy or security risks), <strong className="text-amber-800">High</strong> (serious product problems), <strong className="text-[#5C4930]">Medium</strong> (usability issues), or <strong className="text-[#123D32]">Low</strong> (minor suggestions).{' '}
            <strong className="text-[#161B19]">Flagged</strong> is a separate review marker for any item that needs follow-up. Stored database priorities are distinct from AI-suggested priorities.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-semibold text-xs hover:bg-rose-800 cursor-pointer"
            >
              Retry
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-semibold text-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* 4 Concise Metric Cards (Number + 1-3 word label only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#DCE4DD]">
          <span className="text-xs font-medium text-[#53615A] block">
            Total Feedback
          </span>
          <span className="text-3xl font-bold text-[#161B19] mt-1.5 block tracking-tight">
            {loading ? '—' : metrics?.totalFeedback ?? 0}
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#DCE4DD]">
          <span className="text-xs font-medium text-[#53615A] block">
            Topics
          </span>
          <span className="text-3xl font-bold text-[#161B19] mt-1.5 block tracking-tight">
            {loading ? '—' : metrics?.totalThemes ?? 0}
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#DCE4DD]">
          <span className="text-xs font-medium text-[#53615A] block">
            Needs Review
          </span>
          <span className="text-3xl font-bold text-[#161B19] mt-1.5 block tracking-tight">
            {loading ? '—' : metrics?.flaggedCount ?? 0}
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#DCE4DD]">
          <span className="text-xs font-medium text-[#53615A] block">
            Critical Issues
          </span>
          <span className="text-3xl font-bold text-red-700 mt-1.5 block tracking-tight">
            {loading ? '—' : criticalCount}
          </span>
        </div>
      </div>

      {/* Two Graphs: Feedback by Week & Feedback by Topic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Graph 1: Weekly Feedback Volume */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#DCE4DD] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#161B19]">
                Feedback Over Time (Weekly)
              </h2>
              <span className="text-[11px] text-[#53615A]">
                {weeklyVolume.length} weeks
              </span>
            </div>

            {loading ? (
              <div className="h-44 bg-[#F8FAF7] rounded-lg animate-pulse" />
            ) : weeklyVolume.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-[#53615A] bg-[#F8FAF7] rounded-lg">
                No date records available.
              </div>
            ) : (
              <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-3 bg-[#F8FAF7] rounded-lg border border-[#EFF3EF]">
                {weeklyVolume.map((week, idx) => {
                  const heightPct = Math.max(
                    Math.round((week.count / maxWeeklyCount) * 100),
                    18
                  );
                  return (
                    <div
                      key={week.weekStart}
                      className="flex-1 h-full flex flex-col items-center justify-end group"
                      title={`${week.label}: ${week.count} records`}
                    >
                      <span className="text-xs font-bold text-[#161B19] mb-1.5">
                        {week.count}
                      </span>
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: week.hasCritical
                              ? '#DC2626'
                              : idx % 2 === 0
                              ? '#123D32'
                              : '#B89B72',
                          }}
                          className="w-full max-w-[44px] rounded-t-md transition-opacity group-hover:opacity-85"
                        />
                      </div>
                      <span className="text-[10px] text-[#53615A] mt-2 font-medium truncate">
                        {week.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Graph 2: Feedback by Topic (Clickable) */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#DCE4DD] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#161B19]">
                Feedback by Topic
              </h2>
              <span className="text-[11px] text-[#53615A]">
                Click a topic to view quotes
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-6 bg-[#F8FAF7] rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {topicsChartData.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => openThemeModal(topic)}
                    className="w-full text-left group cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center justify-between text-xs mb-1 gap-2">
                      <span className="font-medium text-[#161B19] group-hover:text-[#123D32] truncate">
                        {topic.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {topic.hasCritical && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-800 border border-red-300">
                            Critical
                          </span>
                        )}
                        <span className="font-mono text-xs font-semibold text-[#161B19]">
                          {topic.count}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#EFF3EF] overflow-hidden">
                      <div
                        style={{
                          width: `${topic.widthPct}%`,
                          backgroundColor: topic.barColor,
                        }}
                        className="h-full rounded-full transition-opacity group-hover:opacity-85"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Short "Needs Attention" Section */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#161B19]">
            Needs Attention
          </h2>
          <Link
            href="/feedback"
            className="text-xs font-semibold text-[#123D32] hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {(metrics?.flaggedFeedback && metrics.flaggedFeedback.length > 0
            ? metrics.flaggedFeedback.slice(0, 3)
            : []
          ).map((issue) => (
            <Link
              key={issue.id}
              href={`/feedback/${issue.id}`}
              className="p-4 rounded-xl border border-[#DCE4DD] bg-[#F8FAF7] hover:bg-white hover:border-[#B89B72] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#161B19]">
                      #{issue.id}
                    </span>
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(
                        issue.priority
                      )}`}
                    >
                      {issue.priority}
                    </span>
                    {issue.isFlagged && (
                      <span className="text-[10px] font-medium text-[#5C4930] bg-[#E8E0D3] px-1.5 py-0.5 rounded border border-[#D5C9B8]">
                        Flagged
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#53615A]">
                    {issue.source}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#161B19] group-hover:text-[#123D32] mb-1 truncate">
                  {issue.theme}
                </p>

                <p className="text-xs text-[#53615A] line-clamp-2 leading-relaxed">
                  {issue.summary || issue.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Topic Modal */}
      <ThemeDrilldownModal
        theme={selectedTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={allFeedback}
      />
    </div>
  );
}
