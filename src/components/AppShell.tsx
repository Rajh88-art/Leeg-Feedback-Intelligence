'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/auth');

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#F8FAF7] w-full">{children}</div>;
  }

  return (
    <div className="min-h-full flex flex-1 bg-[#F8FAF7]">
      {/* Executive Forest-Green Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Navbar />
        <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
