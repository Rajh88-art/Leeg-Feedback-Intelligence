import React from 'react';
import { notFound } from 'next/navigation';
import FeedbackDetailClient from './FeedbackDetailClient';

// Support numeric IDs 1-20 from Supabase
// Also preserve legacy string IDs like FB-201 for backwards compatibility
export function generateStaticParams() {
  const numericIds = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
  const legacyIds = [
    'FB-201', 'FB-202', 'FB-203', 'FB-204', 'FB-205',
    'FB-206', 'FB-207', 'FB-208', 'FB-209', 'FB-210',
    'FB-211', 'FB-212',
  ].map((id) => ({ id }));
  return [...numericIds, ...legacyIds];
}

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FeedbackDetailClient id={id} />;
}
