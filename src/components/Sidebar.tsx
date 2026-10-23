'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  FileText,
  Sliders,
  Menu,
  X,
  Layers,
  Circle,
  ExternalLink,
  LogOut,
  User,
} from 'lucide-react';
import LeegLogo from './LeegLogo';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Feedback Explorer',
    href: '/feedback',
    icon: MessageSquare,
    badge: '20 Records',
  },
  {
    name: 'AI Insights',
    href: '/ai-insights',
    icon: Sparkles,
    badge: '7 Themes',
  },
  {
    name: 'Feedback Detail',
    href: '/feedback/1',
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
  { name: 'Slack', count: 'Live' },
  { name: 'Gmail', count: 'Live' },
  { name: 'LinkedIn', count: 'Live' },
  { name: 'Instagram', count: 'Live' },
  { name: 'User Research', count: 'Live' },
  { name: 'Product Analytics', count: 'Live' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/feedback/1') return /^\/feedback\/\d+$/.test(pathname);
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0c111d] border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <LeegLogo size={28} />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-sm tracking-tight">Leeg</span>
            <span className="text-[11px] text-slate-400 font-normal">Feedback Intelligence</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Dark Navy/Charcoal Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c111d] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <LeegLogo size={32} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-sm tracking-tight">Leeg</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 border border-purple-800/50">
                  Intel
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">Career OS Product Platform</p>
            </div>
          </Link>

          {/* Role badge */}
          <div className="mt-3.5 px-2.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium text-slate-300 truncate">VP of Product Workspace</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">v2.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Views
          </div>
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                  active
                    ? 'bg-slate-800/90 text-white font-semibold shadow-2xs relative'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      active
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                        : 'bg-slate-850 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-purple-500 rounded-r" />
                )}
              </Link>
            );
          })}

          {/* Sample Sources List */}
          <div className="pt-6 px-2.5">
            <div className="pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Ingested Channels</span>
              <span className="text-[10px] text-slate-500 font-mono">Sample</span>
            </div>
            <div className="space-y-1 mt-1">
              {sampleSources.map((src) => (
                <div
                  key={src.name}
                  className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-900/40 border border-slate-800/60 text-[11px]"
                >
                  <span className="text-slate-300 truncate">{src.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{src.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Authenticated User Area */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-purple-300 font-semibold text-xs shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-medium text-slate-200 truncate"
                  title={user?.email || 'Authenticated User'}
                >
                  {user?.email || 'vp.product@leeg.ai'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">Active Session</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-850 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="px-3.5 py-2.5 border-t border-slate-850/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="truncate">
              <span className="font-medium text-slate-300 block truncate">Leeg Technologies</span>
              <span className="text-[10px] text-slate-500">Calgary, AB HQ</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500/80" title="System Operational" />
          </div>
        </div>
      </aside>
    </>
  );
}
