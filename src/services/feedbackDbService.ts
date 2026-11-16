import { createClient as createBrowserClient } from '@/lib/supabase/client';
import {
  DbSource,
  DbTheme,
  DbFeedback,
  DbFeedbackTheme,
  DbAIInsight,
  EnrichedFeedback,
  EnrichedTheme,
  EnrichedAIInsight,
  DashboardMetrics,
} from '@/types/database';

const SOURCE_COLORS: Record<string, string> = {
  Slack: '#611f69',
  Gmail: '#ea4335',
  LinkedIn: '#0a66c2',
  Instagram: '#e1306c',
  'User Research': '#7c3aed',
  'Product Analytics': '#0284c7',
  Direct: '#64748b',
};

export async function fetchAllFeedbackData(): Promise<{
  feedback: EnrichedFeedback[];
  themes: EnrichedTheme[];
  sources: DbSource[];
}> {
  const supabase = createBrowserClient();

  const [sourcesRes, themesRes, feedbackRes, ftRes] = await Promise.all([
    supabase.from('Sources').select('*').order('id', { ascending: true }),
    supabase.from('Themes').select('*').order('id', { ascending: true }),
    supabase.from('Feedback').select('*').order('id', { ascending: true }),
    supabase.from('Feedback_Themes').select('*').order('id', { ascending: true }),
  ]);

  if (feedbackRes.error) throw feedbackRes.error;
  if (sourcesRes.error) throw sourcesRes.error;
  if (themesRes.error) throw themesRes.error;

  const sources: DbSource[] = sourcesRes.data || [];
  const themes: DbTheme[] = themesRes.data || [];
  const feedbackRaw: DbFeedback[] = feedbackRes.data || [];
  const feedbackThemes: DbFeedbackTheme[] = ftRes.data || [];

  // Lookup maps
  const sourcesMap = new Map<number, DbSource>();
  sources.forEach((s) => sourcesMap.set(Number(s.id), s));

  const themesMap = new Map<number, DbTheme>();
  themes.forEach((t) => themesMap.set(Number(t.id), t));

  // Map feedback_id -> array of linked Themes
  const fbToThemesMap = new Map<number, { id: number; name: string }[]>();
  feedbackThemes.forEach((ft) => {
    const fId = Number(ft.feedback_id);
    const tId = Number(ft.theme_id);
    const themeObj = themesMap.get(tId);
    if (!fbToThemesMap.has(fId)) {
      fbToThemesMap.set(fId, []);
    }
    if (themeObj) {
      fbToThemesMap.get(fId)!.push({ id: themeObj.id, name: themeObj.name });
    }
  });

  // Map to enriched feedback items
  const feedback: EnrichedFeedback[] = feedbackRaw.map((f) => {
    const fId = Number(f.id);
    const sId = f.source_id ? Number(f.source_id) : undefined;
    const sourceObj = sId ? sourcesMap.get(sId) : undefined;
    const sourceName = sourceObj?.name || f.source || 'Direct';

    const linkedThemes = fbToThemesMap.get(fId) || [];
    const primaryThemeName = linkedThemes[0]?.name || f.theme || 'General Product';
    const primaryThemeId = linkedThemes[0]?.id;

    // Normalizing sentiment
    const rawSent = (f.sentiment || '').toLowerCase();
    let sentiment: 'positive' | 'neutral' | 'needs_attention' = 'neutral';
    if (rawSent.includes('pos') || rawSent === 'positive') sentiment = 'positive';
    else if (
      rawSent.includes('neg') ||
      rawSent.includes('need') ||
      rawSent.includes('attent') ||
      rawSent.includes('frict') ||
      rawSent === 'needs_attention'
    ) {
      sentiment = 'needs_attention';
    }

    // Normalizing priority — preserves 'critical' from Supabase
    const rawPrio = (f.priority || '').toLowerCase();
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    if (rawPrio === 'critical') priority = 'critical';
    else if (rawPrio === 'high' || rawPrio === 'urgent') priority = 'high';
    else if (rawPrio === 'low') priority = 'low';

    return {
      id: fId,
      content: f.content || '',
      summary: f.summary || f.content?.slice(0, 140) || '',
      source: sourceName,
      channelType: sourceObj?.channel_type || undefined,
      theme: primaryThemeName,
      themeId: primaryThemeId,
      themes: linkedThemes,
      sentiment,
      priority,
      date: f.feedback_date || (f.created_at ? f.created_at.split('T')[0] : '2026-09-15'),
      isFlagged: Boolean(f.is_flagged),
      sourceId: sId,
    };
  });

  // Calculate theme stats from actual feedback records
  const enrichedThemes: EnrichedTheme[] = themes.map((t) => {
    const tId = Number(t.id);
    const matchingFb = feedback.filter(
      (f) => f.themes.some((th) => th.id === tId) || f.theme === t.name
    );
    return {
      id: tId,
      name: t.name,
      description: t.description || '',
      category: t.category || 'Theme',
      count: matchingFb.length,
      feedbackIds: matchingFb.map((f) => f.id),
      flaggedCount: matchingFb.filter((f) => f.isFlagged).length,
    };
  });

  return {
    feedback,
    themes: enrichedThemes,
    sources,
  };
}

