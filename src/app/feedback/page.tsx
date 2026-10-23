'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  X,
  ChevronRight,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
  RefreshCw,
  Database,
  ArrowRight,
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
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

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

  // Update selected sources if initialSource query param changes
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

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSources([]);
    setSelectedTheme('all');
    setDateFilter('all');
  };

  const filteredList = useMemo(() => {
    return feedback.filter((item) => {
      // Search query
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

      // Source filter
      if (
        selectedSources.length > 0 &&
        !selectedSources.some(
          (s) => s.toLowerCase() === (item.source || '').toLowerCase()
        )
      ) {
        return false;
      }

      // Theme filter
      if (selectedTheme !== 'all') {
        const matchesPrimary =
          item.theme.toLowerCase() === selectedTheme.toLowerCase();
        const matchesAnyTheme = item.themes?.some(
          (t) => t.name.toLowerCase() === selectedTheme.toLowerCase()
        );
        if (!matchesPrimary && !matchesAnyTheme) return false;
      }

      // Date filter
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
  }, [feedback, searchQuery, selectedSources, selectedTheme, dateFilter]);

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
      // Fallback object if theme not directly matched by name
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
    searchQuery ||
    selectedSources.length > 0 ||
    selectedTheme !== 'all' ||
    dateFilter !== 'all';

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'Slack':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Gmail':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'LinkedIn':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Instagram':
        return 'bg-pink-50 text-pink-700 border-pink-200/80';
      case 'User Research':
      case 'User research':
        return 'bg-violet-50 text-violet-700 border-violet-200/80';
      case 'Product Analytics':
      case 'Product analytics':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/80';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'needs_attention':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/80';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-600" />
              Supabase Intelligence Repository
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {loading ? 'Connecting...' : `${feedback.length} Database Records`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Feedback Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Search, filter, and inspect verbatim member feedback and user research interviews stored in the live Supabase database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportFilteredCSV}
            disabled={filteredList.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'card'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
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

      {/* Unified Filter Panel */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        {/* Search Bar & Dropdowns Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="md:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback text, record #, summary, or theme..."
              className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500 text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">All Product Themes ({allThemeNames.length})</option>
              {allThemeNames.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500 text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
              <option value="90d">Past 90 Days</option>
            </select>
          </div>
        </div>

        {/* Source Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Filter by Intake Source ({allSourceNames.length})
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-medium text-purple-600 hover:text-purple-800 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {allSourceNames.map((src) => {
              const active = selectedSources.includes(src);
              return (
                <button
                  key={src}
                  onClick={() => toggleSource(src)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>{src}</span>
                  {active && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <span>
          Showing <strong className="text-slate-900 font-semibold">{filteredList.length}</strong> of{' '}
          {feedback.length} records
        </span>
        {hasActiveFilters && (
          <span className="text-purple-700 font-medium text-[11px]">Active filters applied</span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-14 bg-slate-100 rounded-md" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredList.length === 0 && (
        <div className="p-10 text-center bg-white rounded-xl border border-slate-200 space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900">No matching customer records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Themes", or clearing the intake source filter.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Card Grid View */}
      {!loading && viewMode === 'card' && filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Header: Record ID, Source, Priority, Sentiment, Flagged */}
                <div className="flex items-start justify-between gap-2 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Feedback #{item.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getSourceBadge(
                        item.source
                      )}`}
                    >
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
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${getSentimentBadge(
                        item.sentiment
                      )}`}
                    >
                      {item.sentiment === 'needs_attention' ? 'Attention' : item.sentiment}
                    </span>
                  </div>
                </div>

                {/* Verbatim Quote with clean left border */}
                <div className="text-xs text-slate-800 italic leading-relaxed border-l-2 border-purple-500 bg-slate-50/70 p-3 rounded-r-lg mb-2.5 font-serif">
                  "{item.content.replace(/^"|"$/g, '')}"
                </div>

                {/* Summary / Extracted Note */}
                {item.summary && item.summary !== item.content && (
                  <p className="text-[11px] text-slate-600 mb-2.5">
                    <span className="font-semibold text-slate-900">Summary: </span>
                    {item.summary}
                  </p>
                )}

                {/* Primary Theme & Linked Themes */}
                <div className="space-y-1">
                  <button
                    onClick={() => openDrilldown(item.theme)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-purple-500" />
                    <span>{item.theme}</span>
                  </button>

                  {item.themes && item.themes.length > 1 && (
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400">Also linked to:</span>
                      {item.themes.slice(1).map((th) => (
                        <button
                          key={th.id}
                          onClick={() => openDrilldown(th.name)}
                          className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          {th.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Recorded: {item.date}
                </span>

                <Link
                  href={`/feedback/${item.id}`}
                  className="font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                >
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && filteredList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Record</th>
                  <th className="py-2.5 px-4">Source</th>
                  <th className="py-2.5 px-4">Verbatim Content</th>
                  <th className="py-2.5 px-4">Theme</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Sentiment</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                        #{item.id}
                      </span>
                      {item.isFlagged && (
                        <span className="ml-1.5 text-[9px] font-semibold text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-medium px-1.5 py-0.5 rounded text-[10px] border ${getSourceBadge(
                          item.source
                        )}`}
                      >
                        {item.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 max-w-sm">
                      <p className="text-slate-800 italic truncate font-serif">
                        "{item.content.replace(/^"|"$/g, '')}"
                      </p>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => openDrilldown(item.theme)}
                        className="text-purple-700 font-medium hover:underline text-[11px] cursor-pointer"
                      >
                        {item.theme}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize ${getSentimentBadge(
                          item.sentiment
                        )}`}
                      >
                        {item.sentiment === 'needs_attention' ? 'Attention' : item.sentiment}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/feedback/${item.id}`}
                        className="font-medium text-purple-600 hover:text-purple-800"
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
        <div className="p-10 text-center text-slate-500 text-xs">
          Loading feedback explorer...
        </div>
      }
    >
      <FeedbackExplorerContent />
    </Suspense>
  );
}
