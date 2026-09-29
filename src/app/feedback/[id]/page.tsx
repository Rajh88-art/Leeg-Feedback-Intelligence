import React from 'react';
import { notFound } from 'next/navigation';
import { feedbackList, getFeedbackById } from '../../../data/feedbackData';
import FeedbackDetailClient from './FeedbackDetailClient';

export function generateStaticParams() {
  return feedbackList.map((item) => ({
    id: item.id,
  }));
}

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getFeedbackById(id);

  if (!item) {
    notFound();
  }

  return <FeedbackDetailClient item={item} />;
}
