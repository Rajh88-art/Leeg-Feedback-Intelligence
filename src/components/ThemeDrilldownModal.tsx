'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Compass,
  Layers,
} from 'lucide-react';
import { ThemeInsight, FeedbackItem } from '../types/feedback';
import { getFeedbackByIds } from '../data/feedbackData';

interface ThemeDrilldownModalProps {
  theme: ThemeInsight | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeDrilldownModal({
  theme,
  isOpen,
  onClose,
}: ThemeDrilldownModalProps) {
  if (!isOpen || !theme) return null;

  const supportingFeedback: FeedbackItem[] = getFeedbackByIds(theme.feedbackIds);

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'Slack':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Gmail':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'LinkedIn':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Instagram':
        return 'bg-pink-50 text-pink-700 border-pink-200/80';
      case 'User research':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/90 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70">
                {theme.careerProductArea}
              </span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {theme.trendLabel}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{theme.name}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Synthesized Intelligence Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {theme.summary}
            </p>
            <div className="pt-2 border-t border-slate-200/70 text-xs text-slate-600 flex items-start gap-1.5">
              <span className="font-semibold text-slate-900 shrink-0">User Goal:</span>
              <span className="italic">"{theme.coreUserGoal}"</span>
            </div>
          </div>

          {/* Supporting Quotes List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Supporting Customer Records ({supportingFeedback.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Verbatim Member Quotes
              </span>
            </div>

            <div className="space-y-3">
              {supportingFeedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">
                          {item.author.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.author.role} • {item.author.location}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getSourceBadge(
                        item.source
                      )}`}
                    >
                      {item.source}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 italic leading-relaxed border-l-2 border-purple-500 pl-3 py-0.5">
                    "{item.rawQuote.replace(/^"|"$/g, '')}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">
                      Channel: {item.sourceChannelLabel}
                    </span>
                    <Link
                      href={`/feedback/${item.id}`}
                      onClick={onClose}
                      className="font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      Inspect Record <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Customer Voice Evidence • Leeg Product Intelligence</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
