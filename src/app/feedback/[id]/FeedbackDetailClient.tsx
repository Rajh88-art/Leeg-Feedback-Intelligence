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
  Database,
} from 'lucide-react';
import { fetchFeedbackRecordById, fetchAllFeedbackData } from '@/services/feedbackDbService';
import { EnrichedFeedback, EnrichedTheme } from '@/types/database';
import ThemeDrilldownModal from '../../../components/ThemeDrilldownModal';
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

        const numericId = parseInt(id.replace(/\D/g, ''), 10);

        const [record, allData] = await Promise.all([
          fetchFeedbackRecordById(isNaN(numericId) ? 1 : numericId),
          fetchAllFeedbackData(),
        ]);

        if (!record) {
          const legacyItem = getFeedbackById(id);
          if (!legacyItem) {
            setNotFound(true);
          } else {
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
              isFlagged:
                legacyItem.sentiment === 'needs_attention' &&
                legacyItem.urgency === 'high',
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

  const currentIndex = item ? allFeedback.findIndex((f) => f.id === item.id) : -1;
  const prevItem = currentIndex > 0 ? allFeedback[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < allFeedback.length - 1
      ? allFeedback[currentIndex + 1]
      : null;

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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'needs_attention':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-[#F8FAF7] text-[#53615A] border-[#DCE4DD]';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'high':
        return 'bg-orange-50 text-orange-800 border-orange-200 font-semibold';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      default:
        return 'bg-[#EFF3EF] text-[#123D32] border-[#CED9D0] font-medium';
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-[#EFF3EF] rounded" />
        <div className="bg-white rounded-xl border border-[#DCE4DD] p-7 space-y-5">
          <div className="h-6 w-64 bg-[#EFF3EF] rounded" />
          <div className="h-24 bg-[#F8FAF7] rounded-lg" />
          <div className="h-24 bg-[#F8FAF7] rounded-lg" />
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123D32] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Feedback Explorer
        </Link>
        <div className="bg-white rounded-xl border border-[#DCE4DD] p-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-[#161B19]">Record Not Found</h2>
          <p className="text-sm text-[#53615A]">
            Feedback record{' '}
            <code className="font-mono bg-[#EFF3EF] px-1.5 py-0.5 rounded">
              #{id}
            </code>{' '}
            was not found or your session has expired.
          </p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors"
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
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#DCE4DD]">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123D32] hover:text-[#0B2822] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Feedback Explorer
        </Link>

        <div className="flex items-center gap-1.5">
          {prevItem && (
            <Link
              href={`/feedback/${prevItem.id}`}
              className="px-2.5 py-1 rounded-md border border-[#DCE4DD] bg-white text-xs font-medium text-[#161B19] hover:bg-[#EFF3EF] flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> #{prevItem.id}
            </Link>
          )}
          {nextItem && (
            <Link
              href={`/feedback/${nextItem.id}`}
              className="px-2.5 py-1 rounded-md border border-[#DCE4DD] bg-white text-xs font-medium text-[#161B19] hover:bg-[#EFF3EF] flex items-center gap-1 transition-colors"
            >
              #{nextItem.id} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Feedback Record Card */}
      <div className="bg-white rounded-xl border border-[#DCE4DD] shadow-2xs overflow-hidden space-y-5 p-5 sm:p-7">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#EFF3EF] pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#161B19] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0]">
                Feedback #{item.id}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                  item.priority
                )}`}
              >
                {item.priority} Priority (Stored)
              </span>
              {item.isFlagged && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Flagged for Review
                </span>
              )}
              <span className="text-[#9BA8A0] text-xs">•</span>
              <span className="text-xs text-[#53615A]">{item.date}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#161B19] tracking-tight">
              {item.theme}
            </h1>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0] self-start">
            {item.source}
          </span>
        </div>

        {/* Original Verbatim Content */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#53615A] block mb-1.5">
            Verbatim Customer Quote
          </span>
          <div className="text-sm text-[#161B19] italic leading-relaxed border-l-3 border-[#123D32] bg-[#F8FAF7] p-4 rounded-r-lg border-y border-r border-[#DCE4DD]">
            &ldquo;{item.content.replace(/^"|"$/g, '')}&rdquo;
          </div>
        </div>

        {/* Summary */}
        {item.summary && item.summary !== item.content && (
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#53615A] block mb-1.5">
              Concise Summary
            </span>
            <p className="text-xs sm:text-sm text-[#161B19] leading-relaxed bg-[#F8FAF7] p-3.5 rounded-lg border border-[#DCE4DD]">
              {item.summary}
            </p>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="p-4 rounded-xl bg-[#F8FAF7] border border-[#DCE4DD] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-[#161B19] block mb-1">
              Classified Theme (Click to view cluster)
            </span>
            <button
              onClick={() => openDrilldown(item.theme)}
              className="font-semibold text-[#123D32] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#6F9B86] shrink-0" />
              {item.theme}
            </button>
          </div>

          <div className="space-y-1 text-[11px] text-[#53615A]">
            <div className="flex justify-between">
              <span className="font-medium text-[#161B19]">Channel:</span>
              <span>{item.source} (Seeded Example)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-[#161B19]">Sentiment:</span>
              <span className={`px-1.5 py-0.2 rounded border capitalize ${getSentimentBadge(item.sentiment)}`}>
                {item.sentiment === 'needs_attention' ? 'Needs Attention' : item.sentiment}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-[#161B19]">Flagged Marker:</span>
              <span>{item.isFlagged ? 'Yes — Marked for human review' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Related Records — same theme */}
        {relatedItems.length > 0 && (
          <div className="pt-3 border-t border-[#EFF3EF]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#53615A] block mb-2.5">
              Other Records in This Theme ({relatedItems.length})
            </span>
            <div className="space-y-2">
              {relatedItems.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/feedback/${sim.id}`}
                  className="p-3 rounded-lg border border-[#DCE4DD] hover:border-[#123D32] hover:bg-[#F8FAF7] transition-all flex items-center justify-between text-xs group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-mono font-bold text-[#161B19] group-hover:text-[#123D32] transition-colors">
                      Feedback #{sim.id} ({sim.source})
                    </span>
                    <span className="text-[#53615A] block text-[11px] mt-0.5 truncate">
                      {sim.summary || sim.content}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6F9B86] group-hover:text-[#123D32] shrink-0" />
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
