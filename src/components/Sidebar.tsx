'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Info,
  Menu,
  X,
  LogOut,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import LeegLogo from './LeegLogo';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'All Feedback',
    href: '/feedback',
    icon: MessageSquare,
  },
  {
    name: 'AI Insights',
    href: '/ai-insights',
    icon: Sparkles,
  },
  {
    name: 'AI Analysis',
    href: '/ai-analysis',
    icon: BrainCircuit,
  },
  {
    name: 'Research',
    href: '/research',
    icon: BookOpen,
  },
  {
    name: 'About',
    href: '/profile',
    icon: Info,
  },
];

const sampleChannels = [
  'Slack',
  'Gmail',
  'LinkedIn',
  'Instagram',
  'User Research',
  'Product Analytics',
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
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
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0B2822] border-b border-[#1A4237] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LeegLogo size={26} />
          <span className="font-semibold text-[#F8FAF7] text-sm tracking-tight">
            Leeg
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-[#B8D1C4] hover:text-white hover:bg-[#123D32] transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#161B19]/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#0B2822] border-r border-[#1A4237] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-[#1A4237]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <LeegLogo size={30} />
            <div className="min-w-0">
              <span className="font-semibold text-[#F8FAF7] text-sm tracking-tight block">
                Leeg
              </span>
              <span className="text-[11px] text-[#B89B72] block truncate">
                Feedback Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all relative ${
                  active
                    ? 'bg-[#123D32] text-[#F8FAF7] font-semibold'
                    : 'text-[#B8D1C4] hover:text-[#F8FAF7] hover:bg-[#123D32]/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#B89B72]' : 'text-[#6F9B86]'
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#B89B72] rounded-r" />
                )}
              </Link>
            );
          })}

          {/* Collapsed Data Sources Subsection */}
          <div className="pt-4 mt-4 border-t border-[#1A4237]">
            <button
              type="button"
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-[#8EB09F] hover:text-[#F8FAF7] transition-colors cursor-pointer"
            >
              <span>Data Sources (Sample)</span>
              {sourcesOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {sourcesOpen && (
              <div className="mt-1 px-2 space-y-1">
                <div className="grid grid-cols-2 gap-1">
                  {sampleChannels.map((name) => (
                    <Link
                      key={name}
                      href={`/feedback?source=${encodeURIComponent(name)}`}
                      onClick={() => setMobileOpen(false)}
                      className="py-1 px-2 rounded bg-[#123D32]/40 hover:bg-[#123D32] text-[10px] text-[#D7E8DF] truncate transition-colors"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
                <p className="text-[10px] text-[#7A9E8D] px-1 pt-1 leading-snug">
                  Sample channels stored in database, not live integrations.
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Signed-in User Area */}
        <div className="p-3 border-t border-[#1A4237] bg-[#081F1A]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#123D32] border border-[#B89B72]/50 flex items-center justify-center text-[#E8E0D3] font-semibold text-xs shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <p
                className="text-xs font-medium text-[#F8FAF7] truncate"
                title={user?.email || 'Signed in'}
              >
                {user?.email || 'Signed in'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-1.5 rounded-lg text-[#8EB09F] hover:text-white hover:bg-[#123D32] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
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
