import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ANALYSIS_PROMPT } from '@/lib/ai/prompts';

// ============================================================
// AI FEEDBACK ANALYSIS API ROUTE
// /api/analyze-feedback
//
// Authenticates the user server-side, retrieves real Feedback
// records from Supabase using the user's RLS session, sends a
// carefully controlled prompt to OpenRouter (Nemotron model),
// validates the response, and returns ranked issues.
//
// SECURITY: OpenRouter API key is NEVER sent to the browser.
// All validation of the model's output is enforced in code.
// ============================================================

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const MODEL_ID = 'nvidia/nemotron-3-ultra-550b-a55b:free';
const REQUEST_TIMEOUT_MS = 30_000; // 30 seconds
const MAX_FEEDBACK_RECORDS = 20; // cap to control token usage
const MAX_CONTENT_CHARS = 300; // per record
const VALID_PRIORITIES = new Set(['HIGH', 'MEDIUM', 'LOW']);

// Prompt is loaded from src/lib/ai/prompts.ts (ANALYSIS_PROMPT)

// Rate limiting: simple in-memory store (resets on serverless cold start)
// For production, use Redis or Supabase table. This is sufficient for assignment.
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3; // 3 requests per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLog = (requestLog.get(userId) || []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (userLog.length >= RATE_LIMIT_MAX) return false;
  userLog.push(now);
  requestLog.set(userId, userLog);
  return true;
}

