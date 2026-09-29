'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Compass,
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
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Gmail':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'LinkedIn':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Instagram':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'User research':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                {theme.careerProductArea}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {theme.trendLabel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {theme.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Summary Card */}
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Synthesized Insight</span>
            </div>
            <p className="text-sm text-purple-950 leading-relaxed font-medium">
              {theme.summary}
            </p>
            <div className="pt-2 border-t border-purple-100/80 text-xs text-purple-800 flex items-start gap-1.5">
              <span className="font-bold shrink-0">User Goal:</span>
              <span>"{theme.coreUserGoal}"</span>
            </div>
          </div>

          {/* Supporting Evidence List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                Original Customer Quotes ({supportingFeedback.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Sample Community & Research Quotes
              </span>
            </div>

            <div className="space-y-4">
              {supportingFeedback.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {item.author.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.author.role} • {item.author.location}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getSourceBadge(
                        item.source
                      )}`}
                    >
                      {item.source}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 italic leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100 font-serif">
                    {item.rawQuote}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 text-[11px]">
                      Channel: {item.sourceChannelLabel}
                    </span>
                    <Link
                      href={`/feedback/${item.id}`}
                      onClick={onClose}
                      className="font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      View full context <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <span>Leeg Career OS Discovery Feedback</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
