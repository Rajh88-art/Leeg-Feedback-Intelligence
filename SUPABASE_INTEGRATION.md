# Supabase Integration — Leeg Feedback Intelligence

## Overview

This document describes the Assignment 3 Supabase database integration that wires the Leeg Feedback Intelligence Next.js application to a live Supabase seed database containing 59 rows across 5 tables.

## Database Tables (public schema)

| Table | Rows | Notes |
|-------|------|-------|
| `public."Sources"` | 6 | Feedback intake sources |
| `public."Themes"` | 7 | Product themes including *Access, Privacy & Feature Availability* |
| `public."Feedback"` | 20 | Verbatim customer records |
| `public."Feedback_Themes"` | 20 | Many-to-many junction: feedback ↔ themes |
| `public."AI Insights"` | 6 | Synthesized strategic insights |

> **Note:** The `AI Insights` table name contains a space and must be referenced as `supabase.from('AI Insights')`.

## Table Schemas

### Sources
```
id | created_at | name | description | channel_type
```

### Themes
```
id | created_at | name | description | category
```

### Feedback
```
id | created_at | source | content | theme | sentiment | priority |
feedback_date | summary | is_flagged | source_id (FK → Sources)
```

### Feedback_Themes
```
id | created_at | feedback_id | theme_id
```

### AI Insights
```
id | created_at | title | summary | insight_type | priority | theme_id | feedback_id
```

## Security Model

All 5 tables have **Row Level Security (RLS) enabled** with `TO authenticated` SELECT policies.

- Unauthenticated queries return 0 rows (as confirmed in testing)
- All data fetching uses `createBrowserClient()` from `@/lib/supabase/client` while a user is signed in
- The anon key is used only as the API key header — the session JWT is the effective access token

## Integration Architecture

### Service Layer: `src/services/feedbackDbService.ts`

Four exported async functions handle all database interactions:

| Function | Description |
|----------|-------------|
| `fetchAllFeedbackData()` | Fetches Feedback + Sources + Themes + Feedback_Themes in parallel, returns enriched models |
| `fetchAIInsightsData()` | Fetches AI Insights, resolves theme names, parses referenced feedback IDs from text |
| `fetchFeedbackRecordById(id)` | Fetches a single Feedback record with its source and linked themes |
| `fetchDashboardMetrics()` | Derives KPI counts, source breakdown, recent & flagged records |

### Type Definitions: `src/types/database.ts`

Raw DB row interfaces: `DbSource`, `DbTheme`, `DbFeedback`, `DbFeedbackTheme`, `DbAIInsight`

Enriched frontend models: `EnrichedFeedback`, `EnrichedTheme`, `EnrichedAIInsight`, `DashboardMetrics`

## Pages Wired to Supabase

### `/dashboard` → `src/app/dashboard/page.tsx`
- Calls `fetchDashboardMetrics()` on mount
- Displays: 20 total records, 7 themes, flagged friction items (including Feedback #10)
- Real source distribution bar derived from actual database counts
- Recent 4 feedback records sorted by date
- Theme drilldown modal shows real database records

### `/feedback` → `src/app/feedback/page.tsx`
- Calls `fetchAllFeedbackData()` on mount
- All 20 Feedback records from Supabase
- Search, 7-theme filter, 6-source filter, date filter
- CSV export uses real database fields
- Records displayed as `Feedback #ID` with no invented author names or avatars
- Theme drilldown modal wired to real database records

### `/ai-insights` → `src/app/ai-insights/page.tsx`
- Calls `fetchAIInsightsData()` and `fetchAllFeedbackData()` on mount
- Shows all 6 stored `AI Insights` rows with clickable evidence links (e.g. `#10`)
- Shows all 7 Themes with real feedback counts and flagged issue indicators
- Cross-channel patterns section uses live insight data

### `/feedback/[id]` → `FeedbackDetailClient.tsx`
- Accepts numeric IDs 1–20 (Supabase) and legacy `FB-NNN` IDs (static fallback)
- Calls `fetchFeedbackRecordById(id)` on mount
- Displays real verbatim content, source, theme, sentiment, priority, date, isFlagged
- Prev/Next navigation across all 20 Supabase records
- Related records section filtered by same theme
- No fake author photos or invented identities

## Critical Record: Feedback #10

Feedback #10 is a flagged, high-priority record related to access and privacy concerns. It is prominently surfaced on:
- The Dashboard friction panel
- The Feedback Explorer (flagged badge)
- The `/feedback/10` detail view

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

These must be set in `.env.local` (locally) and in Vercel project settings (production).

> **Never use the service-role key in the browser application.**

## Verification Steps

1. Sign in at `/login` (email/password, Google, or GitHub)
2. Navigate to `/dashboard` — confirm: 20 records, 7 themes, flagged items visible
3. Navigate to `/feedback` — confirm: 20 cards load from Supabase; search and filters work
4. Click any theme badge — confirm: Theme Drilldown Modal shows real database records
5. Click "Inspect" on any card — confirm: `/feedback/[id]` shows real content, prev/next works
6. Navigate to `/feedback/10` directly — confirm: flagged, high-priority record displays
7. Navigate to `/ai-insights` — confirm: 6 AI Insights with evidence links, 7 theme cards
8. Click an evidence link (e.g., `#10`) — confirm: links to correct Feedback Detail page
9. Sign out — confirm: redirected to `/login`, protected routes inaccessible

## Commit History

```
492f526  Connect Leeg feedback intelligence to Supabase seed data
```

Repository: https://github.com/Rajh88-art/Leeg-Feedback-Intelligence  
Production URL: https://leeg-feedback-intelligence.vercel.app/
