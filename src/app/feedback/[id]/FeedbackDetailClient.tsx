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
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feedback Explorer
        </Link>

        <div className="flex items-center gap-2">
          {prevItem && (
            <Link
              href={`/feedback/${prevItem.id}`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous ({prevItem.id})
            </Link>
          )}
          {nextItem && (
            <Link
              href={`/feedback/${nextItem.id}`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1"
            >
              Next ({nextItem.id}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Feedback Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-6 p-6 sm:p-8">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {item.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                {item.careerProductArea}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                {new Date(item.date).toLocaleDateString('en-CA', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.title}
            </h1>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 self-start">
            {item.source}
          </span>
        </div>

        {/* Member Profile */}
        <div className="flex items-center gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <img
            src={item.author.avatar}
            alt={item.author.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
          <div>
            <span className="text-sm font-bold text-slate-900 block">{item.author.name}</span>
            <span className="text-xs text-slate-500">
              {item.author.role} • {item.author.location}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Source: {item.sourceChannelLabel}
            </span>
          </div>
        </div>

        {/* Original Quote */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Original Member Quote
          </span>
          <p className="text-base text-slate-800 italic font-serif leading-relaxed bg-purple-50/30 p-5 rounded-2xl border border-purple-100/70">
            {item.rawQuote}
          </p>
        </div>

        {/* Processed Context */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Detailed Summary
          </span>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            {item.content}
          </p>
        </div>

        {/* AI Insight Card */}
        <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Product Intelligence Takeaway</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-purple-900 block mb-1">Identified User Need / Goal</span>
              <p className="text-purple-950 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-purple-100">
                "{item.userGoal}"
              </p>
            </div>

            <div>
              <span className="font-bold text-purple-900 block mb-1">Suggested Product Next Step</span>
              <p className="text-purple-950 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-purple-100">
                {item.aiTakeaway}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              onClick={() => openDrilldown(item.theme)}
              className="font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Theme: {item.theme} (View all related quotes)</span>
            </button>
          </div>
        </div>

        {/* Related Quotes */}
        {similarItems.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Similar Member Feedback Quotes ({similarItems.length})
            </span>
            <div className="space-y-2">
              {similarItems.map((sim: any) => (
                <Link
                  key={sim.id}
                  href={`/feedback/${sim.id}`}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-purple-300 hover:bg-slate-50/70 transition-all flex items-center justify-between text-xs block group"
                >
                  <div>
                    <span className="font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                      {sim.title}
                    </span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      {sim.author.name} ({sim.author.role}) • {sim.source}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
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
