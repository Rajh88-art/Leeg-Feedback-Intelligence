'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Sliders,
  Menu,
  X,
  LogOut,
  BookOpen,
  BrainCircuit,
} from 'lucide-react';
import LeegLogo from './LeegLogo';

// Simplified navigation (Emma's feedback Part 5):
// Removed redundant standalone "Feedback Detail" tab.
// Feedback Explorer (/feedback) acts as the primary entry point and stays highlighted
// when inspecting any individual /feedback/[id] record.
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
    name: 'Live AI Analysis',
    href: '/ai-analysis',
    icon: BrainCircuit,
    badge: 'Live AI',
  },
  {
    name: 'Research Context',
    href: '/research',
    icon: BookOpen,
    badge: 'OpenAlex',
  },
  {
    name: 'Platform Scope',
    href: '/profile',
    icon: Sliders,
    badge: null,
  },
];

const exampleChannels = [
  { name: 'Slack', tag: 'Seeded' },
  { name: 'Gmail', tag: 'Seeded' },
  { name: 'LinkedIn', tag: 'Seeded' },
  { name: 'Instagram', tag: 'Seeded' },
  { name: 'User Research', tag: 'Seeded' },
  { name: 'Product Analytics', tag: 'Seeded' },
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
    if (href === '/feedback') {
      return pathname === '/feedback' || pathname.startsWith('/feedback/');
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0B2822] border-b border-[#1D463B] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <LeegLogo size={28} />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#F8FAF7] text-sm tracking-tight">Leeg</span>
            <span className="text-[11px] text-[#9BBAA9] font-normal">Feedback Intelligence</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-[#9BBAA9] hover:text-white hover:bg-[#123D32] transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#161B19]/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Executive Forest-Green Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B2822] border-r border-[#1A4237] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1A4237]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <LeegLogo size={32} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#F8FAF7] text-sm tracking-tight">Leeg</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#123D32] text-[#A8CBB7] border border-[#265C4D]">
                  Intel
                </span>
              </div>
              <p className="text-[11px] text-[#8EB09F] truncate mt-0.5">Career OS Product Suite</p>
            </div>
          </Link>

          {/* Role badge */}
          <div className="mt-3.5 px-2.5 py-1.5 rounded-md bg-[#123D32]/80 border border-[#1F4E41] text-[11px] text-[#D7E8DF] flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B86]" />
              <span className="font-medium truncate">VP of Product Workspace</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#7A9E8D]">
            Intelligence Views
          </div>
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  active
                    ? 'bg-[#123D32] text-[#F8FAF7] font-semibold shadow-2xs relative border border-[#245A4B]'
                    : 'text-[#A5C2B3] hover:text-[#F8FAF7] hover:bg-[#123D32]/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[#8EB8A3]' : 'text-[#6F9B86] group-hover:text-[#A8CBB7]'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      active
                        ? 'bg-[#0B2822] text-[#A8CBB7] border border-[#296353]'
                        : 'bg-[#123D32]/60 text-[#8EB09F] group-hover:text-[#D7E8DF]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#6F9B86] rounded-r" />
                )}
              </Link>
            );
          })}

          {/* Example Channels List (Part 10 clarity) */}
          <div className="pt-5 px-2.5">
            <div className="pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#7A9E8D] flex items-center justify-between">
              <span>Example Channels</span>
              <span className="text-[9px] text-[#7A9E8D] font-mono">Seeded DB</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {exampleChannels.map((src) => (
                <Link
                  key={src.name}
                  href={`/feedback?source=${encodeURIComponent(src.name)}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-1 px-2 rounded bg-[#123D32]/40 hover:bg-[#123D32]/80 border border-[#1A4237] text-[10px] text-[#B8D1C4] transition-colors truncate"
                  title={`Filter Feedback Explorer by ${src.name} (seeded example source)`}
                >
                  <span className="truncate">{src.name}</span>
                </Link>
              ))}
            </div>
            <p className="text-[10px] text-[#7A9E8D] mt-1.5 leading-snug">
              Channel tags represent seeded example sources in Supabase, not live webhook imports.
            </p>
          </div>
        </div>

        {/* Authenticated User Area */}
        <div className="p-3 border-t border-[#1A4237] bg-[#081F1A]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#123D32] border border-[#2A6353] flex items-center justify-center text-[#D7E8DF] font-semibold text-xs shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-medium text-[#F8FAF7] truncate"
                  title={user?.email || 'Authenticated User'}
                >
                  {user?.email || 'Authenticated User'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#8EB09F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B86] shrink-0" />
                  <span className="truncate">Verified Session</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-1.5 rounded-lg text-[#8EB09F] hover:text-rose-300 hover:bg-[#123D32] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
