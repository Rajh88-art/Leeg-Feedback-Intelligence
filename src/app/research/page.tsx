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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const QUICK_TOPICS = [
  { label: 'AI interview prep', query: 'AI interview coaching career preparation' },
  { label: 'Mentorship matching', query: 'mentorship matching career development technology' },
  { label: 'Resume screening', query: 'resume ATS screening machine learning' },
  { label: 'Career platforms', query: 'career development online learning platforms' },
  { label: 'Mobile learning UX', query: 'mobile learning user experience design' },
  { label: 'Privacy in ed-tech', query: 'privacy data protection educational technology platforms' },
  { label: 'Salary benchmarks', query: 'job market analytics salary benchmarking data' },
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
        setError(data.error || `Research service returned an error (HTTP ${res.status}).`);
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
      setError('Could not reach the research service. Check your connection and try again.');
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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#161B19] tracking-tight">
          Research Context
        </h1>
        <p className="text-xs text-[#53615A] mt-0.5">
          Search published academic papers from{' '}
          <a
            href="https://openalex.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#123D32] font-semibold underline"
          >
            OpenAlex
          </a>
          . These are external studies, separate from Leeg&apos;s customer feedback.
        </p>
      </div>

      {/* Search box + Quick topics */}
      <div className="p-4 rounded-xl bg-white border border-[#DCE4DD] space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F9B86]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search academic studies (e.g. AI interview coaching, mentorship)..."
              maxLength={200}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-[#CED9D0] rounded-lg bg-[#F8FAF7] text-[#161B19] placeholder-[#8C9B92] focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2 rounded-lg bg-[#123D32] text-white text-xs sm:text-sm font-semibold hover:bg-[#0B2822] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Search</span>
          </button>
        </form>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#53615A] mr-1">Topics:</span>
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic.label}
              type="button"
              onClick={() => handleQuickSearch(topic)}
              disabled={loading}
              className="px-2.5 py-1 rounded-md border border-[#D5C9B8] bg-[#E8E0D3]/40 text-xs text-[#161B19] hover:bg-[#E8E0D3] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-sm text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <strong>Research Service Unavailable</strong>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed ml-6">{error}</p>
          {simulated && (
            <p className="text-[11px] text-rose-500 ml-6 italic">
              [Simulated failure for assignment testing.]
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
            <strong className="text-[#161B19]">App status:</strong> Dashboard, All Feedback, and AI Insights continue working normally.
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-4 rounded-xl bg-white border border-[#DCE4DD] h-20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && meta && (
        <div className="space-y-3">
          {results.map((work, idx) => {
            const isExpanded = expandedId === work.id;
            return (
              <div
                key={work.id}
                className="p-4 rounded-xl bg-white border border-[#DCE4DD] hover:border-[#B89B72] transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-[#161B19] bg-[#EFF3EF] px-1.5 py-0.5 rounded border border-[#CED9D0]">
                      #{idx + 1}
                    </span>
                    {work.year && (
                      <span className="text-[10px] font-semibold text-[#5C4930] bg-[#E8E0D3]/70 border border-[#D5C9B8] px-1.5 py-0.5 rounded">
                        {work.year}
                      </span>
                    )}
                    {work.source && (
                      <span className="text-xs text-[#53615A] truncate max-w-xs">
                        {work.source}
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
                      Read paper <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#161B19] leading-snug">
                  {work.title}
                </h3>

                {work.abstract && (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : work.id)
                      }
                      className="text-xs text-[#123D32] hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide abstract <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          View abstract <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                    {isExpanded && (
                      <p className="mt-1.5 text-xs text-[#53615A] leading-relaxed bg-[#F8FAF7] p-3 rounded-lg border border-[#DCE4DD]">
                        {work.abstract}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && !meta && (
        <div className="p-8 rounded-xl bg-white border border-[#DCE4DD] text-center space-y-1.5">
          <BookOpen className="w-7 h-7 text-[#B89B72] mx-auto" />
          <p className="text-sm font-bold text-[#161B19]">
            Explore External Research
          </p>
          <p className="text-xs text-[#53615A]">
            Pick a topic above or search a keyword to view published studies.
          </p>
        </div>
      )}
    </div>
  );
}
