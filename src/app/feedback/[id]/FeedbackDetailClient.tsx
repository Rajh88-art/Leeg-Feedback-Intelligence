'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { FeedbackItem } from '../../../types/feedback';
import { feedbackList, themeInsights, getFeedbackById } from '../../../data/feedbackData';
import ThemeDrilldownModal from '../../../components/ThemeDrilldownModal';

interface FeedbackDetailClientProps {
  item: FeedbackItem;
}

export default function FeedbackDetailClient({ item }: FeedbackDetailClientProps) {
  const [drilldownTheme, setDrilldownTheme] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentIndex = feedbackList.findIndex((f) => f.id === item.id);
  const prevItem = currentIndex > 0 ? feedbackList[currentIndex - 1] : null;
  const nextItem =
    currentIndex < feedbackList.length - 1 ? feedbackList[currentIndex + 1] : null;

  const similarItems = (item.similarItemIds || [])
    .map((id) => getFeedbackById(id))
    .filter(Boolean);

  const openDrilldown = (themeName: string) => {
    const found = themeInsights.find(
      (t) => t.name.toLowerCase() === themeName.toLowerCase()
    );
    if (found) {
      setDrilldownTheme(found);
      setIsModalOpen(true);
    }
  };

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
              <ChevronLeft className="w-3.5 h-3.5" /> Previous ({prevItem.id})
            </Link>
          )}
          {nextItem && (
            <Link
              href={`/feedback/${nextItem.id}`}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1 transition-colors"
            >
              Next ({nextItem.id}) <ChevronRight className="w-3.5 h-3.5" />
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
              <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
                {item.id}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60">
                {item.careerProductArea}
              </span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-xs text-slate-500">
                {new Date(item.date).toLocaleDateString('en-CA', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {item.title}
            </h1>
          </div>

          <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200/60 self-start">
            {item.source}
          </span>
        </div>

        {/* Member Profile */}
        <div className="flex items-center gap-3.5 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <img
            src={item.author.avatar}
            alt={item.author.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">{item.author.name}</span>
            <span className="text-xs text-slate-500">
              {item.author.role} • {item.author.location}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Source: {item.sourceChannelLabel}
            </span>
          </div>
        </div>

        {/* Original Verbatim Quote */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Verbatim Member Transcript
          </span>
          <div className="text-sm text-slate-800 italic leading-relaxed border-l-2 border-purple-500 bg-slate-50/60 p-4 rounded-r-lg border-y border-r border-slate-200/60 font-serif">
            {item.rawQuote}
          </div>
        </div>

        {/* Processed Context */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Observation Summary
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200/80">
            {item.content}
          </p>
        </div>

        {/* AI Intelligence Extraction */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Product Intelligence Extraction</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-900 block mb-1">Identified User Need / Goal</span>
              <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                "{item.userGoal}"
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block mb-1">Suggested Product Next Step</span>
              <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {item.aiTakeaway}
              </p>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={() => openDrilldown(item.theme)}
              className="font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Theme: {item.theme} (View all related quotes)</span>
            </button>
          </div>
        </div>

        {/* Related Quotes */}
        {similarItems.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              Related Member Feedback Quotes ({similarItems.length})
            </span>
            <div className="space-y-2">
              {similarItems.map((sim: any) => (
                <Link
                  key={sim.id}
                  href={`/feedback/${sim.id}`}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex items-center justify-between text-xs block group"
                >
                  <div>
                    <span className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                      {sim.title}
                    </span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      {sim.author.name} ({sim.author.role}) • {sim.source}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-transform" />
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
      />
    </div>
  );
}
