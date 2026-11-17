import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Leeg Feedback Intelligence | Executive Product Intelligence',
  description:
    'Internal customer feedback intelligence platform for Leeg to organize member feedback across channels and surface actionable Career OS product decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#F8FAF7] text-[#161B19] flex selection:bg-[#EFF3EF] selection:text-[#123D32]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
