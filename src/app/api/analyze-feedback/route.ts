import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ANALYSIS_PROMPT } from '@/lib/ai/prompts';

// Allow up to 60s execution on Vercel serverless functions
export const maxDuration = 60;

// ============================================================
// AI FEEDBACK ANALYSIS API ROUTE
// /api/analyze-feedback
//
// Authenticates the user server-side, retrieves real Feedback
// records from Supabase using the user's RLS session, sends a
// carefully controlled prompt to OpenRouter (free tier only),
// validates the response, and returns ranked issues.
//
// SECURITY: OpenRouter API key is NEVER sent to the browser.
// All validation of the model's output is enforced in code.
// ============================================================

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Strictly verified $0 (:free) models on OpenRouter.
// Primary is nvidia/nemotron-3-ultra-550b-a55b:free with reasoning disabled
// (default_effort on OpenRouter is "high", which previously exhausted 1200 tokens
// on internal chain-of-thought before completing the JSON response).
// If the primary free endpoint is rate-limited, overloaded, or returns malformed
// output, the route falls back only to other verified $0 :free models.
const FREE_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
] as const;

const PER_MODEL_TIMEOUT_MS = 22_000; // 22 seconds per free model attempt
const MAX_TOKENS = 3500; // generous headroom so JSON is never truncated
const MAX_FEEDBACK_RECORDS = 20; // cap to control token usage
const MAX_CONTENT_CHARS = 300; // per record
const VALID_PRIORITIES = new Set(['HIGH', 'MEDIUM', 'LOW']);

// Rate limiting: simple in-memory store (resets on serverless cold start)
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per user

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

/**
 * Extracts raw text from an OpenRouter chat completion choice, handling
 * string content, content-part arrays, and reasoning-only responses.
 */
function extractTextFromChoice(choice: any): string {
  if (!choice) return '';
  const msg = choice.message || {};

  let content = '';
  if (typeof msg.content === 'string') {
    content = msg.content;
  } else if (Array.isArray(msg.content)) {
    content = msg.content
      .map((part: any) => (typeof part === 'string' ? part : part?.text || ''))
      .join('\n');
  } else if (typeof choice.text === 'string') {
    content = choice.text;
  }

  // If content is empty or doesn't contain "issues", also check reasoning fields
  // in case a reasoning model placed the JSON inside message.reasoning
  const reasoning =
    typeof msg.reasoning === 'string'
      ? msg.reasoning
      : typeof msg.reasoning_content === 'string'
      ? msg.reasoning_content
      : '';

  if (!content.trim() && reasoning.trim()) {
    return reasoning;
  }
  if (!content.includes('"issues"') && reasoning.includes('"issues"')) {
    return `${content}\n${reasoning}`;
  }
  return content;
}

/**
 * Extracts and parses the structured `{ issues: [...] }` JSON from raw LLM text.
 * Handles:
 * - `<think>...</think>` blocks and unclosed `<think>` preambles
 * - Markdown ```json ... ``` code fences
 * - Greedy brace collisions when reasoning text contains `{ ... }`
 * - Trailing commas before `}` or `]`
 * - Truncated JSON arrays (`finish_reason === "length"`), recovering completed issue objects
 */
function parseStructuredIssuesJson(rawText: string): any | null {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Strip closed <think>...</think> blocks
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. If an unclosed <think> tag exists, strip up to the first `{"issues"` or `{ "issues"`
  if (/<think>/i.test(cleaned)) {
    const issuesStart = cleaned.search(/\{\s*"issues"\s*:/);
    if (issuesStart !== -1) {
      cleaned = cleaned.slice(issuesStart);
    } else {
      cleaned = cleaned.replace(/<think>/gi, '').trim();
    }
  }

  const candidates: string[] = [];

  // Candidate A: Markdown code fence ```json ... ``` or ``` ... ```
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let fenceMatch: RegExpExecArray | null;
  while ((fenceMatch = fenceRegex.exec(cleaned)) !== null) {
    if (fenceMatch[1]?.trim()) {
      candidates.push(fenceMatch[1].trim());
    }
  }

  // Candidate B: Substring starting specifically at `{"issues"` / `{ "issues":`
  const issuesObjStart = cleaned.search(/\{\s*"issues"\s*:/);
  if (issuesObjStart !== -1) {
    const sub = cleaned.slice(issuesObjStart);
    const balanced = extractBalancedJsonObject(sub);
    if (balanced) candidates.push(balanced);
    const lastBrace = sub.lastIndexOf('}');
    if (lastBrace !== -1) {
      candidates.push(sub.slice(0, lastBrace + 1));
    }
  }

  // Candidate C: Balanced JSON object from each `{` in the text (last to first, since JSON is at the end)
  const openIndices: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') openIndices.push(i);
  }
  for (let i = 0; i < openIndices.length; i++) {
    const sub = cleaned.slice(openIndices[i]);
    if (sub.includes('"issues"')) {
      const balanced = extractBalancedJsonObject(sub);
      if (balanced) candidates.push(balanced);
    }
  }

  // Candidate D: Raw cleaned string
  candidates.push(cleaned);

  // Try parsing each candidate (with and without trailing-comma cleanup)
  for (const cand of candidates) {
    for (const variant of [cand, removeTrailingCommas(cand)]) {
      try {
        const parsed = JSON.parse(variant);
        if (parsed && Array.isArray(parsed.issues) && parsed.issues.length > 0) {
          return parsed;
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { issues: parsed };
        }
      } catch {
        // continue trying next candidate
      }
    }
  }

  // 3. Truncation recovery: if the response was cut off mid-JSON after completing
  // 1 or more issue objects inside `"issues": [ { ... }, { ... }`, recover the complete objects
  const recoveredIssues = recoverCompleteIssueObjects(cleaned);
  if (recoveredIssues.length > 0) {
    return {
      issues: recoveredIssues,
      disclaimer:
        'These are AI-assisted suggestions based only on the provided feedback records, not verified facts.',
    };
  }

  return null;
}

function removeTrailingCommas(str: string): string {
  return str.replace(/,\s*([}\]])/g, '$1');
}

