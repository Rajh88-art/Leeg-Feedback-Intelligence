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
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">
          High Priority
        </span>
      );
    case 'LOW':
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200">
          Low Priority
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
          Medium Priority
        </span>
      );
  }
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles =
    confidence === 'high'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : confidence === 'low'
      ? 'text-slate-500 bg-slate-100 border-slate-200'
      : 'text-blue-700 bg-blue-50 border-blue-200';
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
    } catch (err: any) {
      setError('Could not reach the AI analysis service. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Live AI Analysis
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">
              nvidia/nemotron-3-ultra via OpenRouter
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Feedback Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Run a <strong>live AI analysis</strong> of your Supabase feedback records. The model
            identifies the most important product issues, explains its reasoning, and recommends
            actions — using only the actual feedback data stored in your database.
          </p>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-300" />
          )}
          {loading ? 'Analyzing…' : result ? 'Re-run Analysis' : 'Run AI Analysis'}
        </button>
      </div>

      {/* Important distinction notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200/70">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 leading-relaxed">
          <strong>Live AI Output ≠ Stored AI Insights.</strong> This feature calls the{' '}
          <strong>Nemotron model on OpenRouter in real time</strong>. Results are generated fresh
          each time and are not stored. The &ldquo;AI Insights&rdquo; page shows pre-generated records
          from the Supabase database — these are different.
        </div>
      </div>

      {/* How it works */}
      {!result && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Database,
              title: '1. Retrieves Real Data',
              desc: 'Your 20 Supabase Feedback records are fetched server-side using your authenticated session and RLS policies.',
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              icon: Sparkles,
              title: '2. Sends to AI Model',
              desc: 'A controlled prompt containing only feedback IDs, sources, themes, and content — no PII — is sent to the Nemotron model.',
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              icon: CheckCircle2,
              title: '3. Validates Response',
              desc: 'The server validates all feedback IDs, enforces HIGH/MEDIUM/LOW priority, strips invented evidence, and returns structured results.',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
          ].map((step) => (
            <div
              key={step.title}
              className="p-4 rounded-xl bg-white border border-slate-200/90 space-y-2"
            >
              <div className={`w-8 h-8 rounded-lg ${step.bg} flex items-center justify-center`}>
                <step.icon className={`w-4 h-4 ${step.color}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
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
          <div className="ml-7 p-3 rounded-lg bg-white border border-rose-200/70 text-xs text-slate-600">
            <strong className="text-slate-700">Graceful recovery:</strong> Dashboard, Feedback
            Explorer, and AI Insights all continue to work normally. Only this live analysis
            feature is affected. Your stored Supabase data is unchanged.
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 mx-auto animate-spin" />
            <p className="text-sm font-semibold text-slate-700">
              AI is analyzing your feedback records…
            </p>
            <p className="text-xs text-slate-400">
              Calling Nemotron model on OpenRouter. This may take 10–30 seconds on the free tier.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <strong>{result.recordsAnalyzed}</strong> records analyzed
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Model: <code className="font-mono text-purple-700">{result.model}</code>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Generated: {new Date(result.generatedAt).toLocaleString()}
            </span>
          </div>

          {/* AI disclaimer */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200/70">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>AI Disclaimer:</strong> {result.disclaimer}
            </p>
          </div>

          {/* Issue cards */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              {result.issues.length} Prioritized Issues Identified
            </h2>
            <div className="space-y-4">
              {result.issues.map((issue) => (
                <div
                  key={issue.rank}
                  className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        #{issue.rank}
                      </span>
                      <PriorityBadge priority={issue.priority} />
                      <ConfidenceBadge confidence={issue.confidence} />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>

                  <p className="text-xs text-slate-700 leading-relaxed">{issue.summary}</p>

                  {/* Expandable recommendation */}
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === issue.rank ? null : issue.rank)
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Product Recommendation
                      {expandedId === issue.rank ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {expandedId === issue.rank && (
                      <p className="mt-2 text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        {issue.recommendation}
                      </p>
                    )}
                  </div>

                  {/* Supporting evidence links */}
                  {issue.supportingFeedbackIds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Supporting Evidence:
                      </span>
                      {issue.supportingFeedbackIds.map((fId) => (
                        <Link
                          key={fId}
                          href={`/feedback/${fId}`}
                          className="font-mono font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200/60 text-[11px] transition-colors inline-flex items-center gap-0.5"
                        >
                          #{fId} <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prompt reference for assignment */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Assignment Reference
            </p>
            <p className="text-xs text-slate-600">
              The exact prompt sent to the AI model is stored as a named constant:{' '}
              <code className="font-mono text-purple-700 bg-purple-50 px-1 py-0.5 rounded">
                ANALYSIS_PROMPT
              </code>{' '}
              in{' '}
              <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">
                src/lib/ai/prompts.ts
              </code>
              . Copy it directly into your assignment document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
