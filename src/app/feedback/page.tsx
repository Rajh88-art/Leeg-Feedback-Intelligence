'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Download,
  X,
  ChevronRight,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
  RefreshCw,
  Database,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { fetchAllFeedbackData } from '@/services/feedbackDbService';
import { EnrichedFeedback, EnrichedTheme, DbSource } from '@/types/database';
import ThemeDrilldownModal from '../../components/ThemeDrilldownModal';

function FeedbackExplorerContent() {
  const searchParams = useSearchParams();
  const initialSource = searchParams?.get('source');

  const [feedback, setFeedback] = useState<EnrichedFeedback[]>([]);
  const [themes, setThemes] = useState<EnrichedTheme[]>([]);
  const [sources, setSources] = useState<DbSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(
    initialSource ? [initialSource] : []
  );
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Progressive disclosure: track which card quotes are expanded
  const [expandedCardIds, setExpandedCardIds] = useState<number[]>([]);
  const [showPriorityHelp, setShowPriorityHelp] = useState(false);

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
      console.error('Failed to load feedback from Supabase:', err);
      setError(err?.message || 'Failed to connect to Supabase database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialSource && !selectedSources.includes(initialSource)) {
      setSelectedSources([initialSource]);
    }
  }, [initialSource]);

  const allSourceNames = useMemo(() => {
    if (sources.length > 0) {
      return sources.map((s) => s.name);
    }
    const sourceSet = new Set<string>();
    feedback.forEach((item) => {
      if (item.source) sourceSet.add(item.source);
    });
    return Array.from(sourceSet);
  }, [sources, feedback]);

  const allThemeNames = useMemo(() => {
    if (themes.length > 0) {
      return themes.map((t) => t.name);
    }
    const themeSet = new Set<string>();
    feedback.forEach((item) => {
      if (item.theme) themeSet.add(item.theme);
    });
    return Array.from(themeSet);
  }, [themes, feedback]);

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const toggleCardQuote = (id: number) => {
    setExpandedCardIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSources([]);
    setSelectedTheme('all');
    setPriorityFilter('all');
    setDateFilter('all');
  };

  const filteredList = useMemo(() => {
    return feedback.filter((item) => {
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
        selectedSources.length > 0 &&
        !selectedSources.some(
          (s) => s.toLowerCase() === (item.source || '').toLowerCase()
        )
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

      if (priorityFilter !== 'all') {
        if (priorityFilter === 'flagged') {
          if (!item.isFlagged) return false;
        } else if (item.priority !== priorityFilter) {
          return false;
        }
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
    });
  }, [feedback, searchQuery, selectedSources, selectedTheme, priorityFilter, dateFilter]);

  const exportFilteredCSV = () => {
    const headers = [
      'ID',
      'Source',
      'Theme',
      'Priority',
      'Sentiment',
      'Flagged',
      'Date',
      'Content',
      'Summary',
    ];
    const rows = filteredList.map((item) => [
      `"${item.id}"`,
      `"${(item.source || '').replace(/"/g, '""')}"`,
      `"${(item.theme || '').replace(/"/g, '""')}"`,
      `"${item.priority}"`,
      `"${item.sentiment}"`,
      `"${item.isFlagged ? 'Yes' : 'No'}"`,
      `"${item.date}"`,
      `"${(item.content || '').replace(/"/g, '""')}"`,
      `"${(item.summary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leeg_supabase_feedback_${Date.now()}.csv`);
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
    } else {
      setDrilldownTheme({
        id: 0,
        name: themeName,
        description: 'Customer feedback matching this product cluster.',
        category: 'Product Area',
        count: feedback.filter((f) => f.theme === themeName).length,
        feedbackIds: feedback.filter((f) => f.theme === themeName).map((f) => f.id),
        flaggedCount: 0,
      });
      setIsModalOpen(true);
    }
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedSources.length > 0 ||
    selectedTheme !== 'all' ||
    priorityFilter !== 'all' ||
    dateFilter !== 'all';

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

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'needs_attention':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'neutral':
      default:
        return 'bg-[#F8FAF7] text-[#53615A] border-[#DCE4DD]';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCE4DD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#123D32]" />
              Supabase Repository
            </span>
            <span className="text-[#9BA8A0] text-xs">•</span>
            <span className="text-xs text-[#53615A] font-medium">
              {loading ? 'Connecting...' : `${feedback.length} Customer Records`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161B19] tracking-tight">
            Feedback Explorer
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPriorityHelp(!showPriorityHelp)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EFF3EF] border border-[#CED9D0] text-[#123D32] text-xs font-semibold hover:bg-[#E2EBE4] transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Priority vs. Flagged</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE4DD] text-[#161B19] text-xs font-medium hover:bg-[#F8FAF7] transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6F9B86] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportFilteredCSV}
            disabled={filteredList.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE4DD] text-[#161B19] text-xs font-medium hover:bg-[#F8FAF7] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6F9B86]" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center bg-[#EFF3EF] p-0.5 rounded-lg border border-[#DCE4DD]">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-[#123D32] shadow-2xs'
                  : 'text-[#53615A] hover:text-[#161B19]'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#123D32] shadow-2xs'
                  : 'text-[#53615A] hover:text-[#161B19]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Priority vs. Flagged Explanation (Part 7) */}
      {showPriorityHelp && (
        <div className="p-4 rounded-xl bg-white border border-[#6F9B86] text-xs text-[#53615A] space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#123D32] uppercase tracking-wider text-[11px]">
              Understanding Stored Priority vs. Flagged Status
            </span>
            <button
              type="button"
              onClick={() => setShowPriorityHelp(false)}
              className="text-[#53615A] hover:text-[#161B19] font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="leading-relaxed">
            <strong className="text-[#161B19]">Priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`):</strong> Reflects the stored severity of the customer issue in Supabase (e.g., `CRITICAL` for privacy/security risks like Record #10).{' '}
            <strong className="text-amber-800">Flagged:</strong> A separate review marker (`is_flagged`) indicating any record that needs product team follow-up regardless of priority.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 rounded bg-rose-700 text-white font-semibold text-xs hover:bg-rose-800 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Unified Filter Panel */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="md:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-[#6F9B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search record #, summary, quote, or theme..."
              className="w-full pl-9 pr-7 py-2 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all placeholder:text-[#8C9B92]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#53615A] hover:text-[#161B19]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] text-[#161B19] font-medium cursor-pointer"
            >
              <option value="all">All Themes ({allThemeNames.length})</option>
              {allThemeNames.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] text-[#161B19] font-medium cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
              <option value="flagged">Flagged Only</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] text-[#161B19] font-medium cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
              <option value="90d">Past 90 Days</option>
            </select>
          </div>
        </div>

        {/* Source Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#53615A] mr-1">
              Channel:
            </span>
            {allSourceNames.map((src) => {
              const active = selectedSources.includes(src);
              return (
                <button
                  key={src}
                  onClick={() => toggleSource(src)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'bg-[#123D32] text-white border-[#123D32] shadow-2xs'
                      : 'bg-[#F8FAF7] text-[#161B19] border-[#CED9D0] hover:bg-[#EFF3EF]'
                  }`}
                >
                  <span>{src}</span>
                  {active && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-semibold text-[#123D32] hover:underline shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between text-xs text-[#53615A] px-0.5">
        <span>
          Showing <strong className="text-[#161B19] font-semibold">{filteredList.length}</strong> of{' '}
          {feedback.length} records &bull; Click any record to inspect full details
        </span>
        {hasActiveFilters && (
          <span className="text-[#123D32] font-semibold text-[11px]">Filtered view</span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-3 animate-pulse"
            >
              <div className="h-4 w-32 bg-[#EFF3EF] rounded" />
              <div className="h-10 bg-[#F8FAF7] rounded-md" />
              <div className="h-3 w-48 bg-[#EFF3EF] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredList.length === 0 && (
        <div className="p-10 text-center bg-white rounded-xl border border-[#DCE4DD] space-y-2.5">
          <h3 className="text-sm font-bold text-[#161B19]">No matching customer records found</h3>
          <p className="text-xs text-[#53615A] max-w-sm mx-auto">
            Try clearing your search query or resetting the theme, priority, and channel filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-3.5 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Card Grid View (Progressive Disclosure — Concise Summary First, Expandable Quote) */}
      {!loading && viewMode === 'card' && filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isExpanded = expandedCardIds.includes(item.id);
            const cleanQuote = item.content.replace(/^"|"$/g, '');
            const isLongQuote = cleanQuote.length > 130;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-xl bg-white border transition-all flex flex-col justify-between space-y-3 ${
                  item.priority === 'critical'
                    ? 'border-red-300 shadow-xs'
                    : 'border-[#DCE4DD] hover:border-[#6F9B86]'
                }`}
              >
                <div>
                  {/* Header: Record ID, Source, Priority, Flagged */}
                  <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/feedback/${item.id}`}
                        className="font-mono text-xs font-bold text-[#161B19] bg-[#EFF3EF] hover:bg-[#DCE4DD] px-2 py-0.5 rounded border border-[#CED9D0] transition-colors"
                      >
                        #{item.id}
                      </Link>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F8FAF7] text-[#161B19] border border-[#DCE4DD]">
                        {item.source}
                      </span>
                      {item.isFlagged && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Flagged
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${getSentimentBadge(
                          item.sentiment
                        )}`}
                      >
                        {item.sentiment === 'needs_attention' ? 'Attention' : item.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Clickable Theme */}
                  <button
                    type="button"
                    onClick={() => openDrilldown(item.theme)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#123D32] hover:underline mb-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#6F9B86]" />
                    <span>{item.theme}</span>
                  </button>

                  {/* Concise Summary / Truncated Quote */}
                  <p className="text-xs text-[#161B19] leading-relaxed">
                    {isExpanded || !isLongQuote
                      ? `“${cleanQuote}”`
                      : `“${cleanQuote.slice(0, 130).trim()}...”`}
                  </p>

                  {isLongQuote && (
                    <button
                      type="button"
                      onClick={() => toggleCardQuote(item.id)}
                      className="mt-1.5 text-[11px] font-semibold text-[#123D32] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Show less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Read full quote <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-2.5 border-t border-[#EFF3EF] flex items-center justify-between text-[11px]">
                  <span className="text-[#53615A]">{item.date}</span>

                  <Link
                    href={`/feedback/${item.id}`}
                    className="font-semibold text-[#123D32] hover:text-[#0B2822] flex items-center gap-0.5"
                  >
                    Inspect Record <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && filteredList.length > 0 && (
        <div className="bg-white rounded-xl border border-[#DCE4DD] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EFF3EF] border-b border-[#DCE4DD] text-[#123D32] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Record</th>
                  <th className="py-2.5 px-4">Source</th>
                  <th className="py-2.5 px-4">Summary / Quote</th>
                  <th className="py-2.5 px-4">Theme</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFF3EF]">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAF7] transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/feedback/${item.id}`}
                        className="font-mono font-bold text-[#161B19] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0] text-[11px]"
                      >
                        #{item.id}
                      </Link>
                      {item.isFlagged && (
                        <span className="ml-1.5 text-[9px] font-semibold text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="font-medium px-1.5 py-0.5 rounded text-[10px] border bg-[#F8FAF7] text-[#161B19] border-[#DCE4DD]">
                        {item.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 max-w-xs">
                      <p className="text-[#161B19] truncate">
                        {item.summary || item.content}
                      </p>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => openDrilldown(item.theme)}
                        className="text-[#123D32] font-semibold hover:underline text-[11px] cursor-pointer"
                      >
                        {item.theme}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-[#53615A] text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/feedback/${item.id}`}
                        className="font-semibold text-[#123D32] hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drilldown Modal */}
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
          Loading feedback explorer...
        </div>
      }
    >
      <FeedbackExplorerContent />
    </Suspense>
  );
}