function extractBalancedJsonObject(str: string): string | null {
  let depth = 0;
  let inString = false;
  let escape = false;
  let start = -1;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        return str.slice(start, i + 1);
      }
    }
  }
  return null;
}

function recoverCompleteIssueObjects(str: string): any[] {
  const issuesKeyIdx = str.search(/"issues"\s*:\s*\[/);
  if (issuesKeyIdx === -1) return [];

  const bracketIdx = str.indexOf('[', issuesKeyIdx);
  if (bracketIdx === -1) return [];

  const arraySlice = str.slice(bracketIdx + 1);
  const items: any[] = [];
  let i = 0;

  while (i < arraySlice.length) {
    const nextBrace = arraySlice.indexOf('{', i);
    if (nextBrace === -1) break;
    const objStr = extractBalancedJsonObject(arraySlice.slice(nextBrace));
    if (!objStr) break; // hit truncated object at end
    try {
      const obj = JSON.parse(removeTrailingCommas(objStr));
      if (obj && typeof obj === 'object' && obj.title && obj.summary) {
        items.push(obj);
      }
    } catch {
      // skip malformed item
    }
    i = nextBrace + objStr.length;
  }

  return items;
}

/**
 * Validates and normalizes parsed issues against strict code-enforced rules:
 * - Only accepts HIGH, MEDIUM, or LOW priority
 * - Only accepts supportingFeedbackIds that exist in `validIds`
 */
function validateIssues(
  rawIssues: any[],
  validIds: Set<number>
): {
  rank: number;
  title: string;
  priority: string;
  summary: string;
  recommendation: string;
  supportingFeedbackIds: number[];
  confidence: string;
}[] {
  if (!Array.isArray(rawIssues)) return [];

  return rawIssues
    .slice(0, 5)
    .map((issue: any, idx: number) => {
      const rawPriority = String(issue?.priority || '').toUpperCase().trim();
      const priority = VALID_PRIORITIES.has(rawPriority)
        ? rawPriority
        : rawPriority === 'CRITICAL' || rawPriority === 'URGENT'
        ? 'HIGH'
        : 'MEDIUM';

      // Discard invented feedback IDs — only accept IDs present in validIds
      const rawIds: number[] = Array.isArray(issue?.supportingFeedbackIds)
        ? Array.from(
            new Set(
              issue.supportingFeedbackIds
                .map((id: any) =>
                  typeof id === 'number'
                    ? id
                    : parseInt(String(id).replace(/\D/g, ''), 10)
                )
                .filter((id: number) => !isNaN(id) && validIds.has(id))
            )
          )
        : [];

      const rawConf = String(issue?.confidence || '').toLowerCase().trim();
      const confidence = ['high', 'medium', 'low'].includes(rawConf)
        ? rawConf
        : 'medium';

      return {
        rank: typeof issue?.rank === 'number' ? issue.rank : idx + 1,
        title: String(issue?.title || `Issue ${idx + 1}`).trim().slice(0, 120),
        priority,
        summary: String(issue?.summary || '').trim().slice(0, 600),
        recommendation: String(issue?.recommendation || '')
          .trim()
          .slice(0, 400),
        supportingFeedbackIds: rawIds,
        confidence,
      };
    })
    .filter((issue) => issue.title && issue.summary);
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

  const userMessage = `Here are ${feedbackRows.length} customer feedback records from Leeg's platform:\n\n${feedbackContext}\n\nAnalyze these records and return ONLY the requested JSON object with the 3-5 most important issues for the VP of Product.`;

  // ---- 7. Call OpenRouter across verified FREE models ----
  let lastErrorStatus = 502;
  let lastErrorMessage =
    'AI model did not return a structured response. The free model may be overloaded or the response was malformed. Please try again.';

  for (const modelId of FREE_MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PER_MODEL_TIMEOUT_MS);

      const requestBody: Record<string, any> = {
        model: modelId,
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
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
        // Disable/minimize extended reasoning so reasoning models (like Nemotron 3 Ultra,
        // which defaults to "high" reasoning effort on OpenRouter) do not spend their
        // entire token budget on chain-of-thought before emitting the JSON response.
        include_reasoning: false,
        reasoning: {
          effort: 'none',
          enabled: false,
        },
      };

      const openRouterRes = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://leeg-feedback-intelligence.vercel.app',
          'X-Title': 'Leeg Feedback Intelligence',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!openRouterRes.ok) {
        const status = openRouterRes.status;
        let detail = '';
        try {
          const errBody = await openRouterRes.json();
          detail = errBody?.error?.message || errBody?.message || '';
        } catch {}

        console.error(
          `[AI Analysis] Model ${modelId} returned HTTP ${status}: ${detail}`
        );

        // If the API key itself is invalid (401), fail immediately — retrying another model won't help
        if (status === 401) {
          return NextResponse.json(
            { error: 'AI service authentication failed. The API key may be invalid.' },
            { status: 502 }
          );
        }

        if (status === 429) {
          lastErrorStatus = 429;
          lastErrorMessage =
            'AI model rate limit reached. The free model tier has a limited quota. Please wait a moment and try again.';
        } else if (status === 503 || status === 529) {
          lastErrorStatus = 503;
          lastErrorMessage =
            'The AI model is temporarily unavailable (free tier may be at capacity). Please try again in a few minutes.';
        } else {
          lastErrorStatus = 502;
          lastErrorMessage = `AI service error (HTTP ${status}). ${
            detail ? detail : 'Please try again.'
          }`;
        }
        // Try next free model in FREE_MODELS
        continue;
      }

      const responseBody = await openRouterRes.json();
      const choice = responseBody?.choices?.[0];
      const finishReason = choice?.finish_reason || 'unknown';
      const rawText = extractTextFromChoice(choice).slice(0, 30_000);

      if (!rawText.trim()) {
        console.warn(
          `[AI Analysis] Model ${modelId} returned empty text (finish_reason=${finishReason}). Trying next free model...`
        );
        continue;
      }

      const parsed = parseStructuredIssuesJson(rawText);
      if (!parsed || !Array.isArray(parsed.issues)) {
        console.warn(
          `[AI Analysis] Model ${modelId} output could not be parsed as JSON (finish_reason=${finishReason}, len=${rawText.length}). Preview: ${rawText
            .slice(0, 300)
            .replace(/\s+/g, ' ')}`
        );
        continue;
      }

      const validatedIssues = validateIssues(parsed.issues, validIds);
      if (validatedIssues.length === 0) {
        console.warn(
          `[AI Analysis] Model ${modelId} issues failed validation. Trying next free model...`
        );
        continue;
      }

      const disclaimer =
        typeof parsed?.disclaimer === 'string' && parsed.disclaimer.trim()
          ? parsed.disclaimer.trim().slice(0, 400)
          : 'These are AI-assisted suggestions based only on the provided feedback records. They are not verified facts and should be reviewed by a product team member before action.';

      console.log(
        `[AI Analysis] Success model=${modelId} user=${userEmail} records=${feedbackRows.length} issues_validated=${validatedIssues.length} finish_reason=${finishReason}`
      );

      return NextResponse.json({
        issues: validatedIssues,
        disclaimer,
        model: modelId,
        recordsAnalyzed: feedbackRows.length,
        generatedAt: new Date().toISOString(),
        promptReference: 'See ANALYSIS_PROMPT constant in src/lib/ai/prompts.ts',
      });
    } catch (fetchErr: any) {
      const isTimeout = fetchErr?.name === 'AbortError';
      console.error(
        `[AI Analysis] Model ${modelId} fetch error (${
          isTimeout ? 'timeout' : 'network'
        }):`,
        fetchErr?.message || fetchErr
      );
      lastErrorStatus = 502;
      lastErrorMessage = isTimeout
        ? 'AI analysis request timed out. The free model tier may be under heavy load. Please try again.'
        : 'Could not connect to AI service (OpenRouter). Please check your connection and try again.';
      // Continue to next verified free model
    }
  }

  console.error(
    `[AI Analysis] All free models exhausted for user=${userEmail}. Last error: ${lastErrorMessage}`
  );
  return NextResponse.json({ error: lastErrorMessage }, { status: lastErrorStatus });
}
