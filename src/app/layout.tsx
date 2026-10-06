import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Leeg Feedback Intelligence | Internal Product Intelligence',
  description:
    'Internal customer feedback intelligence platform for Leeg to aggregate member feedback across community channels and surface actionable career product intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f8fafc] text-slate-900 flex selection:bg-purple-100 selection:text-purple-900">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
