export type FeedbackSource =
  | 'Slack'
  | 'Gmail'
  | 'LinkedIn'
  | 'Instagram'
  | 'User research'
  | 'Product analytics';

export type SentimentType = 'positive' | 'neutral' | 'needs_attention';

export type UrgencyLevel = 'high' | 'medium' | 'low';

export type CareerProductArea =
  | 'AI Interview Coach'
  | 'Resume & Portfolio'
  | 'Mentor Matching'
  | 'Job Application Tracker'
  | 'Career Pathways & Benchmarks'
  | 'Networking & Coffee Chats';

export interface AuthorInfo {
  name: string;
  role: string; // e.g. "Career Switcher", "Junior Software Developer", "Senior Product Designer", "Tech Mentor"
  location?: string;
  avatar?: string;
}

export interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  rawQuote: string;
  source: FeedbackSource;
  sourceChannelLabel: string; // e.g. "Sample Slack #member-feedback", "Sample LinkedIn Post"
  author: AuthorInfo;
  date: string; // ISO string
  careerProductArea: CareerProductArea;
  theme: string;
  sentiment: SentimentType;
  urgency: UrgencyLevel;
  userGoal: string; // The user's core career goal / need
  aiTakeaway: string; // Concise product suggestion
  similarItemIds?: string[];
}

export interface ThemeInsight {
  id: string;
  name: string;
  category: 'recurring_theme' | 'emerging_issue' | 'feature_wish';
  count: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    needs_attention: number;
  };
  careerProductArea: CareerProductArea;
  summary: string;
  coreUserGoal: string;
  recommendedNextStep: string;
  feedbackIds: string[];
  trendLabel: string;
}

export interface EmergingTheme {
  id: string;
  title: string;
  theme: string;
  sourceHighlight: string;
  userObservation: string;
  suggestedFocus: string;
  feedbackIds: string[];
}
