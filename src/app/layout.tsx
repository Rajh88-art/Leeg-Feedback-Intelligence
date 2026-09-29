import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Leeg Feedback Intelligence | Career OS Discovery Prototype',
  description:
    'Discovery prototype for Leeg to organize scattered member feedback across Slack, Gmail, LinkedIn, Instagram, user research, and analytics into actionable career product intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f8f9fb] text-slate-900 flex">
        {/* Persistent Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Navbar />
          <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
