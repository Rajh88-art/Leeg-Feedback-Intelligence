'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  AlertTriangle,
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

  const descriptionText = isEnriched
    ? (theme as EnrichedTheme).description
    : (theme as ThemeInsight).summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-[#0B2822]/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl border border-[#DCE4DD] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#DCE4DD] bg-[#F8FAF7] flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-[#5C4930] bg-[#E8E0D3]/80 px-2 py-0.5 rounded border border-[#D5C9B8]">
              {linkedRecords.length} {linkedRecords.length === 1 ? 'record' : 'records'}
            </span>
            <h2 className="text-lg font-bold text-[#161B19] mt-1">
              {theme.name}
            </h2>
            {descriptionText && (
              <p className="text-xs text-[#53615A] mt-0.5">{descriptionText}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#53615A] hover:text-[#161B19] hover:bg-[#EFF3EF] transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {linkedRecords.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#DCE4DD] space-y-2"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#161B19]">
                    #{item.id}
                  </span>
                  {item.priority === 'critical' && (
                    <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300 uppercase">
                      Critical
                    </span>
                  )}
                  {item.priority === 'high' && (
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 uppercase">
                      High
                    </span>
                  )}
                  {item.isFlagged && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#5C4930] bg-[#E8E0D3] px-1.5 py-0.5 rounded border border-[#D5C9B8]">
                      <AlertTriangle className="w-3 h-3" />
                      Flagged
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-[#53615A]">{item.source}</span>
              </div>

              <p className="text-xs text-[#161B19] leading-relaxed">
                &ldquo;{item.content.replace(/^"|"$/g, '')}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#53615A]">
                <span>{item.date}</span>
                <Link
                  href={`/feedback/${item.id}`}
                  onClick={onClose}
                  className="font-semibold text-[#123D32] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open record</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
