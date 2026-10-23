'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Database,
} from 'lucide-react';
import { fetchFeedbackRecordById, fetchAllFeedbackData } from '@/services/feedbackDbService';
import { EnrichedFeedback, EnrichedTheme } from '@/types/database';
import ThemeDrilldownModal from '../../../components/ThemeDrilldownModal';

// Also try legacy static data for old FB-NNN ids
import { getFeedbackById } from '../../../data/feedbackData';

interface FeedbackDetailClientProps {
  id: string;
}

export default function FeedbackDetailClient({ id }: FeedbackDetailClientProps) {
  const [item, setItem] = useState<EnrichedFeedback | null>(null);
  const [allFeedback, setAllFeedback] = useState<EnrichedFeedback[]>([]);
  const [allThemes, setAllThemes] = useState<EnrichedTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [drilldownTheme, setDrilldownTheme] = useState<EnrichedTheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        // Determine numeric ID
        const numericId = parseInt(id.replace(/\D/g, ''), 10);

        const [record, allData] = await Promise.all([
          fetchFeedbackRecordById(isNaN(numericId) ? 1 : numericId),
          fetchAllFeedbackData(),
        ]);

        if (!record) {
          // Try legacy static fallback for FB-NNN ids
          const legacyItem = getFeedbackById(id);
          if (!legacyItem) {
            setNotFound(true);
          } else {
            // Adapt legacy item to EnrichedFeedback shape for rendering
            setItem({
              id: parseInt(legacyItem.id.replace(/\D/g, ''), 10) || 0,
              content: legacyItem.rawQuote || legacyItem.content,
              summary: legacyItem.content,
              source: legacyItem.source,
              channelType: legacyItem.sourceChannelLabel,
              theme: legacyItem.theme,
              themes: [{ id: 0, name: legacyItem.theme }],
              sentiment: legacyItem.sentiment,
              priority: legacyItem.urgency,
              date: legacyItem.date.split('T')[0],
              isFlagged: legacyItem.sentiment === 'needs_attention' && legacyItem.urgency === 'high',
              sourceId: undefined,
            });
          }
        } else {
          setItem(record);
        }

        setAllFeedback(allData.feedback);
        setAllThemes(allData.themes);
      } catch (err) {
        console.error('Failed to load feedback record:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const openDrilldown = (themeName: string) => {
    const found = allThemes.find(
      (t) => t.name.toLowerCase() === themeName.toLowerCase()
    );
    if (found) {
      setDrilldownTheme(found);
      setIsModalOpen(true);
    }
  };

  // Prev/next navigation across all 20 Supabase records
  const currentIndex = item ? allFeedback.findIndex((f) => f.id === item.id) : -1;
  const prevItem = currentIndex > 0 ? allFeedback[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < allFeedback.length - 1
      ? allFeedback[currentIndex + 1]
      : null;

  // Related records — same theme, excluding self
  const relatedItems = item
    ? allFeedback
        .filter(
          (f) =>
            f.id !== item.id &&
            (f.theme === item.theme ||
              f.themes?.some((t) => item.themes?.some((it) => it.id === t.id)))
        )
        .slice(0, 3)
    : [];

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'needs_attention':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/80';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/80';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'Slack': return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Gmail': return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'LinkedIn': return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Instagram': return 'bg-pink-50 text-pink-700 border-pink-200/80';
      case 'User Research':
      case 'User research': return 'bg-violet-50 text-violet-700 border-violet-200/80';
      case 'Product Analytics':
      case 'Product analytics': return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="bg-white rounded-xl border border-slate-200 p-7 space-y-5">
          <div className="h-6 w-64 bg-slate-200 rounded" />
          <div className="h-24 bg-slate-100 rounded-lg" />
          <div className="h-32 bg-slate-100 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Feedback Explorer
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Record Not Found</h2>
          <p className="text-sm text-slate-500">
            Feedback record <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">#{id}</code> does not exist in the database.
          </p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Browse All Records
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Navigation & Controls */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Feedback Explorer
        </Link>

        <div className="flex items-center gap-1.5">
          {prevItem && (
            <Link
              href={`/feedback/${prevItem.id}`}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous (#{prevItem.id})
            </Link>
          )}
          {nextItem && (
            <Link
              href={`/feedback/${nextItem.id}`}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1 transition-colors"
            >
              Next (#{nextItem.id}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Feedback Record Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden space-y-5 p-5 sm:p-7">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
                Feedback #{item.id}
              </span>
              {item.isFlagged && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Flagged Friction
                </span>
              )}
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-xs text-slate-500">{item.date}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {item.theme}
            </h1>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded border self-start ${getSourceBadge(
              item.source
            )}`}
          >
            {item.source}
          </span>
        </div>

        {/* Source & Metadata Row */}
        <div className="flex items-center gap-2.5 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80 flex-wrap">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-800">Source:</span>
            <span className="text-xs text-slate-600">{item.source}</span>
            {item.channelType && (
              <span className="text-[11px] text-slate-400">({item.channelType})</span>
            )}
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                item.priority
              )}`}
            >
              {item.priority} priority
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${getSentimentBadge(
                item.sentiment
              )}`}
            >
              {item.sentiment === 'needs_attention' ? 'Needs Attention' : item.sentiment}
            </span>
          </div>
        </div>

        {/* Original Verbatim Content */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Verbatim Customer Feedback
          </span>
          <div className="text-sm text-slate-800 italic leading-relaxed border-l-2 border-purple-500 bg-slate-50/60 p-4 rounded-r-lg border-y border-r border-slate-200/60 font-serif">
            {item.content}
          </div>
        </div>

        {/* AI Summary / Observation */}
        {item.summary && item.summary !== item.content && (
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Observation Summary
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200/80">
              {item.summary}
            </p>
          </div>
        )}

        {/* AI Intelligence Extraction */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Product Intelligence Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-900 block mb-1">Classified Theme</span>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => openDrilldown(item.theme)}
                  className="font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  {item.theme}
                </button>
                {item.themes && item.themes.length > 1 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.themes.slice(1).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openDrilldown(t.name)}
                        className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block mb-1">Record Details</span>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Record ID:</span>
                  <span className="font-mono">#{item.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Date:</span>
                  <span>{item.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Source:</span>
                  <span>{item.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Flagged:</span>
                  <span>{item.isFlagged ? 'Yes – requires triage' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Records — same theme */}
        {relatedItems.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              Related Feedback Records ({relatedItems.length})
            </span>
            <div className="space-y-2">
              {relatedItems.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/feedback/${sim.id}`}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex items-center justify-between text-xs group"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                      Feedback #{sim.id}
                    </span>
                    <span className="text-slate-500 block text-[11px] mt-0.5 italic line-clamp-1">
                      {sim.content.slice(0, 80)}...
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drilldown Modal */}
      <ThemeDrilldownModal
        theme={drilldownTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={allFeedback}
      />
    </div>
  );
}
