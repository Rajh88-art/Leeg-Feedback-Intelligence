'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Info,
  ShieldAlert,
  Lightbulb,
  Clock,
  Database,
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
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-orange-50 text-orange-800 border-orange-200">
          AI-Suggested: High
        </span>
      );
    case 'LOW':
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-[#EFF3EF] text-[#123D32] border-[#CED9D0]">
          AI-Suggested: Low
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200">
          AI-Suggested: Medium
        </span>
      );
  }
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles =
    confidence === 'high'
      ? 'text-[#123D32] bg-[#EFF3EF] border-[#CED9D0]'
      : confidence === 'low'
      ? 'text-[#53615A] bg-[#F8FAF7] border-[#DCE4DD]'
      : 'text-amber-800 bg-amber-50 border-amber-200';
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${styles}`}>
      {confidence} confidence
    </span>
  );
}

export default function AIAnalysisPage() {
  const { session } = useAuth();
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

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
            `AI analysis service returned an error (HTTP ${res.status}). Please try again.`
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCE4DD]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#123D32]" />
              Live OpenRouter AI Generation
            </span>
            <span className="text-[#9BA8A0] text-xs">•</span>
            <span className="text-xs text-[#53615A] font-medium">
              Real-Time Prioritization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161B19] tracking-tight">
            Live AI Feedback Analysis
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="px-3 py-2 rounded-lg bg-[#EFF3EF] border border-[#CED9D0] text-[#123D32] text-xs font-semibold hover:bg-[#E2EBE4] transition-colors cursor-pointer"
          >
            {showMethodology ? 'Hide Methodology' : 'How It Works'}
          </button>

          <button
            onClick={runAnalysis}
            disabled={loading}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#123D32] text-white text-xs sm:text-sm font-semibold hover:bg-[#0B2822] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#A8CBB7]" />
            )}
            {loading ? 'Analyzing...' : result ? 'Re-run Analysis' : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* Concise Distinction Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#EFF3EF] border border-[#CED9D0]">
        <Info className="w-4 h-4 text-[#123D32] shrink-0 mt-0.5" />
        <div className="text-xs text-[#161B19] leading-relaxed">
          <strong>Live AI Output (Requires Human Review):</strong> Clicking{' '}
          <strong>Run AI Analysis</strong> sends your 20 Supabase records to OpenRouter in real time. AI-suggested priorities (`HIGH`, `MEDIUM`, `LOW`) are advisory recommendations and never overwrite stored database priorities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) or `Flagged` markers.
        </div>
      </div>

      {/* Expandable Methodology (Progressive Disclosure) */}
      {showMethodology && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
          {[
            {
              icon: Database,
              title: '1. Verified RLS Data Fetch',
              desc: 'Fetches up to 20 Feedback records server-side using your verified Supabase Auth session. Strips all PII before calling OpenRouter.',
            },
            {
              icon: Sparkles,
              title: '2. One-Off Risk Escalation',
              desc: 'Prompt instructs the model to treat severe privacy/security issues (like Feedback #10) as high priority even when only one record exists.',
            },
            {
              icon: CheckCircle2,
              title: '3. Code-Enforced Validation',
              desc: 'Server code validates JSON, enforces HIGH/MEDIUM/LOW classifications, and strips any invented feedback IDs not in Supabase.',
            },
          ].map((step) => (
            <div
              key={step.title}
              className="p-4 rounded-xl bg-white border border-[#DCE4DD] space-y-1.5"
            >
              <div className="w-7 h-7 rounded-lg bg-[#EFF3EF] text-[#123D32] flex items-center justify-center">
                <step.icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#161B19]">{step.title}</h3>
              <p className="text-xs text-[#53615A] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      )}

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
              [This failure is intentionally simulated for assignment testing purposes.]
            </p>
          )}
          <div className="ml-7 flex items-center gap-3">
            <button
              onClick={runAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
          <div className="ml-7 p-3 rounded-lg bg-white border border-rose-200/70 text-xs text-[#53615A]">
            <strong className="text-[#161B19]">Graceful recovery:</strong> Dashboard, Feedback Explorer, and AI Insights continue to work normally. Your stored Supabase data is unchanged.
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-8 rounded-xl bg-white border border-[#DCE4DD] text-center space-y-3">
          <Loader2 className="w-7 h-7 text-[#123D32] mx-auto animate-spin" />
          <p className="text-sm font-semibold text-[#161B19]">
            Analyzing 20 Supabase feedback records via OpenRouter...
          </p>
          <p className="text-xs text-[#53615A]">
            Validating citations and priority classifications server-side.
          </p>
        </div>
      )}

      {/* Initial Ready State */}
      {!result && !loading && !error && (
        <div className="p-8 rounded-xl bg-white border border-[#DCE4DD] text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#123D32] mx-auto" />
          <div>
            <p className="text-sm font-bold text-[#161B19]">
              Ready to Generate Live Prioritization
            </p>
            <p className="text-xs text-[#53615A] mt-1 max-w-md mx-auto">
              Click <strong>Run AI Analysis</strong> above to query the live OpenRouter model and generate 3–5 prioritized product issues backed by validated feedback IDs.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-5">
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-white border border-[#DCE4DD] text-xs text-[#53615A]">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#123D32]" />
              <strong className="text-[#161B19]">{result.recordsAnalyzed}</strong> records analyzed
            </span>
            <span className="text-[#CED9D0]">|</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#123D32]" />
              Model: <code className="font-mono text-[#123D32] font-semibold">{result.model}</code>
            </span>
            <span className="text-[#CED9D0]">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6F9B86]" />
              {new Date(result.generatedAt).toLocaleString()}
            </span>
          </div>

          {/* AI disclaimer */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>AI Disclaimer:</strong> {result.disclaimer}
            </span>
          </div>

          {/* Issue cards (Concise Summary First + Expandable Recommendation) */}
          <div className="space-y-3.5">
            {result.issues.map((issue) => {
              const isExpanded = expandedId === issue.rank;
              return (
                <div
                  key={issue.rank}
                  className="p-5 rounded-xl bg-white border border-[#DCE4DD] shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-[#161B19] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0]">
                        Rank #{issue.rank}
                      </span>
                      <PriorityBadge priority={issue.priority} />
                      <ConfidenceBadge confidence={issue.confidence} />
                    </div>

                    {/* Supporting evidence links */}
                    {issue.supportingFeedbackIds.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-[#53615A] font-medium">
                          Evidence:
                        </span>
                        {issue.supportingFeedbackIds.map((fId) => (
                          <Link
                            key={fId}
                            href={`/feedback/${fId}`}
                            className="font-mono font-semibold text-[#123D32] bg-[#EFF3EF] hover:bg-[#DCE4DD] px-2 py-0.5 rounded border border-[#CED9D0] text-[11px] transition-colors inline-flex items-center gap-0.5"
                          >
                            #{fId} <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#161B19]">{issue.title}</h3>

                  <p className="text-xs text-[#53615A] leading-relaxed">{issue.summary}</p>

                  {/* Expandable recommendation */}
                  <div className="border-t border-[#EFF3EF] pt-2.5">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : issue.rank)
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#123D32] hover:text-[#0B2822] cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Recommended Product Action</span>
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

          {/* Prompt reference for assignment */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#DCE4DD] text-xs text-[#53615A]">
            <strong>Assignment Prompt Reference:</strong> Stored in{' '}
            <code className="font-mono text-[#123D32] bg-[#EFF3EF] px-1.5 py-0.5 rounded">
              ANALYSIS_PROMPT
            </code>{' '}
            inside{' '}
            <code className="font-mono text-[#161B19] bg-[#EFF3EF] px-1.5 py-0.5 rounded">
              src/lib/ai/prompts.ts
            </code>
            .
          </div>
        </div>
      )}
    </div>
  );
}
