'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Tag,
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
    } catch {
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCE4DD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#123D32]" />
              External OpenAlex API
            </span>
            <span className="text-[#9BA8A0] text-xs">•</span>
            <span className="text-xs text-[#53615A] font-medium">
              Independent Academic Literature
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161B19] tracking-tight">
            External Research Context
          </h1>
        </div>
      </div>

      {/* Concise distinction notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#EFF3EF] border border-[#CED9D0]">
        <Info className="w-4 h-4 text-[#123D32] shrink-0 mt-0.5" />
        <div className="text-xs text-[#161B19] leading-relaxed">
          <strong>External Research ≠ Customer Feedback:</strong> Results below are published academic papers retrieved live via our server route (<code>/api/research</code>) from{' '}
          <a
            href="https://openalex.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-[#123D32]"
          >
            OpenAlex.org
          </a>
          , independent of Leeg&apos;s Supabase feedback database.
        </div>
      </div>

      {/* Search box + Quick topics */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs space-y-3.5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F9B86]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search academic literature (e.g. AI interview coaching, mentorship matching)..."
              maxLength={200}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-[#CED9D0] rounded-lg bg-[#F8FAF7] text-[#161B19] placeholder-[#8C9B92] focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2 rounded-lg bg-[#123D32] text-white text-xs sm:text-sm font-semibold hover:bg-[#0B2822] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-[#A8CBB7]" />
            )}
            <span>Search</span>
          </button>
        </form>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#53615A] block mb-1.5">
            Quick Search by Leeg Product Theme:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => handleQuickSearch(topic)}
                disabled={loading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#CED9D0] bg-[#F8FAF7] text-xs text-[#161B19] hover:border-[#123D32] hover:text-[#123D32] hover:bg-[#EFF3EF] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Tag className="w-3 h-3 text-[#6F9B86]" />
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
          <div className="ml-6 mt-2 p-3 rounded-lg bg-white border border-rose-200/70 text-xs text-[#53615A]">
            <strong className="text-[#161B19]">Graceful recovery:</strong> The rest of the Leeg application (Dashboard, Feedback Explorer, AI Insights) continues to work normally.
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-xl bg-white border border-[#DCE4DD] animate-pulse space-y-2.5"
            >
              <div className="h-4 w-3/4 bg-[#EFF3EF] rounded" />
              <div className="h-3 w-1/3 bg-[#F8FAF7] rounded" />
              <div className="h-8 bg-[#F8FAF7] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results (Concise Publication Info + Expandable Abstract) */}
      {!loading && results.length > 0 && meta && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#53615A]">
            <span>
              Showing <strong className="text-[#161B19]">{results.length}</strong> of ~
              {meta.totalResults.toLocaleString()} OpenAlex works for &ldquo;{meta.query}&rdquo;
            </span>
            <span>{meta.attribution}</span>
          </div>

          {results.map((work, idx) => {
            const isExpanded = expandedId === work.id;
            return (
              <div
                key={work.id}
                className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs hover:border-[#6F9B86] transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-[#161B19] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0]">
                      #{idx + 1}
                    </span>
                    {work.year && (
                      <span className="text-[10px] font-semibold text-[#123D32] bg-[#EFF3EF] border border-[#CED9D0] px-1.5 py-0.5 rounded">
                        {work.year}
                      </span>
                    )}
                    {work.openAccess && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        Open Access
                      </span>
                    )}
                    {work.citedByCount !== null && work.citedByCount > 0 && (
                      <span className="text-[10px] text-[#53615A]">
                        {work.citedByCount.toLocaleString()} citations
                      </span>
                    )}
                  </div>
                  {work.url && (
                    <a
                      href={work.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs text-[#123D32] font-semibold hover:underline"
                    >
                      Open Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#161B19] leading-snug">
                  {work.title}
                </h3>

                {(work.authors.length > 0 || work.source) && (
                  <p className="text-[11px] text-[#53615A]">
                    {work.authors.length > 0 && <span>{work.authors.join(', ')}</span>}
                    {work.authors.length > 0 && work.source && (
                      <span className="text-[#9BA8A0] mx-1.5">•</span>
                    )}
                    {work.source && <span className="italic font-medium">{work.source}</span>}
                  </p>
                )}

                {work.abstract ? (
                  <div>
                    <p className="text-xs text-[#53615A] leading-relaxed">
                      {isExpanded
                        ? work.abstract
                        : `${work.abstract.slice(0, 140)}${
                            work.abstract.length > 140 ? '...' : ''
                          }`}
                    </p>
                    {work.abstract.length > 140 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : work.id)
                        }
                        className="mt-1 text-[11px] text-[#123D32] hover:underline font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            Collapse abstract <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Expand abstract <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#53615A] italic">
                    Abstract preview not indexed for this publication.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state after a search */}
      {!loading && !error && meta && results.length === 0 && (
        <div className="p-8 rounded-xl bg-white border border-[#DCE4DD] text-center space-y-2">
          <BookOpen className="w-7 h-7 text-[#6F9B86] mx-auto" />
          <p className="text-sm font-semibold text-[#161B19]">No publications found</p>
          <p className="text-xs text-[#53615A]">
            Try another search term or click one of the quick-search theme tags above.
          </p>
        </div>
      )}

      {/* Initial empty state */}
      {!loading && !error && !meta && (
        <div className="p-8 rounded-xl bg-white border border-[#DCE4DD] text-center space-y-2">
          <BookOpen className="w-8 h-8 text-[#6F9B86] mx-auto" />
          <p className="text-sm font-bold text-[#161B19]">
            Search External Academic Literature
          </p>
          <p className="text-xs text-[#53615A] max-w-md mx-auto">
            Select a quick-search theme tag above or enter a topic to retrieve peer-reviewed research from OpenAlex.
          </p>
        </div>
      )}
    </div>
  );
}
