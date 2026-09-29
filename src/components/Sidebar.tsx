'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  FileText,
  Sliders,
  Menu,
  X,
  Compass,
  ArrowUpRight,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Feedback',
    href: '/feedback',
    icon: MessageSquare,
    badge: '12 Quotes',
  },
  {
    name: 'AI Insights',
    href: '/ai-insights',
    icon: Sparkles,
    badge: '6 Themes',
  },
  {
    name: 'Feedback Detail',
    href: '/feedback/FB-201',
    icon: FileText,
    badge: null,
  },
  {
    name: 'Prototype Context',
    href: '/profile',
    icon: Sliders,
    badge: null,
  },
];

const sampleSources = [
  { name: 'Slack Community', count: '18 sample items' },
  { name: 'Member Emails', count: '11 sample items' },
  { name: 'User Interviews', count: '8 sample items' },
  { name: 'LinkedIn DMs', count: '5 sample items' },
  { name: 'Instagram Notes', count: '4 sample items' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/feedback/FB-201') return pathname.startsWith('/feedback/FB-');
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            L
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">Leeg</span>
            <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              Career OS
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
              L
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Leeg</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                  Feedback
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Career OS Intelligence</p>
            </div>
          </Link>

          {/* Prototype disclaimer pill */}
          <div className="mt-4 px-3 py-1.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Discovery Prototype
            </span>
            <span className="text-[10px] text-purple-600 font-semibold">MVP</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-purple-50 text-purple-800 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-purple-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Sample Sources List */}
          <div className="pt-6 px-3">
            <div className="pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Sample Channels</span>
              <span className="text-[10px] font-medium text-slate-400">Synthesized</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              {sampleSources.map((src) => (
                <div
                  key={src.name}
                  className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 border border-slate-100/70"
                >
                  <span className="text-[11px] font-medium text-slate-700 truncate">{src.name}</span>
                  <span className="text-[10px] text-slate-400">{src.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prototype Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Leeg Calgary Team</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Career Development Product MVP</p>
        </div>
      </aside>
    </>
  );
}
