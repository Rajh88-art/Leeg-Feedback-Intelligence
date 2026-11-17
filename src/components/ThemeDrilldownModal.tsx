'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  MessageSquare,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { EnrichedTheme, EnrichedFeedback } from '../types/database';
import { ThemeInsight } from '../types/feedback';
import { getFeedbackByIds } from '../data/feedbackData';

interface ThemeDrilldownModalProps {
  theme: EnrichedTheme | ThemeInsight | null;
  isOpen: boolean;
  onClose: () => void;
  feedbackList?: EnrichedFeedback[];
}

export default function ThemeDrilldownModal({
  theme,
  isOpen,
  onClose,
  feedbackList = [],
}: ThemeDrilldownModalProps) {
  if (!isOpen || !theme) return null;

  const isEnriched = 'category' in theme && typeof theme.id === 'number';

  let linkedRecords: {
    id: string | number;
    content: string;
    source: string;
    date: string;
    sentiment: string;
    priority?: string;
    isFlagged?: boolean;
  }[] = [];

  if (isEnriched) {
    const enrichedTheme = theme as EnrichedTheme;
    linkedRecords = feedbackList
      .filter(
        (f) =>
          enrichedTheme.feedbackIds.includes(f.id) ||
          f.theme === enrichedTheme.name ||
          f.themes?.some((t) => t.id === enrichedTheme.id)
      )
      .map((f) => ({
        id: f.id,
        content: f.content,
        source: f.source,
        date: f.date,
        sentiment: f.sentiment,
        priority: f.priority,
        isFlagged: f.isFlagged,
      }));
  } else {
    const legacyTheme = theme as ThemeInsight;
    const legacyItems = getFeedbackByIds(legacyTheme.feedbackIds || []);
    linkedRecords = legacyItems.map((l) => ({
      id: l.id,
      content: l.rawQuote || l.content,
      source: l.source,
      date: l.date.split('T')[0],
      sentiment: l.sentiment,
      priority: l.urgency,
      isFlagged: l.sentiment === 'needs_attention' && l.urgency === 'high',
    }));
  }

  const categoryLabel = isEnriched
    ? (theme as EnrichedTheme).category || 'Product Theme'
    : (theme as ThemeInsight).careerProductArea || 'Product Area';

  const descriptionText = isEnriched
    ? (theme as EnrichedTheme).description
    : (theme as ThemeInsight).summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B2822]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl border border-[#DCE4DD] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#DCE4DD] bg-[#F8FAF7] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0] flex items-center gap-1">
                <Database className="w-3 h-3" />
                {categoryLabel}
              </span>
              <span className="text-xs text-[#53615A] font-medium">
                {linkedRecords.length} Linked Customer{' '}
                {linkedRecords.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#161B19] tracking-tight">
              {theme.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#53615A] hover:text-[#161B19] hover:bg-[#EFF3EF] transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="p-3.5 rounded-xl bg-[#EFF3EF] border border-[#DCE4DD]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#123D32] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Theme Scope</span>
            </div>
            <p className="text-xs sm:text-sm text-[#161B19] leading-relaxed">
              {descriptionText}
            </p>
          </div>

          {/* Verbatim Evidence Records */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#53615A] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#123D32]" />
                <span>Supporting Verbatim Evidence ({linkedRecords.length})</span>
              </h3>
            </div>

            {linkedRecords.length === 0 ? (
              <div className="p-6 text-center bg-[#F8FAF7] rounded-xl border border-[#DCE4DD] text-xs text-[#53615A]">
                No matching feedback records found for this theme.
              </div>
            ) : (
              <div className="space-y-2.5">
                {linkedRecords.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white border border-[#DCE4DD] hover:border-[#6F9B86] transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-[#161B19] bg-[#EFF3EF] px-2 py-0.5 rounded border border-[#CED9D0]">
                          Feedback #{item.id}
                        </span>
                        {item.isFlagged && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Flagged
                          </span>
                        )}
                        {item.priority === 'critical' && (
                          <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300 uppercase">
                            Critical Priority
                          </span>
                        )}
                        {item.priority === 'high' && (
                          <span className="text-[10px] font-semibold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 uppercase">
                            High Priority
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-[#F8FAF7] text-[#161B19] border-[#DCE4DD]">
                        {item.source}
                      </span>
                    </div>

                    <div className="text-xs text-[#161B19] italic leading-relaxed border-l-2 border-[#123D32] pl-3 py-1 bg-[#F8FAF7] rounded-r">
                      &ldquo;{item.content.replace(/^"|"$/g, '')}&rdquo;
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#53615A]">
                      <span>Recorded: {item.date}</span>
                      <Link
                        href={`/feedback/${item.id}`}
                        onClick={onClose}
                        className="font-semibold text-[#123D32] hover:underline flex items-center gap-1"
                      >
                        <span>Open full record</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE4DD] bg-[#F8FAF7] flex items-center justify-between">
          <span className="text-xs text-[#53615A]">
            Records retrieved from Supabase
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0B2822] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
