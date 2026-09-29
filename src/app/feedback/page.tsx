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
    link.setAttribute('download', `leeg_career_feedback_${Date.now()}.csv`);
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Voice of the Member
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">Feedback Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Feedback Explorer
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Browse and filter through individual member quotes and feedback notes across all Leeg Career OS touchpoints.
          </p>
        </div>

        <button
          onClick={exportFilteredCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>Export Quotes (.CSV)</span>
        </button>
      </div>

      {/* Clean Filter Control Panel */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        {/* Search Bar & Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, member role, quote, or goal..."
              className="w-full pl-11 pr-8 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full py-3 px-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-slate-700 font-medium"
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
              className="w-full py-3 px-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-slate-700 font-medium"
            >
              <option value="all">All Dates</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
              <option value="90d">Past 90 Days</option>
            </select>
          </div>
        </div>

        {/* Source Pills */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Filter by Sample Source
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {allSources.map((src) => {
              const active = selectedSources.includes(src);
              return (
                <button
                  key={src}
                  onClick={() => toggleSource(src)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>{src}</span>
                  {active && <X className="w-3 h-3" />}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-purple-700 hover:underline ml-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-800 font-bold">{filteredList.length}</strong> of{' '}
          {feedbackList.length} sample quotes
        </span>
      </div>

      {/* Feedback Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <h3 className="text-base font-bold text-slate-900">No matching quotes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try clearing your search query or selecting a different career theme.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.author.avatar}
                      alt={item.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        {item.author.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.author.role} • {item.author.location}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.source}
                  </span>
                </div>

                {/* Quote Box */}
                <p className="text-sm text-slate-800 italic font-serif leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100 mb-3">
                  {item.rawQuote}
                </p>

                {/* Theme & Need */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => openDrilldown(item.theme)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    <span>{item.theme}</span>
                  </button>

                  <p className="text-xs text-slate-500 leading-normal">
                    <span className="font-semibold text-slate-700">Goal:</span> {item.userGoal}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {new Date(item.date).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>

                <Link
                  href={`/feedback/${item.id}`}
                  className="font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
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
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading feedback explorer...
        </div>
      }
    >
      <FeedbackExplorerContent />
    </Suspense>
  );
}