export async function fetchAIInsightsData(): Promise<{
  insights: EnrichedAIInsight[];
  themes: DbTheme[];
}> {
  const supabase = createBrowserClient();

  // Note exact table name public."AI Insights" WITH A SPACE
  const [insightsRes, themesRes, feedbackRes] = await Promise.all([
    supabase.from('AI Insights').select('*').order('id', { ascending: true }),
    supabase.from('Themes').select('*').order('id', { ascending: true }),
    supabase.from('Feedback').select('id, content, summary, is_flagged, priority'),
  ]);

  if (insightsRes.error) throw insightsRes.error;

  const themes: DbTheme[] = themesRes.data || [];
  const feedbackRaw: any[] = feedbackRes.data || [];
  const insightsRaw: DbAIInsight[] = insightsRes.data || [];

  const themesMap = new Map<number, DbTheme>();
  themes.forEach((t) => themesMap.set(Number(t.id), t));

  const validFeedbackIds = new Set<number>(feedbackRaw.map((f) => Number(f.id)));

  const enrichedInsights: EnrichedAIInsight[] = insightsRaw.map((ins) => {
    const themeObj = ins.theme_id ? themesMap.get(Number(ins.theme_id)) : undefined;

    // Parse explicitly referenced feedback IDs in summary or title (e.g. "Feedback #10", "#4", "Feedback 10")
    const fullText = `${ins.title} ${ins.summary}`;
    const regex = /(?:feedback\s*#?|#)\s*(\d+)/gi;
    const referencedSet = new Set<number>();

    let match: RegExpExecArray | null;
    while ((match = regex.exec(fullText)) !== null) {
      const num = parseInt(match[1], 10);
      if (validFeedbackIds.has(num)) {
        referencedSet.add(num);
      }
    }

    if (ins.feedback_id && validFeedbackIds.has(Number(ins.feedback_id))) {
      referencedSet.add(Number(ins.feedback_id));
    }

    const rawPrio = (ins.priority || '').toLowerCase();
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    if (rawPrio === 'critical') priority = 'critical';
    else if (rawPrio === 'high' || rawPrio === 'urgent') priority = 'high';
    else if (rawPrio === 'low') priority = 'low';

    return {
      id: Number(ins.id),
      title: ins.title,
      summary: ins.summary,
      insightType: ins.insight_type || 'Recurring Pattern',
      priority,
      themeId: ins.theme_id ? Number(ins.theme_id) : undefined,
      themeName: themeObj?.name || 'General Product Theme',
      feedbackId: ins.feedback_id ? Number(ins.feedback_id) : undefined,
      referencedFeedbackIds: Array.from(referencedSet).sort((a, b) => a - b),
    };
  });

  return {
    insights: enrichedInsights,
    themes,
  };
}

export async function fetchFeedbackRecordById(
  id: number | string
): Promise<EnrichedFeedback | null> {
  const supabase = createBrowserClient();

  let numericId =
    typeof id === 'number' ? id : parseInt(id.replace(/\D/g, ''), 10);
  if (isNaN(numericId) || numericId <= 0) {
    numericId = 1;
  }

  const [feedbackRes, sourcesRes, themesRes, ftRes] = await Promise.all([
    supabase.from('Feedback').select('*').eq('id', numericId).single(),
    supabase.from('Sources').select('*'),
    supabase.from('Themes').select('*'),
    supabase.from('Feedback_Themes').select('*').eq('feedback_id', numericId),
  ]);

  if (feedbackRes.error || !feedbackRes.data) return null;

  const f = feedbackRes.data as DbFeedback;
  const sources: DbSource[] = sourcesRes.data || [];
  const themes: DbTheme[] = themesRes.data || [];
  const ft: DbFeedbackTheme[] = ftRes.data || [];

  const sourceObj = sources.find((s) => Number(s.id) === Number(f.source_id));
  const linkedThemes = ft
    .map((item) => themes.find((t) => Number(t.id) === Number(item.theme_id)))
    .filter(Boolean) as DbTheme[];

  const rawSent = (f.sentiment || '').toLowerCase();
  let sentiment: 'positive' | 'neutral' | 'needs_attention' = 'neutral';
  if (rawSent.includes('pos')) sentiment = 'positive';
  else if (
    rawSent.includes('neg') ||
    rawSent.includes('need') ||
    rawSent.includes('attent')
  ) {
    sentiment = 'needs_attention';
  }

  const rawPrio = (f.priority || '').toLowerCase();
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  if (rawPrio === 'critical') priority = 'critical';
  else if (rawPrio === 'high' || rawPrio === 'urgent') priority = 'high';
  else if (rawPrio === 'low') priority = 'low';

  return {
    id: Number(f.id),
    content: f.content || '',
    summary: f.summary || f.content?.slice(0, 140) || '',
    source: sourceObj?.name || f.source || 'Direct',
    channelType: sourceObj?.channel_type || undefined,
    theme: linkedThemes[0]?.name || f.theme || 'General Product',
    themeId: linkedThemes[0]?.id,
    themes: linkedThemes.map((t) => ({ id: Number(t.id), name: t.name })),
    sentiment,
    priority,
    date: f.feedback_date || (f.created_at ? f.created_at.split('T')[0] : '2026-09-15'),
    isFlagged: Boolean(f.is_flagged),
    sourceId: f.source_id ? Number(f.source_id) : undefined,
  };
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { feedback, themes, sources } = await fetchAllFeedbackData();

  // Calculate actual source breakdown
  const sourceCountMap = new Map<string, number>();
  feedback.forEach((f) => {
    const sName = f.source || 'Direct';
    sourceCountMap.set(sName, (sourceCountMap.get(sName) || 0) + 1);
  });

  const total = feedback.length || 1;
  const sourcesBreakdown = Array.from(sourceCountMap.entries()).map(
    ([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / total) * 100),
      color: SOURCE_COLORS[source] || '#64748b',
    })
  );

  // Sort sources by count descending
  sourcesBreakdown.sort((a, b) => b.count - a.count);

  const flagged = feedback.filter((f) => f.isFlagged || f.priority === 'high' || f.priority === 'critical');

  // Most recent feedback (by date descending or id descending)
  const recent = [...feedback].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id
  );

  return {
    totalFeedback: feedback.length,
    totalThemes: themes.length,
    totalInsights: 6, // 6 seeded insights in database
    flaggedCount: flagged.length,
    themes,
    sources: sourcesBreakdown,
    recentFeedback: recent.slice(0, 4),
    flaggedFeedback: flagged,
  };
}