// Failure simulation (assignment testing only — server-only env var)
function shouldSimulateFailure(userEmail: string): boolean {
  if (process.env.SIMULATE_AI_FAILURE !== 'true') return false;
  const failEmails = (process.env.AI_FAIL_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return failEmails.length === 0 || failEmails.includes(userEmail.toLowerCase());
}

export async function POST(request: NextRequest) {
  // ---- 1. Require verified Supabase authentication (server-side) ----
  // Only a genuine, cryptographically verified Supabase Auth session is accepted.
  // Unsigned client cookies (e.g. leeg_auth_session) are rejected.
  let userId = '';
  let userEmail = '';
  let supabaseSession: any = null;

  try {
    const supabase = await createClient();
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

    const {
      data: { user },
      error: authError,
    } = bearerToken
      ? await supabase.auth.getUser(bearerToken)
      : await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to use AI Analysis.' },
        { status: 401 }
      );
    }

    userId = user.id;
    userEmail = user.email || 'authenticated-user';

    if (bearerToken) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      supabaseSession = createSupabaseClient(url, anonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      });
    } else {
      supabaseSession = supabase;
    }
  } catch (authErr) {
    console.error('[AI Analysis] Auth check failed:', authErr);
    return NextResponse.json(
      { error: 'Authentication check failed. Please refresh and try again.' },
      { status: 401 }
    );
  }

  // ---- 2. Rate limit ----
  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      {
        error:
          'Too many analysis requests. Please wait a minute before trying again.',
      },
      { status: 429 }
    );
  }

  // ---- 3. Failure simulation (assignment testing only) ----
  if (shouldSimulateFailure(userEmail)) {
    console.error('[AI Analysis] [SIMULATED FAILURE] Triggered for:', userEmail);
    return NextResponse.json(
      {
        error:
          'AI analysis service temporarily unavailable. The language model could not be reached. This may be due to rate limits on the free model tier. Please try again shortly.',
        simulated: true,
      },
      { status: 503 }
    );
  }

  // ---- 4. Check OpenRouter API key ----
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[AI Analysis] OPENROUTER_API_KEY environment variable is not set.');
    return NextResponse.json(
      {
        error:
          'AI analysis is not configured. The OPENROUTER_API_KEY environment variable is missing. Contact the administrator.',
      },
      { status: 503 }
    );
  }

  // ---- 5. Fetch real Feedback records from Supabase ----
  let feedbackRows: any[] = [];
  try {
    const { data, error } = await supabaseSession
      .from('Feedback')
      .select('id, content, source, theme, sentiment, priority, is_flagged, feedback_date, summary')
      .order('id', { ascending: true })
      .limit(MAX_FEEDBACK_RECORDS);

    if (error) throw error;
    feedbackRows = data || [];
  } catch (dbErr: any) {
    console.error('[AI Analysis] Supabase query failed:', dbErr?.message || dbErr);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback records from the database. Please try again.' },
      { status: 500 }
    );
  }

  if (feedbackRows.length === 0) {
    return NextResponse.json(
      { error: 'No feedback records found in the database.' },
      { status: 404 }
    );
  }

  // ---- 6. Build prompt context (no PII — no emails, passwords, user IDs) ----
  const validIds = new Set(feedbackRows.map((f) => Number(f.id)));

  const feedbackContext = feedbackRows
    .map((f) => {
      const content = (f.content || '').slice(0, MAX_CONTENT_CHARS);
      const priority = (f.priority || 'medium').toUpperCase();
      const flagged = f.is_flagged ? ' [FLAGGED]' : '';
      return `ID:${f.id} Source:${f.source || 'Unknown'} Theme:"${f.theme || 'General'}" Priority:${priority}${flagged}\nContent: ${content}`;
    })
    .join('\n\n');

  const userMessage = `Here are ${feedbackRows.length} customer feedback records from Leeg's platform:\n\n${feedbackContext}\n\nPlease analyze these records and identify the 3-5 most important issues for the VP of Product.`;

  // ---- 7. Call OpenRouter ----
  let openRouterRes: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    openRouterRes = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://leeg-feedback-intelligence.vercel.app',
        'X-Title': 'Leeg Feedback Intelligence',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: 'system',
            content: ANALYSIS_PROMPT,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 1200,
        temperature: 0.3,
        // Note: Nemotron free tier may not support response_format JSON mode.
        // We validate JSON in code instead.
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (fetchErr: any) {
    const isTimeout = fetchErr?.name === 'AbortError';
    console.error('[AI Analysis] OpenRouter fetch error:', fetchErr?.message || fetchErr);
    return NextResponse.json(
      {
        error: isTimeout
          ? 'AI analysis request timed out. The model may be under load. Please try again.'
          : 'Could not connect to AI service (OpenRouter). Please check your connection and try again.',
      },
      { status: 502 }
    );
  }

  // ---- 8. Handle non-OK HTTP from OpenRouter ----
  if (!openRouterRes.ok) {
    const status = openRouterRes.status;
    let detail = '';
    try {
      const errBody = await openRouterRes.json();
      detail = errBody?.error?.message || errBody?.message || '';
    } catch {}

    console.error(`[AI Analysis] OpenRouter returned ${status}: ${detail}`);

    if (status === 401) {
      return NextResponse.json(
        { error: 'AI service authentication failed. The API key may be invalid.' },
        { status: 502 }
      );
    }
    if (status === 429) {
      return NextResponse.json(
        {
          error:
            'AI model rate limit reached. The free model tier has a limited quota. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }
    if (status === 503 || status === 529) {
      return NextResponse.json(
        {
          error:
            'The AI model is temporarily unavailable (free tier may be at capacity). Please try again in a few minutes.',
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `AI service error (HTTP ${status}). ${detail ? detail : 'Please try again.'}` },
      { status: 502 }
    );
  }

  // ---- 9. Parse OpenRouter response ----
  let responseText = '';
  try {
    const responseBody = await openRouterRes.json();
    responseText =
      responseBody?.choices?.[0]?.message?.content || '';
    if (!responseText) {
      throw new Error('Empty content in model response');
    }
    if (responseText.length > 20_000) {
      responseText = responseText.slice(0, 20_000);
    }
  } catch (parseErr) {
    console.error('[AI Analysis] Failed to parse OpenRouter response:', parseErr);
    return NextResponse.json(
      { error: 'AI model returned an unreadable response. Please try again.' },
      { status: 502 }
    );
  }

  // ---- 10. Extract and validate JSON from model output ----
  // Model may wrap JSON in markdown code fences — strip them
  let parsed: any;
  try {
    const jsonMatch =
      responseText.match(/```json\s*([\s\S]*?)```/) ||
      responseText.match(/```\s*([\s\S]*?)```/) ||
      responseText.match(/(\{[\s\S]*\})/);

    const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error('[AI Analysis] Model did not return valid JSON. Raw output:', responseText.slice(0, 500));
    return NextResponse.json(
      {
        error:
          'AI model did not return a structured response. The free model may be overloaded or the response was malformed. Please try again.',
      },
      { status: 502 }
    );
  }

  // ---- 11. Validate model output (code-enforced rules) ----
  if (!Array.isArray(parsed?.issues)) {
    console.error('[AI Analysis] Response missing issues array');
    return NextResponse.json(
      { error: 'AI model response was missing required fields. Please try again.' },
      { status: 502 }
    );
  }

  const validatedIssues = parsed.issues
    .slice(0, 5) // max 5 issues
    .map((issue: any, idx: number) => {
      // Enforce valid priority
      const rawPriority = String(issue?.priority || '').toUpperCase();
      const priority = VALID_PRIORITIES.has(rawPriority) ? rawPriority : 'MEDIUM';

      // Discard invented feedback IDs — only accept IDs we sent
      const rawIds: number[] = Array.isArray(issue?.supportingFeedbackIds)
        ? issue.supportingFeedbackIds
            .map((id: any) => Number(id))
            .filter((id: number) => !isNaN(id) && validIds.has(id))
        : [];

      return {
        rank: typeof issue?.rank === 'number' ? issue.rank : idx + 1,
        title: String(issue?.title || `Issue ${idx + 1}`).slice(0, 120),
        priority,
        summary: String(issue?.summary || '').slice(0, 600),
        recommendation: String(issue?.recommendation || '').slice(0, 400),
        supportingFeedbackIds: rawIds,
        confidence: ['high', 'medium', 'low'].includes(issue?.confidence)
          ? issue.confidence
          : 'medium',
      };
    })
    .filter((issue: any) => issue.title && issue.summary);

  if (validatedIssues.length === 0) {
    console.error('[AI Analysis] All issues failed validation. Raw output:', responseText.slice(0, 500));
    return NextResponse.json(
      { error: 'AI model output could not be validated. Please try again.' },
      { status: 502 }
    );
  }

  const disclaimer =
    typeof parsed?.disclaimer === 'string'
      ? parsed.disclaimer.slice(0, 400)
      : 'These are AI-assisted suggestions based only on the provided feedback records. They are not verified facts and should be reviewed by a product team member before action.';

  console.log(
    `[AI Analysis] user=${userEmail} records=${feedbackRows.length} issues_validated=${validatedIssues.length}`
  );

  return NextResponse.json({
    issues: validatedIssues,
    disclaimer,
    model: MODEL_ID,
    recordsAnalyzed: feedbackRows.length,
    generatedAt: new Date().toISOString(),
    promptReference: 'See ANALYSIS_PROMPT constant in src/lib/ai/prompts.ts',
  });
}
