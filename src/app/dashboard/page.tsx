'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Database,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
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

  const [showPriorityGuide, setShowPriorityGuide] = useState(false);
  const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null);

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
      console.error('Failed to load dashboard metrics from Supabase:', err);
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

  const openThemeByName = (themeName: string) => {
    if (!metrics) return;
    const found = metrics.themes.find(
      (t) => t.name.toLowerCase() === themeName.toLowerCase()
    );
    if (found) {
      setSelectedTheme(found);
      setIsModalOpen(true);
    }
  };

  // ============================================================
  // PART 3 — CHART 1: FEEDBACK VOLUME OVER TIME (from live Supabase data)
  // Groups actual feedback records chronologically by date
  // ============================================================
  const volumeOverTime = useMemo(() => {
    if (!allFeedback.length) return [];

    const dateMap = new Map<string, { count: number; flagged: number }>();
    const sorted = [...allFeedback].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((item) => {
      const dateKey = item.date || 'Unknown';
      const existing = dateMap.get(dateKey) || { count: 0, flagged: 0 };
      existing.count += 1;
      if (
        item.isFlagged ||
        item.priority === 'critical' ||
        item.priority === 'high'
      ) {
        existing.flagged += 1;
      }
      dateMap.set(dateKey, existing);
    });

    const entries = Array.from(dateMap.entries()).map(([date, stats]) => {
      let shortLabel = date;
      try {
        const parsed = new Date(date + 'T00:00:00');
        if (!isNaN(parsed.getTime())) {
          shortLabel = parsed.toLocaleDateString('en-CA', {
            month: 'short',
            day: 'numeric',
          });
        }
      } catch {}
      return {
        date,
        label: shortLabel,
        count: stats.count,
        flagged: stats.flagged,
      };
    });

    return entries;
  }, [allFeedback]);

  const maxTimeCount = useMemo(() => {
    if (!volumeOverTime.length) return 1;
    return Math.max(...volumeOverTime.map((d) => d.count), 1);
  }, [volumeOverTime]);

  // ============================================================
  // PART 3 — CHART 2: FEEDBACK BY THEME (from live Supabase data)
  // Sorted descending by record count with critical/flagged breakdown
  // ============================================================
  const themesChartData = useMemo(() => {
    if (!metrics?.themes?.length) return [];
    const maxCount = Math.max(...metrics.themes.map((t) => t.count), 1);
    return [...metrics.themes]
      .sort((a, b) => b.count - a.count)
      .map((t) => {
        const hasCritical = allFeedback.some(
          (f) =>
            (f.theme === t.name || f.themes?.some((th) => th.id === t.id)) &&
            f.priority === 'critical'
        );
        return {
          ...t,
          widthPct: Math.max(Math.round((t.count / maxCount) * 100), 8),
          hasCritical,
        };
      });
  }, [metrics, allFeedback]);

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

  const criticalCount = useMemo(
    () => allFeedback.filter((f) => f.priority === 'critical').length,
    [allFeedback]
  );

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Executive Page Header (Concise) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCE4DD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#123D32]" />
              Live Supabase Overview
            </span>
            <span className="text-[#9BA8A0] text-xs">•</span>
            <span className="text-xs text-[#53615A] font-medium">
              VP of Product Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161B19] tracking-tight">
            Executive Feedback Overview
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPriorityGuide(!showPriorityGuide)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3EF] border border-[#CED9D0] text-[#123D32] text-xs font-semibold hover:bg-[#E2EBE4] transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Priority vs. Flagged</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE4DD] text-[#161B19] text-xs font-medium hover:bg-[#F8FAF7] transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6F9B86] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-all shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#A8CBB7]" />
            <span>Explore Records</span>
          </Link>
        </div>
      </div>

      {/* PART 7 — Collapsible Priority vs. Flagged Contextual Guide */}
      {showPriorityGuide && (
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#6F9B86] shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123D32] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>How Priority &amp; Flagged Status Work</span>
            </h2>
            <button
              onClick={() => setShowPriorityGuide(false)}
              className="text-xs font-medium text-[#53615A] hover:text-[#161B19] cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#F8FAF7] border border-[#DCE4DD] space-y-2">
              <p className="font-bold text-[#161B19]">
                1. Priority (Seriousness &amp; Product Impact)
              </p>
              <ul className="space-y-1.5 text-[#53615A]">
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-800 border border-red-300 font-bold">
                    CRITICAL
                  </span>
                  <span>Major privacy/security risks or severe functionality failures.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-50 text-orange-800 border border-orange-200 font-semibold">
                    HIGH
                  </span>
                  <span>Serious customer problems or significant workflow blockers.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                    MEDIUM
                  </span>
                  <span>Meaningful usability friction or recurring enhancement needs.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0] font-medium">
                    LOW
                  </span>
                  <span>Minor inconveniences, praise, or low-impact suggestions.</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8FAF7] border border-[#DCE4DD] space-y-2">
              <p className="font-bold text-[#161B19]">
                2. Flagged Marker vs. AI-Suggested Priority
              </p>
              <p className="text-[#53615A] leading-relaxed">
                <strong className="text-amber-800">Flagged</strong> is a separate review marker indicating a record that needs human triage or follow-up at <em>any</em> priority level. For example, a single privacy complaint (<strong>Feedback #10</strong>) is both <strong>CRITICAL</strong> and <strong>Flagged</strong> even though it is only one report.
              </p>
              <p className="text-[#53615A] leading-relaxed">
                <strong className="text-[#123D32]">Stored vs. Live AI:</strong> Database records display their stored priority. Live AI Analysis suggests prioritization for human review without overwriting stored database values.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error / Session Expired State (Part 9) */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-semibold text-xs hover:bg-rose-800 transition-colors cursor-pointer"
            >
              Retry Query
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-semibold text-xs hover:bg-rose-100 transition-colors"
            >
              Sign In Again
            </Link>
          </div>
        </div>
      )}

      {/* Primary KPI Cards (Concise & Scannable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#53615A]">
              Feedback Records
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF3EF] text-[#123D32] flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#161B19] tracking-tight">
              {loading ? '—' : metrics?.totalFeedback ?? 0}
            </span>
            <span className="text-[11px] font-medium text-[#123D32] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0]">
              6 Channels
            </span>
          </div>
          <p className="text-[11px] text-[#53615A] mt-1">
            Verified records in Supabase
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#53615A]">
              Product Themes
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF3EF] text-[#123D32] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#161B19] tracking-tight">
              {loading ? '—' : metrics?.totalThemes ?? 0}
            </span>
            <span className="text-[11px] text-[#53615A] font-medium">Active Clusters</span>
          </div>
          <p className="text-[11px] text-[#53615A] mt-1">
            Click any theme bar below to inspect
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#53615A]">
              Flagged &amp; High Priority
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#161B19] tracking-tight">
              {loading ? '—' : metrics?.flaggedCount ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Needs Triage
            </span>
          </div>
          <p className="text-[11px] text-[#53615A] mt-1">
            Flagged or high/critical severity
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#53615A]">
              Critical Escalations
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-700 tracking-tight">
              {loading ? '—' : criticalCount}
            </span>
            <span className="text-[10px] font-bold uppercase text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300">
              Critical
            </span>
          </div>
          <p className="text-[11px] text-[#53615A] mt-1">
            Includes Feedback #10 privacy concern
          </p>
        </div>
      </div>

      {/* ============================================================
          PART 3 — TWO MEANINGFUL VISUALIZATIONS FROM LIVE SUPABASE DATA
         ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 1 (Priority Graph): Feedback Volume Over Time */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h2 className="text-sm font-bold text-[#161B19] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#123D32]" />
                <span>Feedback Volume Over Time</span>
              </h2>
              <span className="text-[10px] font-semibold text-[#123D32] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0]">
                {allFeedback.length} Total Records
              </span>
            </div>
            <p className="text-xs text-[#53615A] mb-4">
              Chronological distribution of customer feedback records by date (`feedback_date`).
            </p>

            {loading ? (
              <div className="h-48 bg-[#F8FAF7] rounded-lg animate-pulse" />
            ) : volumeOverTime.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-[#53615A] bg-[#F8FAF7] rounded-lg border border-dashed border-[#CED9D0]">
                No feedback timestamps available.
              </div>
            ) : (
              <div className="pt-2">
                {/* Y-axis scale note */}
                <div className="flex items-center justify-between text-[10px] text-[#53615A] mb-2">
                  <span>Records per date (Peak: {maxTimeCount})</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#123D32]" />
                      Standard
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-600" />
                      Includes Flagged/High
                    </span>
                  </div>
                </div>

                {/* Responsive Column Chart */}
                <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 pb-1 px-2 bg-[#F8FAF7] rounded-lg border border-[#DCE4DD] overflow-x-auto">
                  {volumeOverTime.map((point) => {
                    const heightPct = Math.max(
                      Math.round((point.count / maxTimeCount) * 100),
                      16
                    );
                    const hasFlagged = point.flagged > 0;
                    return (
                      <div
                        key={point.date}
                        className="flex-1 min-w-[28px] h-full flex flex-col items-center justify-end group"
                        title={`${point.date}: ${point.count} record(s)${
                          hasFlagged ? ` (${point.flagged} flagged/high)` : ''
                        }`}
                      >
                        <span className="text-[10px] font-bold text-[#161B19] mb-1">
                          {point.count}
                        </span>
                        <div className="w-full flex-1 flex items-end justify-center">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[28px] rounded-t-md transition-all ${
                              hasFlagged
                                ? 'bg-amber-600 group-hover:bg-amber-700'
                                : 'bg-[#123D32] group-hover:bg-[#0B2822]'
                            }`}
                          />
                        </div>
                        <span className="text-[9px] text-[#53615A] mt-1.5 font-mono truncate max-w-[46px]">
                          {point.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EFF3EF] flex items-center justify-between text-[11px] text-[#53615A]">
            <span>X-Axis: Feedback Date &bull; Y-Axis: Record Count</span>
            <Link
              href="/feedback"
              className="font-semibold text-[#123D32] hover:underline flex items-center gap-0.5"
            >
              Filter by date <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* CHART 2 (Secondary Visual): Feedback Concentration by Theme */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h2 className="text-sm font-bold text-[#161B19] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#123D32]" />
                <span>Feedback Volume by Product Theme</span>
              </h2>
              <span className="text-[10px] text-[#53615A]">
                Click any bar to inspect quotes
              </span>
            </div>
            <p className="text-xs text-[#53615A] mb-3">
              Comparison of customer signal volume across all {themesChartData.length || 7} Supabase themes.
            </p>

            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-7 bg-[#F8FAF7] rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {themesChartData.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => openThemeModal(theme)}
                    className="w-full text-left group cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center justify-between text-xs mb-1 gap-2">
                      <span className="font-semibold text-[#161B19] group-hover:text-[#123D32] truncate">
                        {theme.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {theme.hasCritical && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-800 border border-red-300">
                            Critical
                          </span>
                        )}
                        {theme.flaggedCount > 0 && !theme.hasCritical && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {theme.flaggedCount} flagged
                          </span>
                        )}
                        <span className="font-mono text-[11px] font-bold text-[#161B19]">
                          {theme.count}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#EFF3EF] overflow-hidden">
                      <div
                        style={{ width: `${theme.widthPct}%` }}
                        className={`h-full rounded-full transition-all ${
                          theme.hasCritical
                            ? 'bg-red-600 group-hover:bg-red-700'
                            : theme.flaggedCount > 0
                            ? 'bg-[#123D32] group-hover:bg-[#0B2822]'
                            : 'bg-[#6F9B86] group-hover:bg-[#123D32]'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EFF3EF] flex items-center justify-between text-[11px] text-[#53615A]">
            <span>Derived from Feedback_Themes junction table</span>
            <Link
              href="/ai-insights"
              className="font-semibold text-[#123D32] hover:underline flex items-center gap-0.5"
            >
              View Insights &amp; Patterns <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Priority Triage Panel (Flagged & High/Critical Items) */}
      <div className="p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <h2 className="text-sm font-bold text-[#161B19] tracking-tight">
              Priority Triage Queue (Flagged &amp; High/Critical Signals)
            </h2>
          </div>
          <Link
            href="/ai-analysis"
            className="text-xs font-semibold text-[#123D32] hover:underline flex items-center gap-1"
          >
            Run Live AI Prioritization <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {(metrics?.flaggedFeedback && metrics.flaggedFeedback.length > 0
            ? metrics.flaggedFeedback.slice(0, 3)
            : []
          ).map((issue) => (
            <div
              key={issue.id}
              className="p-4 rounded-xl border border-[#DCE4DD] bg-[#F8FAF7] hover:bg-white hover:border-[#6F9B86] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#161B19] bg-white px-2 py-0.5 rounded border border-[#DCE4DD]">
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
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Flagged
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#53615A] font-medium">
                    {issue.source}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openThemeByName(issue.theme)}
                  className="text-xs font-bold text-[#123D32] hover:underline text-left line-clamp-1 mb-1 cursor-pointer"
                >
                  {issue.theme}
                </button>

                <p className="text-xs text-[#161B19] line-clamp-2 leading-relaxed">
                  {issue.summary || issue.content}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#DCE4DD] flex items-center justify-between text-[11px]">
                <span className="text-[#53615A] text-[10px]">{issue.date}</span>
                <Link
                  href={`/feedback/${issue.id}`}
                  className="font-semibold text-[#123D32] hover:text-[#0B2822] flex items-center gap-0.5"
                >
                  Inspect Record <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Source Distribution + Recent Records (Progressive Disclosure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Source Breakdown */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-[#161B19]">
                Feedback by Channel
              </h2>
              <span className="text-[10px] text-[#53615A] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#DCE4DD]">
                Example Sources
              </span>
            </div>
            <p className="text-xs text-[#53615A] mb-3">
              Distribution across seeded intake channels in Supabase.
            </p>

            <div className="h-2.5 w-full rounded-full bg-[#EFF3EF] flex overflow-hidden mb-3">
              {(metrics?.sources || []).map((src) => (
                <div
                  key={src.source}
                  style={{
                    width: `${src.percentage}%`,
                    backgroundColor: src.color,
                  }}
                  title={`${src.source}: ${src.count} (${src.percentage}%)`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(metrics?.sources || []).map((src) => (
                <Link
                  key={src.source}
                  href={`/feedback?source=${encodeURIComponent(src.source)}`}
                  className="p-2 rounded-lg bg-[#F8FAF7] hover:bg-[#EFF3EF] border border-[#DCE4DD] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: src.color }}
                    />
                    <span className="font-medium text-[#161B19] truncate text-[11px]">
                      {src.source}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#53615A] font-mono">
                    {src.count} ({src.percentage}%)
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-[#53615A] mt-3 pt-2.5 border-t border-[#EFF3EF]">
            Note: Source labels represent seeded example channels in Supabase rather than live webhook integrations.
          </p>
        </div>

        {/* Recent Feedback Records with Expandable Quotes */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#161B19] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#123D32]" />
                <span>Latest Customer Feedback</span>
              </h2>
              <p className="text-xs text-[#53615A]">
                Concise summaries shown first; expand to read full verbatim quote.
              </p>
            </div>
            <Link
              href="/feedback"
              className="text-xs font-semibold text-[#123D32] hover:underline flex items-center gap-1 shrink-0"
            >
              All {metrics?.totalFeedback ?? 20} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EFF3EF]">
            {(metrics?.recentFeedback || []).map((item) => {
              const isExpanded = expandedQuoteId === item.id;
              return (
                <div key={item.id} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#161B19] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0]">
                        #{item.id}
                      </span>
                      <span className="text-[11px] font-semibold text-[#123D32]">
                        {item.theme}
                      </span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded border ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#53615A]">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#161B19] mt-1 line-clamp-1">
                    {item.summary || item.content}
                  </p>

                  {isExpanded && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#F8FAF7] border-l-2 border-[#123D32] text-xs text-[#161B19] italic">
                      &ldquo;{item.content.replace(/^"|"$/g, '')}&rdquo;
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedQuoteId(isExpanded ? null : item.id)
                      }
                      className="text-[#53615A] hover:text-[#123D32] font-medium inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide verbatim quote <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Show verbatim quote <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                    <Link
                      href={`/feedback/${item.id}`}
                      className="text-[#123D32] font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      Open detail <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drilldown Modal */}
      <ThemeDrilldownModal
        theme={selectedTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={allFeedback}
      />
    </div>
  );
}
