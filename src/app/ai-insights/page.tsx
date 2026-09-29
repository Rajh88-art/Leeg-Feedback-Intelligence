'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ChevronRight,
  GitMerge,
  AlertCircle,
  Lightbulb,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { themeInsights, feedbackList } from '../../data/feedbackData';
import { ThemeInsight } from '../../types/feedback';
import ThemeDrilldownModal from '../../components/ThemeDrilldownModal';

export default function AIInsightsPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeInsight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openThemeModal = (theme: ThemeInsight) => {
    setSelectedTheme(theme);
    setIsModalOpen(true);
  };

  // Grouped similar feedback examples across siloed channels
  const similarClusters = [
    {
      id: 'cluster-1',
      title: 'Mobile Audio Latency on Safari During Mock Interviews',
      themeName: 'AI Interview Practice & Voice Feedback',
      themeId: 'theme-1',
      sources: ['Slack Community', 'User Research Call'],
      quotes: [
        'Maya Lin (Slack): "There was an annoying audio lag on Safari mobile where the transcript paused before scoring my pace."',
        'Marcus Chen (Slack): "Behavioral feedback is solid, but audio responses sometimes hitch on mobile."',
      ],
      aiSynthesis:
        'Members are increasingly practicing mock behavioral interviews on their smartphones during lunch breaks. Safari mobile requires an optimized audio buffer so the recording stream does not hitch before generating pace feedback.',
    },
    {
      id: 'cluster-2',
      title: 'Desire for Localized Western Canadian Tech Salary Benchmarks',
      themeName: 'Localized Salary & Skill Benchmarks',
      themeId: 'theme-5',
      sources: ['User Interview', 'Instagram DM'],
      quotes: [
        'Alistair Ross (User Interview): "In Calgary, local tech compensation is different from Silicon Valley. Having local YYC benchmarks would help in negotiations."',
        'Talia Morissette (Instagram): "The career roadmap is great, would love to see Canadian remote compensation ranges."',
      ],
      aiSynthesis:
        'Users in Alberta and Western Canada find US-skewed salary ranges less useful for local employer negotiations. Adding city-level filters (Calgary, Vancouver, Toronto) will directly increase career roadmap credibility.',
    },
    {
      id: 'cluster-3',
      title: 'Confusion When Resume Score Changes Without Explanation',
      themeName: 'Resume Scoring & Keyword Explanations',
      themeId: 'theme-2',
      sources: ['Support Email', 'Product Telemetry'],
      quotes: [
        'Julian Vance (Gmail): "Just added my new AWS cert, but my ATS target score actually dipped. Is there an explanation breakdown?"',
        'Elena Rostova (Telemetry): "User repeatedly edited skills section after match score decreased by 8%."',
      ],
      aiSynthesis:
        'When algorithm updates or bullet length adjustments inadvertently reduce a user\'s ATS percentage, users feel penalized. A simple "Score Explanation" drawer will prevent user frustration.',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              AI Synthesis
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">Concept Validation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Customer Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Automated theme extraction, trend momentum, and grouped member voice across Leeg's Career Operating System.
          </p>
        </div>

        <button
          onClick={() => openThemeModal(themeInsights[0])}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all shadow-xs self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Interactive Drilldown Sample</span>
        </button>
      </div>

      {/* AI Executive Digest Card */}
      <div className="p-8 rounded-3xl bg-white border border-purple-200/80 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Weekly Career OS Member Voice Digest</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          High Enthusiasm for AI Mock Interviews & Kanban Pipeline
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Across 48 recent member touchpoints, candidate satisfaction is highest around the <strong>AI Interview Coach</strong> and <strong>Job Application Kanban</strong>. The primary product friction point to address next is <strong>Safari mobile audio lag</strong> during mock interviews, followed by member requests for <strong>Canadian regional salary data (Calgary/Vancouver)</strong> and <strong>transparent resume scoring explanations</strong>.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Recurring Themes & Product Areas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any theme card to open the exact supporting quotes from job seekers and mentors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themeInsights.map((theme) => (
            <div
              key={theme.id}
              onClick={() => openThemeModal(theme)}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {theme.careerProductArea}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {theme.count} quotes
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2 leading-snug">
                  {theme.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {theme.summary}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Core User Goal:</span>
                  <span className="italic">"{theme.coreUserGoal}"</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {theme.trendLabel}
                </span>
                <span className="font-bold text-purple-600 group-hover:underline flex items-center gap-1">
                  View evidence <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grouped Similar Feedback Across Channels */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-purple-600" />
            <span>Grouped Similar Feedback Across Disparate Channels</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrating how Leeg connects isolated feedback from Slack, Gmail, user interviews, and social DMs.
          </p>
        </div>

        <div className="space-y-4">
          {similarClusters.map((cluster) => {
            const matchingTheme = themeInsights.find((t) => t.id === cluster.themeId);
            return (
              <div
                key={cluster.id}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-purple-600">
                      Theme: {cluster.themeName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {cluster.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium self-start sm:self-auto">
                    Synthesized from: {cluster.sources.join(' + ')}
                  </span>
                </div>

                {/* Quotes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cluster.quotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic font-serif leading-relaxed"
                    >
                      {q}
                    </div>
                  ))}
                </div>

                {/* Synthesis takeaway */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-purple-900">Product Synthesis: </span>
                    <span>{cluster.aiSynthesis}</span>
                  </div>

                  {matchingTheme && (
                    <button
                      onClick={() => openThemeModal(matchingTheme)}
                      className="shrink-0 px-4 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors self-start sm:self-auto"
                    >
                      Inspect Theme Quotes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drilldown Modal */}
      <ThemeDrilldownModal
        theme={selectedTheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
