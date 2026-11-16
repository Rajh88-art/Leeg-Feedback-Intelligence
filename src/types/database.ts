// Supabase Database Type Definitions
// Matching exact Supabase table schemas

export interface DbSource {
  id: number;
  created_at?: string;
  name: string;
  description?: string | null;
  channel_type?: string | null;
}

export interface DbTheme {
  id: number;
  created_at?: string;
  name: string;
  description?: string | null;
  category?: string | null;
}

export interface DbFeedback {
  id: number;
  created_at?: string;
  source?: string | null;
  content: string;
  theme?: string | null;
  sentiment?: string | null;
  priority?: string | null;
  feedback_date: string;
  summary?: string | null;
  is_flagged?: boolean | null;
  source_id?: number | null;
}

export interface DbFeedbackTheme {
  id: number;
  created_at?: string;
  feedback_id: number;
  theme_id: number;
}

export interface DbAIInsight {
  id: number;
  created_at?: string;
  title: string;
  summary: string;
  insight_type?: string | null;
  priority?: string | null;
  theme_id?: number | null;
  feedback_id?: number | null;
}

// Enriched Frontend Models

export interface EnrichedFeedback {
  id: number;
  content: string;
  summary: string;
  source: string;
  channelType?: string;
  theme: string;
  themeId?: number;
  themes: { id: number; name: string }[];
  sentiment: 'positive' | 'neutral' | 'needs_attention';
  priority: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  isFlagged: boolean;
  sourceId?: number;
}

export interface EnrichedTheme {
  id: number;
  name: string;
  description: string;
  category: string;
  count: number;
  feedbackIds: number[];
  flaggedCount: number;
}

export interface EnrichedAIInsight {
  id: number;
  title: string;
  summary: string;
  insightType: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  themeId?: number;
  themeName: string;
  feedbackId?: number;
  referencedFeedbackIds: number[];
}

export interface DashboardMetrics {
  totalFeedback: number;
  totalThemes: number;
  totalInsights: number;
  flaggedCount: number;
  themes: EnrichedTheme[];
  sources: {
    source: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  recentFeedback: EnrichedFeedback[];
  flaggedFeedback: EnrichedFeedback[];
}
