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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
              AI Intelligence Synthesis
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium">Concept Validation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Customer Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Automated semantic clustering, cross-channel pattern detection, and strategic product focus areas across Leeg's Career Operating System.
          </p>
        </div>

        <button
          onClick={() => openThemeModal(themeInsights[0])}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all shadow-xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Interactive Sample Modal</span>
        </button>
      </div>

      {/* Executive Briefing Card (Clean, understated styling) */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs border-l-4 border-l-purple-600 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Executive Member Voice Digest • VP of Product Briefing</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          High Candidate Momentum Around AI Mock Interviews; Mobile Friction Emerges
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          Across 48 recent member touchpoints, candidate satisfaction is highest around the <strong>AI Interview Coach</strong> and <strong>Job Application Kanban</strong>. The primary product friction point to address next is <strong>Safari mobile audio lag</strong> during mock interviews, followed by member requests for <strong>Canadian regional salary data (Calgary/Vancouver)</strong> and <strong>transparent resume scoring explanations</strong>.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Recurring Themes & Product Focus Areas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any theme card to open the exact supporting quotes from job seekers and mentors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themeInsights.map((theme) => (
            <div
              key={theme.id}
              onClick={() => openThemeModal(theme)}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                    {theme.careerProductArea}
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                    {theme.count} quotes
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors mb-1.5 leading-snug">
                  {theme.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {theme.summary}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 mb-3 text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-0.5">Core User Goal:</span>
                  <span className="italic">"{theme.coreUserGoal}"</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[170px]">
                  {theme.trendLabel}
                </span>
                <span className="font-semibold text-purple-600 group-hover:underline flex items-center gap-0.5 shrink-0">
                  Inspect evidence <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Channel Grouped Similar Feedback */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-purple-600" />
            <span>Cross-Channel Converging Feedback Patterns</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrating how Leeg connects isolated feedback from Slack, Gmail, user interviews, and social DMs into cohesive root causes.
          </p>
        </div>

        <div className="space-y-3.5">
          {similarClusters.map((cluster) => {
            const matchingTheme = themeInsights.find((t) => t.id === cluster.themeId);
            return (
              <div
                key={cluster.id}
                className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[11px] font-semibold text-purple-700">
                      Theme: {cluster.themeName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {cluster.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium self-start sm:self-auto">
                    Converging from: {cluster.sources.join(' + ')}
                  </span>
                </div>

                {/* Comparative Quotes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cluster.quotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 italic leading-relaxed"
                    >
                      {q}
                    </div>
                  ))}
                </div>

                {/* Synthesis takeaway */}
                <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-200 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-900">Product Synthesis: </span>
                    <span className="text-slate-700">{cluster.aiSynthesis}</span>
                  </div>

                  {matchingTheme && (
                    <button
                      onClick={() => openThemeModal(matchingTheme)}
                      className="shrink-0 px-3 py-1 rounded-md bg-slate-900 text-white font-medium text-[11px] hover:bg-slate-800 transition-colors self-start sm:self-auto"
                    >
                      Inspect All {matchingTheme.count} Quotes
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
