'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'high':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      case 'medium':
        return 'bg-[#E8E0D3]/80 text-[#5C4930] border-[#D5C9B8] font-medium';
      default:
        return 'bg-[#EFF3EF] text-[#123D32] border-[#CED9D0] font-medium';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto animate-pulse">
        <div className="h-6 w-36 bg-[#EFF3EF] rounded" />
        <div className="bg-white rounded-xl border border-[#DCE4DD] p-6 space-y-4">
          <div className="h-6 w-56 bg-[#EFF3EF] rounded" />
          <div className="h-24 bg-[#F8FAF7] rounded-lg" />
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123D32] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Feedback
        </Link>
        <div className="bg-white rounded-xl border border-[#DCE4DD] p-10 text-center space-y-3">
          <h2 className="text-base font-bold text-[#161B19]">Feedback Not Found</h2>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#123D32] text-white text-xs font-semibold"
          >
            Back to All Feedback
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-3xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123D32] hover:text-[#0B2822]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Feedback
        </Link>

        <div className="flex items-center gap-1.5">
          {prevItem && (
            <Link
              href={`/feedback/${prevItem.id}`}
              className="px-2.5 py-1 rounded-md border border-[#DCE4DD] bg-white text-xs font-medium text-[#161B19] hover:bg-[#F8FAF7] flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> #{prevItem.id}
            </Link>
          )}
          {nextItem && (
            <Link
              href={`/feedback/${nextItem.id}`}
              className="px-2.5 py-1 rounded-md border border-[#DCE4DD] bg-white text-xs font-medium text-[#161B19] hover:bg-[#F8FAF7] flex items-center gap-1"
            >
              #{nextItem.id} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-[#DCE4DD] p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap border-b border-[#EFF3EF] pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#161B19] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0]">
                #{item.id}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getPriorityBadge(
                  item.priority
                )}`}
              >
                {item.priority}
              </span>
              {item.isFlagged && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#5C4930] bg-[#E8E0D3] px-2 py-0.5 rounded border border-[#D5C9B8]">
                  <AlertTriangle className="w-3 h-3" />
                  Flagged
                </span>
              )}
              <span className="text-xs text-[#53615A]">{item.date}</span>
            </div>

            <button
              type="button"
              onClick={() => openDrilldown(item.theme)}
              className="text-lg font-bold text-[#161B19] hover:text-[#123D32] text-left cursor-pointer"
            >
              {item.theme}
            </button>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#F8FAF7] text-[#53615A] border border-[#DCE4DD]">
            {item.source}
          </span>
        </div>

        {/* Full Feedback Quote */}
        <div className="text-sm text-[#161B19] leading-relaxed border-l-3 border-[#B89B72] bg-[#F8FAF7] p-4 rounded-r-lg">
          &ldquo;{item.content.replace(/^"|"$/g, '')}&rdquo;
        </div>

        {item.summary && item.summary !== item.content && (
          <p className="text-xs text-[#53615A] leading-relaxed">
            <strong className="text-[#161B19]">Summary:</strong> {item.summary}
          </p>
        )}

        {/* Related Feedback in Same Topic */}
        {relatedItems.length > 0 && (
          <div className="pt-3 border-t border-[#EFF3EF] space-y-2">
            <span className="text-xs font-semibold text-[#53615A] block">
              Related Feedback in {item.theme}
            </span>
            <div className="space-y-1.5">
              {relatedItems.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/feedback/${sim.id}`}
                  className="p-2.5 rounded-lg border border-[#DCE4DD] hover:border-[#B89B72] bg-[#F8FAF7] flex items-center justify-between text-xs group"
                >
                  <div className="min-w-0 pr-3 flex items-center gap-2">
                    <span className="font-mono font-bold text-[#161B19] shrink-0">
                      #{sim.id}
                    </span>
                    <span className="text-[#53615A] truncate">
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

      <ThemeDrilldownModal
        theme={drilldownTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbackList={allFeedback}
      />
    </div>
  );
}
