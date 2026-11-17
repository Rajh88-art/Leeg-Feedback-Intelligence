'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Download,
  X,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { fetchAllFeedbackData } from '@/services/feedbackDbService';
import { EnrichedFeedback, EnrichedTheme, DbSource } from '@/types/database';
import ThemeDrilldownModal from '../../components/ThemeDrilldownModal';

function FeedbackExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSource = searchParams?.get('source');

  const [feedback, setFeedback] = useState<EnrichedFeedback[]>([]);
  const [themes, setThemes] = useState<EnrichedTheme[]>([]);
  const [sources, setSources] = useState<DbSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>(initialSource || 'all');
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'id'>('newest');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [drilldownTheme, setDrilldownTheme] = useState<EnrichedTheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllFeedbackData();
      setFeedback(data.feedback);
      setThemes(data.themes);
      setSources(data.sources);
    } catch (err: any) {
      console.error('Failed to load feedback:', err);
      setError(err?.message || 'Unable to load feedback records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialSource) {
      setSourceFilter(initialSource);
    }
  }, [initialSource]);

  const allSourceNames = useMemo(() => {
    if (sources.length > 0) return sources.map((s) => s.name);
    return Array.from(new Set(feedback.map((f) => f.source).filter(Boolean)));
  }, [sources, feedback]);

  const allThemeNames = useMemo(() => {
    if (themes.length > 0) return themes.map((t) => t.name);
    return Array.from(new Set(feedback.map((f) => f.theme).filter(Boolean)));
  }, [themes, feedback]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTheme('all');
    setPriorityFilter('all');
    setSourceFilter('all');
    setFlaggedOnly(false);
    setDateFilter('all');
  };

  const filteredList = useMemo(() => {
    const priorityRank: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return feedback
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            String(item.id).includes(q) ||
            item.content.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q) ||
            item.source.toLowerCase().includes(q) ||
            item.theme.toLowerCase().includes(q) ||
            item.themes?.some((t) => t.name.toLowerCase().includes(q));
          if (!matches) return false;
        }

        if (
          sourceFilter !== 'all' &&
          (item.source || '').toLowerCase() !== sourceFilter.toLowerCase()
        ) {
          return false;
        }

        if (selectedTheme !== 'all') {
          const matchesPrimary =
            item.theme.toLowerCase() === selectedTheme.toLowerCase();
          const matchesAnyTheme = item.themes?.some(
            (t) => t.name.toLowerCase() === selectedTheme.toLowerCase()
          );
          if (!matchesPrimary && !matchesAnyTheme) return false;
        }

        if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
          return false;
        }

        if (flaggedOnly && !item.isFlagged) {
          return false;
        }

        if (dateFilter !== 'all') {
          const itemDate = new Date(item.date).getTime();
          const now = new Date().getTime();
          const diffDays = (now - itemDate) / (1000 * 3600 * 24);
          if (dateFilter === '7d' && diffDays > 7) return false;
          if (dateFilter === '30d' && diffDays > 30) return false;
          if (dateFilter === '90d' && diffDays > 90) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return (
            (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0) ||
            a.id - b.id
          );
        }
        if (sortBy === 'id') {
          return a.id - b.id;
        }
        return (
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          b.id - a.id
        );
      });
  }, [
    feedback,
    searchQuery,
    sourceFilter,
    selectedTheme,
    priorityFilter,
    flaggedOnly,
    dateFilter,
    sortBy,
  ]);

  const exportFilteredCSV = () => {
    const headers = [
      'ID',
      'Source',
      'Topic',
      'Priority',
      'Flagged',
      'Date',
      'Summary',
      'Content',
    ];
    const rows = filteredList.map((item) => [
      `"${item.id}"`,
      `"${(item.source || '').replace(/"/g, '""')}"`,
      `"${(item.theme || '').replace(/"/g, '""')}"`,
      `"${item.priority}"`,
      `"${item.isFlagged ? 'Yes' : 'No'}"`,
      `"${item.date}"`,
      `"${(item.summary || '').replace(/"/g, '""')}"`,
      `"${(item.content || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leeg_feedback_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDrilldown = (themeName: string) => {
    const found = themes.find(
      (t) => t.name.toLowerCase() === themeName.toLowerCase()
    );
    if (found) {
      setDrilldownTheme(found);
      setIsModalOpen(true);
    }
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    sourceFilter !== 'all' ||
    selectedTheme !== 'all' ||
    priorityFilter !== 'all' ||
    flaggedOnly ||
    dateFilter !== 'all';

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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-2xl font-bold text-[#161B19] tracking-tight">
            All Feedback
          </h1>
          <span className="text-xs font-medium text-[#53615A] bg-[#E8E0D3]/60 px-2 py-0.5 rounded-md border border-[#D5C9B8]">
            {loading ? '...' : `${filteredList.length} of ${feedback.length} records`}
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-[#DCE4DD] text-[#53615A] hover:text-[#161B19] transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE4DD] text-[#161B19] text-xs font-medium hover:bg-[#F8FAF7] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B89B72]" />
            <span>Options</span>
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-10 z-20 w-52 p-3 rounded-xl bg-white border border-[#DCE4DD] shadow-lg space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#53615A] mb-1">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full py-1.5 px-2 bg-[#F8FAF7] border border-[#CED9D0] rounded-lg text-xs text-[#161B19]"
                >
                  <option value="all">All Dates</option>
                  <option value="7d">Past 7 Days</option>
                  <option value="30d">Past 30 Days</option>
                  <option value="90d">Past 90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#53615A] mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-1.5 px-2 bg-[#F8FAF7] border border-[#CED9D0] rounded-lg text-xs text-[#161B19]"
                >
                  <option value="newest">Newest First</option>
                  <option value="priority">Highest Priority</option>
                  <option value="id">Record ID (#1–20)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  exportFilteredCSV();
                  setShowMoreMenu(false);
                }}
                disabled={filteredList.length === 0}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#EFF3EF] hover:bg-[#DCE4DD] text-[#123D32] font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          )}
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
            className="px-3 py-1 rounded bg-rose-700 text-white font-semibold text-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Prominent Search & Simple Filter Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-[#DCE4DD] flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#6F9B86] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback, topic, source, or #ID..."
            className="w-full pl-9 pr-7 py-2 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all placeholder:text-[#8C9B92]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#53615A] hover:text-[#161B19]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Simple Filters: Topic, Priority, Source, Flagged */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            aria-label="Filter by Topic"
            className="py-2 px-2.5 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] text-[#161B19] font-medium cursor-pointer"
          >
            <option value="all">All Topics</option>
            {allThemeNames.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by Priority"
            className="py-2 px-2.5 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] text-[#161B19] font-medium cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by Source"
            className="py-2 px-2.5 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] text-[#161B19] font-medium cursor-pointer"
          >
            <option value="all">All Sources</option>
            {allSourceNames.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              flaggedOnly
                ? 'bg-[#123D32] text-white border-[#123D32]'
                : 'bg-[#F8FAF7] text-[#161B19] border-[#CED9D0] hover:bg-[#EFF3EF]'
            }`}
          >
            Flagged
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-2.5 py-2 text-xs font-semibold text-[#123D32] hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-[#DCE4DD] divide-y divide-[#EFF3EF]">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="p-4 flex items-center justify-between animate-pulse">
              <div className="h-4 w-1/2 bg-[#EFF3EF] rounded" />
              <div className="h-4 w-24 bg-[#F8FAF7] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredList.length === 0 && (
        <div className="p-10 text-center bg-white rounded-xl border border-[#DCE4DD] space-y-2.5">
          <h3 className="text-sm font-bold text-[#161B19]">No matching feedback found</h3>
          <p className="text-xs text-[#53615A]">
            Try clearing your search or resetting the filters above.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Clean Transaction-Style Feedback Library Table */}
      {!loading && filteredList.length > 0 && (
        <div className="bg-white rounded-xl border border-[#DCE4DD] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF7] border-b border-[#DCE4DD] text-[#53615A] font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Feedback</th>
                  <th className="py-3 px-4 hidden md:table-cell">Topic</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Source</th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSortBy(sortBy === 'priority' ? 'newest' : 'priority')
                      }
                      className="inline-flex items-center gap-1 hover:text-[#161B19] cursor-pointer"
                    >
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setSortBy(sortBy === 'newest' ? 'id' : 'newest')
                      }
                      className="inline-flex items-center gap-1 hover:text-[#161B19] cursor-pointer ml-auto"
                    >
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFF3EF]">
                {filteredList.map((item) => {
                  const previewText = (item.summary || item.content).replace(
                    /^"|"$/g,
                    ''
                  );
                  return (
                    <tr
                      key={item.id}
                      tabIndex={0}
                      role="link"
                      onClick={() => router.push(`/feedback/${item.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/feedback/${item.id}`);
                        }
                      }}
                      className="hover:bg-[#F8FAF7] focus:bg-[#EFF3EF] focus:outline-none transition-colors cursor-pointer group"
                    >
                      {/* Feedback preview (single line with ellipsis) */}
                      <td className="py-3 px-4 max-w-[260px] sm:max-w-md lg:max-w-lg">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono font-bold text-[#161B19] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0] text-[11px] shrink-0">
                            #{item.id}
                          </span>
                          <span className="text-[#161B19] group-hover:text-[#123D32] font-medium truncate block">
                            {previewText}
                          </span>
                        </div>
                        <div className="md:hidden mt-1 flex items-center gap-2 text-[10px] text-[#53615A]">
                          <span>{item.theme}</span>
                          <span>•</span>
                          <span>{item.source}</span>
                        </div>
                      </td>

                      {/* Topic */}
                      <td
                        className="py-3 px-4 whitespace-nowrap hidden md:table-cell"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrilldown(item.theme);
                        }}
                      >
                        <span className="text-[#123D32] hover:underline font-medium text-xs">
                          {item.theme}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4 whitespace-nowrap hidden sm:table-cell text-[#53615A]">
                        {item.source}
                      </td>

                      {/* Priority + Flagged */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getPriorityBadge(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                          {item.isFlagged && (
                            <span className="text-[10px] font-medium text-[#5C4930] bg-[#E8E0D3] px-1.5 py-0.5 rounded border border-[#D5C9B8]">
                              Flagged
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-right text-[#53615A] font-mono text-[11px]">
                        {item.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Topic Quotes Modal */}
      <ThemeDrilldownModal
        theme={drilldownTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={feedback}
      />
    </div>
  );
}

export default function FeedbackExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-[#53615A] text-xs">
          Loading feedback...
        </div>
      }
    >
      <FeedbackExplorerContent />
    </Suspense>
  );
}
