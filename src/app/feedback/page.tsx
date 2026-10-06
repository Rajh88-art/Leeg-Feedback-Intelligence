'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  X,
  ArrowRight,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Layers,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { feedbackList, themeInsights } from '../../data/feedbackData';
import { FeedbackSource, ThemeInsight } from '../../types/feedback';
import ThemeDrilldownModal from '../../components/ThemeDrilldownModal';

function FeedbackExplorerContent() {
  const searchParams = useSearchParams();
  const initialSource = searchParams?.get('source') as FeedbackSource | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<FeedbackSource[]>(
    initialSource ? [initialSource] : []
  );
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const [drilldownTheme, setDrilldownTheme] = useState<ThemeInsight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allSources: FeedbackSource[] = [
    'Slack',
    'Gmail',
    'LinkedIn',
    'Instagram',
    'User research',
    'Product analytics',
  ];

  const allThemes = useMemo(() => {
    const themeSet = new Set<string>();
    feedbackList.forEach((item) => themeSet.add(item.theme));
    return Array.from(themeSet);
  }, []);

  const toggleSource = (source: FeedbackSource) => {
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
    return feedbackList.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.rawQuote.toLowerCase().includes(q) ||
          item.author.name.toLowerCase().includes(q) ||
          item.author.role.toLowerCase().includes(q) ||
          item.userGoal.toLowerCase().includes(q) ||
          item.theme.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Source filter
      if (selectedSources.length > 0 && !selectedSources.includes(item.source)) {
        return false;
      }

      // Theme filter
      if (selectedTheme !== 'all' && item.theme !== selectedTheme) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.date).getTime();
        const now = new Date('2026-09-20T20:00:00Z').getTime();
        const diffDays = (now - itemDate) / (1000 * 3600 * 24);

        if (dateFilter === '7d' && diffDays > 7) return false;
        if (dateFilter === '30d' && diffDays > 30) return false;
        if (dateFilter === '90d' && diffDays > 90) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSources, selectedTheme, dateFilter]);

  const exportFilteredCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Source',
      'Author',
      'Role',
      'Location',
      'Product Area',
      'Theme',
      'User Goal',
      'Quote',
    ];
    const rows = filteredList.map((item) => [
      `"${item.id}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.source}"`,
      `"${item.author.name.replace(/"/g, '""')}"`,
      `"${item.author.role.replace(/"/g, '""')}"`,
      `"${item.author.location || ''}"`,
      `"${item.careerProductArea}"`,
      `"${item.theme.replace(/"/g, '""')}"`,
      `"${item.userGoal.replace(/"/g, '""')}"`,
      `"${item.rawQuote.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leeg_feedback_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDrilldown = (themeName: string) => {
    const found = themeInsights.find(
      (t) => t.name.toLowerCase() === themeName.toLowerCase()
    );
    if (found) {
      setDrilldownTheme(found);
      setIsModalOpen(true);
    }
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSources.length > 0 ||
    selectedTheme !== 'all' ||
    dateFilter !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
              Customer Intelligence Repository
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">12 Verbatim Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Feedback Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Search, filter, and inspect verbatim member feedback and user research interviews across the Career OS ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportFilteredCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-all shadow-xs"
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
              placeholder="Search by quote keywords, member role, or extracted goal..."
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
              className="w-full py-2 px-3 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500 text-slate-700 font-medium"
            >
              <option value="all">All Career Themes ({allThemes.length})</option>
              {allThemes.map((t) => (
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
              className="w-full py-2 px-3 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500 text-slate-700 font-medium"
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
              Filter by Intake Source
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-medium text-purple-600 hover:text-purple-800"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {allSources.map((src) => {
              const active = selectedSources.includes(src);
              return (
                <button
                  key={src}
                  onClick={() => toggleSource(src)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1 ${
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
          {feedbackList.length} records
        </span>
        {hasActiveFilters && (
          <span className="text-purple-700 font-medium text-[11px]">Active filters applied</span>
        )}
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="p-10 text-center bg-white rounded-xl border border-slate-200 space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900">No matching customer records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Themes", or clearing the intake source filter.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Card Grid View */}
      {viewMode === 'card' && filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
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

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                    {item.source}
                  </span>
                </div>

                {/* Verbatim Quote with clean left border */}
                <div className="text-xs text-slate-800 italic leading-relaxed border-l-2 border-purple-500 bg-slate-50/60 p-3 rounded-r-lg mb-2.5">
                  "{item.rawQuote.replace(/^"|"$/g, '')}"
                </div>

                {/* Theme & Extracted Goal */}
                <div className="space-y-1">
                  <button
                    onClick={() => openDrilldown(item.theme)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    <Layers className="w-3 h-3 text-purple-500" />
                    <span>{item.theme}</span>
                  </button>

                  <p className="text-[11px] text-slate-600 leading-normal">
                    <span className="font-semibold text-slate-900">Extracted Goal:</span> {item.userGoal}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {new Date(item.date).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                  })} • {item.careerProductArea}
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
      {viewMode === 'table' && filteredList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Member / Role</th>
                  <th className="py-2.5 px-4">Source</th>
                  <th className="py-2.5 px-4">Verbatim Quote Snippet</th>
                  <th className="py-2.5 px-4">Career Theme</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{item.author.name}</div>
                      <div className="text-[10px] text-slate-500">{item.author.role}</div>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200/60">
                        {item.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 max-w-sm">
                      <p className="text-slate-700 italic truncate font-serif">
                        "{item.rawQuote.replace(/^"|"$/g, '')}"
                      </p>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => openDrilldown(item.theme)}
                        className="text-purple-700 font-medium hover:underline text-[11px]"
                      >
                        {item.theme}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(item.date).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                      })}
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
