'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Tag,
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
} from 'lucide-react';

// Quick-search topics derived from the 7 existing Leeg product themes
const QUICK_TOPICS = [
  { label: 'AI interview preparation', query: 'AI interview coaching career preparation' },
  { label: 'Mentorship technology', query: 'mentorship matching career development technology' },
  { label: 'Resume screening algorithms', query: 'resume ATS screening machine learning' },
  { label: 'Career development platforms', query: 'career development online learning platforms' },
  { label: 'Mobile learning UX', query: 'mobile learning user experience design' },
  { label: 'Privacy in ed-tech', query: 'privacy data protection educational technology platforms' },
  { label: 'Job market analytics', query: 'job market analytics salary benchmarking data' },
];

interface ResearchResult {
  id: string;
  title: string;
  year: number | null;
  source: string | null;
  abstract: string | null;
  citedByCount: number | null;
  openAccess: boolean;
  url: string | null;
  authors: string[];
}

interface SearchResponse {
  query: string;
  totalResults: number;
  results: ResearchResult[];
  source: string;
  attribution: string;
  error?: string;
  simulated?: boolean;
}

export default function ResearchPage() {
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [meta, setMeta] = useState<{
    query: string;
    totalResults: number;
    source: string;
    attribution: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const runSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setMeta(null);
    setSimulated(false);

    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(
        `/api/research?q=${encodeURIComponent(q)}`,
        { method: 'GET', headers }
      );
      const data: SearchResponse = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || `External research service returned an error (HTTP ${res.status}).`);
        setSimulated(data.simulated || false);
        return;
      }

      setResults(data.results || []);
      setMeta({
        query: data.query,
        totalResults: data.totalResults,
        source: data.source,
        attribution: data.attribution,
      });
    } catch (err: any) {
      setError(
        'Could not reach the research API. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleQuickSearch = (topic: (typeof QUICK_TOPICS)[0]) => {
    setQuery(topic.query);
    runSearch(topic.query);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-600" />
              External Research
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Powered by OpenAlex Academic Search
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Research Context
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Search published academic and industry research relevant to Leeg product themes. This data
            comes from an <strong>external open-access API</strong> (OpenAlex) — entirely separate from
            Leeg&apos;s customer feedback database.
          </p>
        </div>
      </div>

      {/* Important distinction notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200/70">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>External Research ≠ Customer Feedback.</strong> Results below are published
          academic papers and reports retrieved in real time from{' '}
          <a
            href="https://openalex.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:text-blue-700"
          >
            OpenAlex.org
          </a>
          . They are not Leeg customer records. Use them to understand broader industry context
          around issues your customers are raising.
        </div>
      </div>

      {/* Search box */}
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. AI interview coaching, mentorship platforms, career development..."
              maxLength={200}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </form>

        {/* Quick topic searches */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Quick Search — Leeg Product Themes
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.label}
                onClick={() => handleQuickSearch(topic)}
                disabled={loading}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs text-slate-700 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Tag className="w-3 h-3" />
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-sm text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <strong>External Research Unavailable</strong>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed ml-6">{error}</p>
          {simulated && (
            <p className="text-[11px] text-rose-500 ml-6 italic">
              [This failure is intentionally simulated for assignment testing purposes.]
            </p>
          )}
          <div className="ml-6">
            <button
              onClick={() => query && runSearch(query)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
          <div className="ml-6 mt-2 p-3 rounded-lg bg-white border border-rose-200/70 text-xs text-slate-600">
            <strong className="text-slate-700">Graceful recovery:</strong> The rest of the
            Leeg application (Dashboard, Feedback Explorer, AI Insights) continues to work
            normally. Only this external research feature is affected.
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-xl bg-white border border-slate-200 animate-pulse space-y-3"
            >
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/3 bg-slate-100 rounded" />
              <div className="h-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && meta && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {results.length} Result{results.length !== 1 ? 's' : ''} from External Research
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Showing top {results.length} of ~{meta.totalResults.toLocaleString()} results
                for &ldquo;{meta.query}&rdquo; · {meta.attribution}
              </p>
            </div>
          </div>

          {results.map((work, idx) => (
            <div
              key={work.id}
              className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    #{idx + 1}
                  </span>
                  {work.openAccess && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded">
                      Open Access
                    </span>
                  )}
                  {work.year && (
                    <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/70 px-1.5 py-0.5 rounded">
                      {work.year}
                    </span>
                  )}
                  {work.citedByCount !== null && work.citedByCount > 0 && (
                    <span className="text-[10px] text-slate-400">
                      {work.citedByCount.toLocaleString()} citations
                    </span>
                  )}
                </div>
                {work.url && (
                  <a
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-xs text-purple-700 font-medium hover:text-purple-900 hover:underline"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                {work.title}
              </h3>

              {(work.authors.length > 0 || work.source) && (
                <p className="text-[11px] text-slate-500 mb-2">
                  {work.authors.length > 0 && (
                    <span>{work.authors.join(', ')}</span>
                  )}
                  {work.authors.length > 0 && work.source && (
                    <span className="text-slate-300 mx-1">·</span>
                  )}
                  {work.source && <span className="italic">{work.source}</span>}
                </p>
              )}

              {work.abstract && (
                <div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {expandedId === work.id
                      ? work.abstract
                      : `${work.abstract.slice(0, 180)}${work.abstract.length > 180 ? '...' : ''}`}
                  </p>
                  {work.abstract.length > 180 && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === work.id ? null : work.id)
                      }
                      className="mt-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium flex items-center gap-0.5 cursor-pointer"
                    >
                      {expandedId === work.id ? (
                        <>
                          Show less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {!work.abstract && (
                <p className="text-xs text-slate-400 italic">
                  Abstract not available for this record.
                </p>
              )}

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Source: {meta.source}
                </span>
                {work.url && (
                  <a
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <BookOpen className="w-3 h-3" />
                    Read Paper
                  </a>
                )}
              </div>
            </div>
          ))}

          <p className="text-[11px] text-slate-400 text-center pt-2">
            {meta.attribution} · This is external academic literature, not Leeg customer data.
          </p>
        </div>
      )}

      {/* Empty state after a search */}
      {!loading && !error && meta && results.length === 0 && (
        <div className="p-10 rounded-xl bg-white border border-slate-200 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No results found</p>
          <p className="text-xs text-slate-400">
            Try a different search term or one of the quick topic buttons above.
          </p>
        </div>
      )}

      {/* Initial empty state */}
      {!loading && !error && !meta && (
        <div className="p-10 rounded-xl bg-white border border-slate-200 border-dashed text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-slate-600">
              Search External Academic Literature
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Enter a topic above or click a quick-search tag to retrieve relevant published
              research from OpenAlex. Results come from an external API — not from Leeg&apos;s
              Supabase database.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
