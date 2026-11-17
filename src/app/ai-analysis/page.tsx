'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AnalyzedIssue {
  rank: number;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  recommendation: string;
  supportingFeedbackIds: number[];
  confidence: 'high' | 'medium' | 'low';
}

interface AnalysisResponse {
  issues: AnalyzedIssue[];
  disclaimer: string;
  model: string;
  recordsAnalyzed: number;
  generatedAt: string;
  promptReference: string;
  error?: string;
  simulated?: boolean;
}

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case 'HIGH':
      return (
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-amber-50 text-amber-900 border-amber-300">
          Suggested: High
        </span>
      );
    case 'LOW':
      return (
        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded border bg-[#EFF3EF] text-[#123D32] border-[#CED9D0]">
          Suggested: Low
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded border bg-[#E8E0D3]/80 text-[#5C4930] border-[#D5C9B8]">
          Suggested: Medium
        </span>
      );
  }
}

export default function AIAnalysisPage() {
  const { session } = useAuth();
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSimulated(false);

    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch('/api/analyze-feedback', {
        method: 'POST',
        headers,
      });
      const data: AnalysisResponse = await res.json();

      if (!res.ok || data.error) {
        setError(
          data.error ||
            `AI analysis returned an error (HTTP ${res.status}). Please try again.`
        );
        setSimulated(data.simulated || false);
        return;
      }

      setResult(data);
    } catch {
      setError('Could not reach the AI analysis service. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#161B19] tracking-tight">
            AI Analysis
          </h1>
          <p className="text-xs text-[#53615A] mt-0.5">
            Live OpenRouter analysis of your 20 feedback records. Suggestions require human review and do not change stored priorities.
          </p>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#123D32] text-white text-xs sm:text-sm font-semibold hover:bg-[#0B2822] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#B89B72]" />
          )}
          {loading ? 'Analyzing...' : result ? 'Run Again' : 'Run AI Analysis'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <strong className="text-sm text-rose-800">AI Analysis Failed</strong>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed ml-7">{error}</p>
          {simulated && (
            <p className="text-[11px] text-rose-500 ml-7 italic">
              [Simulated failure for assignment testing.]
            </p>
          )}
          <div className="ml-7">
            <button
              onClick={runAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
          <div className="ml-7 p-3 rounded-lg bg-white border border-rose-200/70 text-xs text-[#53615A]">
            <strong className="text-[#161B19]">App status:</strong> Dashboard, All Feedback, and AI Insights continue working normally.
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-8 rounded-xl bg-white border border-[#DCE4DD] text-center space-y-2.5">
          <Loader2 className="w-6 h-6 text-[#123D32] mx-auto animate-spin" />
          <p className="text-sm font-semibold text-[#161B19]">
            Analyzing feedback records...
          </p>
        </div>
      )}

      {/* Initial Ready State */}
      {!result && !loading && !error && (
        <div className="p-8 rounded-xl bg-white border border-[#DCE4DD] text-center space-y-2">
          <Sparkles className="w-7 h-7 text-[#B89B72] mx-auto" />
          <p className="text-sm font-bold text-[#161B19]">
            Generate Live Priority Suggestions
          </p>
          <p className="text-xs text-[#53615A] max-w-md mx-auto">
            Click <strong>Run AI Analysis</strong> to rank the top 3–5 product issues from your stored feedback.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* AI disclaimer & metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#E8E0D3]/50 border border-[#D5C9B8] text-xs text-[#161B19]">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#8C7350] shrink-0 mt-0.5" />
              <span>{result.disclaimer}</span>
            </div>
            <span className="text-[11px] text-[#53615A] font-mono shrink-0">
              {result.model}
            </span>
          </div>

          {/* Issue cards */}
          <div className="space-y-3">
            {result.issues.map((issue) => {
              const isExpanded = expandedId === issue.rank;
              return (
                <div
                  key={issue.rank}
                  className="p-4 sm:p-5 rounded-xl bg-white border border-[#DCE4DD] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#161B19] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0]">
                        #{issue.rank}
                      </span>
                      <PriorityBadge priority={issue.priority} />
                    </div>

                    {issue.supportingFeedbackIds.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-[#53615A]">
                          Related Feedback:
                        </span>
                        {issue.supportingFeedbackIds.map((fId) => (
                          <Link
                            key={fId}
                            href={`/feedback/${fId}`}
                            className="font-mono font-semibold text-[#123D32] bg-[#EFF3EF] hover:bg-[#DCE4DD] px-2 py-0.5 rounded border border-[#CED9D0] text-[11px] inline-flex items-center gap-0.5"
                          >
                            #{fId} <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#161B19]">{issue.title}</h3>

                  <p className="text-xs text-[#53615A] leading-relaxed">{issue.summary}</p>

                  {/* Expandable Suggested Fix */}
                  <div className="border-t border-[#EFF3EF] pt-2">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : issue.rank)
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#123D32] hover:text-[#0B2822] cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#B89B72]" />
                      <span>Suggested Fix</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {isExpanded && (
                      <p className="mt-2 text-xs text-[#161B19] leading-relaxed bg-[#F8FAF7] border border-[#DCE4DD] p-3 rounded-lg">
                        {issue.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
