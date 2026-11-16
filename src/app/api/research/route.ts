import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// OPENALEX RESEARCH API ROUTE
// /api/research
//
// Proxies queries to the OpenAlex Works API on behalf of the
// authenticated browser client. The browser NEVER calls
// OpenAlex directly — all requests go through this route.
//
// OpenAlex is a free, open academic search API.
// No API key is required for basic use. An optional
// OPENALEX_API_KEY env var is accepted but not mandatory.
//
// OpenAlex docs: https://docs.openalex.org/api-entities/works
// ============================================================

const OPENALEX_BASE = 'https://api.openalex.org';
const MAX_RESULTS = 5;
const REQUEST_TIMEOUT_MS = 10_000; // 10 seconds
const MAX_QUERY_LEN = 200;

// Failure simulation: set SIMULATE_RESEARCH_FAILURE=true in Vercel env
// and use an account whose email is in RESEARCH_FAIL_EMAILS (comma-separated)
// to trigger the failure path for assignment screenshots.
// This secret is NEVER sent to the browser.
function shouldSimulateFailure(userEmail: string): boolean {
  if (process.env.SIMULATE_RESEARCH_FAILURE !== 'true') return false;
  const failEmails = (process.env.RESEARCH_FAIL_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return failEmails.length === 0 || failEmails.includes(userEmail.toLowerCase());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get('q') || '').trim();

  // ---- 1. Validate input ----
  if (!rawQuery) {
    return NextResponse.json(
      { error: 'Missing search query. Provide ?q=your+topic' },
      { status: 400 }
    );
  }
  if (rawQuery.length > MAX_QUERY_LEN) {
    return NextResponse.json(
      { error: `Query too long. Max ${MAX_QUERY_LEN} characters.` },
      { status: 400 }
    );
  }

  // ---- 2. Require authentication (server-side) ----
  let userEmail = 'anonymous';
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      userEmail = user.email;
    } else {
      // Check fallback auth cookie (for demo/development sessions)
      const demoCookie = request.cookies.get('leeg_auth_session');
      if (demoCookie?.value) {
        try {
          const parsed = JSON.parse(decodeURIComponent(demoCookie.value));
          if (parsed?.email) {
            userEmail = parsed.email;
          }
        } catch {
          // invalid cookie format
        }
      }
    }

    if (userEmail === 'anonymous') {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to use Research.' },
        { status: 401 }
      );
    }
  } catch (authErr) {
    console.error('[Research API] Auth check failed:', authErr);
    return NextResponse.json(
      { error: 'Authentication check failed. Please refresh and try again.' },
      { status: 401 }
    );
  }

  // ---- 3. Failure simulation (assignment testing only) ----
  if (shouldSimulateFailure(userEmail)) {
    console.error('[Research API] [SIMULATED FAILURE] Triggered for:', userEmail);
    return NextResponse.json(
      {
        error:
          'External research service temporarily unavailable. The OpenAlex API could not be reached. Please try again later.',
        simulated: true,
      },
      { status: 503 }
    );
  }

  // ---- 4. Build OpenAlex request ----
  const query = encodeURIComponent(rawQuery);
  // Use polite pool (email mailto) for better rate-limit treatment
  const mailto =
    process.env.OPENALEX_MAILTO || 'research@leeg-app.example.com';
  const url =
    `${OPENALEX_BASE}/works` +
    `?search=${query}` +
    `&per-page=${MAX_RESULTS}` +
    `&select=id,title,publication_year,primary_location,open_access,abstract_inverted_index,authorships,cited_by_count,doi` +
    `&mailto=${encodeURIComponent(mailto)}` +
    `&sort=relevance_score:desc`;

  // Build headers — API key is optional for OpenAlex
  const headers: Record<string, string> = {
    'User-Agent': `LeegFeedbackIntelligence/1.0 (mailto:${mailto})`,
    Accept: 'application/json',
  };
  const apiKey = process.env.OPENALEX_API_KEY;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // ---- 5. Call OpenAlex with timeout ----
  let openAlexRes: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    openAlexRes = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timer);
  } catch (fetchErr: any) {
    const isTimeout = fetchErr?.name === 'AbortError';
    console.error('[Research API] OpenAlex fetch error:', fetchErr?.message || fetchErr);
    return NextResponse.json(
      {
        error: isTimeout
          ? 'Request to external research service timed out. Please try again.'
          : 'Could not connect to external research service (OpenAlex). The service may be temporarily unavailable.',
      },
      { status: 502 }
    );
  }

  // ---- 6. Handle non-OK HTTP from OpenAlex ----
  if (!openAlexRes.ok) {
    const statusText = openAlexRes.statusText;
    const status = openAlexRes.status;
    console.error(`[Research API] OpenAlex returned ${status} ${statusText}`);
    if (status === 429) {
      return NextResponse.json(
        {
          error:
            'External research service rate limit reached. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error: `External research service returned an error (HTTP ${status}). Please try again.`,
      },
      { status: 502 }
    );
  }

  // ---- 7. Parse and validate response ----
  let data: any;
  try {
    const text = await openAlexRes.text();
    if (text.length > 500_000) {
      console.warn('[Research API] OpenAlex response too large, truncating');
    }
    data = JSON.parse(text.slice(0, 500_000));
  } catch (parseErr) {
    console.error('[Research API] Failed to parse OpenAlex response:', parseErr);
    return NextResponse.json(
      { error: 'External research service returned an unreadable response. Please try again.' },
      { status: 502 }
    );
  }

  if (!Array.isArray(data?.results)) {
    console.error('[Research API] OpenAlex response missing results array');
    return NextResponse.json(
      { error: 'Unexpected response format from external research service.' },
      { status: 502 }
    );
  }

  // ---- 8. Transform to safe, compact frontend model ----
  const works = data.results.slice(0, MAX_RESULTS).map((work: any) => {
    // Reconstruct abstract from inverted index (OpenAlex format)
    let abstract: string | null = null;
    if (work.abstract_inverted_index && typeof work.abstract_inverted_index === 'object') {
      try {
        const wordPositions: { word: string; pos: number }[] = [];
        for (const [word, positions] of Object.entries(work.abstract_inverted_index)) {
          if (Array.isArray(positions)) {
            positions.forEach((pos: any) => {
              if (typeof pos === 'number') {
                wordPositions.push({ word, pos });
              }
            });
          }
        }
        wordPositions.sort((a, b) => a.pos - b.pos);
        const reconstructed = wordPositions.map((wp) => wp.word).join(' ');
        abstract = reconstructed.slice(0, 400) || null;
      } catch {
        abstract = null;
      }
    }

    const sourceName =
      work.primary_location?.source?.display_name ||
      work.primary_location?.source?.type ||
      null;

    const doiUrl = work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : null;
    const openAlexUrl = work.id || null; // e.g. https://openalex.org/W...

    return {
      id: work.id,
      title: work.title || 'Untitled',
      year: work.publication_year || null,
      source: sourceName,
      abstract: abstract,
      citedByCount: typeof work.cited_by_count === 'number' ? work.cited_by_count : null,
      openAccess: Boolean(work.open_access?.is_oa),
      url: doiUrl || openAlexUrl,
      authors: Array.isArray(work.authorships)
        ? work.authorships
            .slice(0, 3)
            .map((a: any) => a?.author?.display_name)
            .filter(Boolean)
        : [],
    };
  });

  console.log(
    `[Research API] Query="${rawQuery}" user=${userEmail} results=${works.length}`
  );

  return NextResponse.json({
    query: rawQuery,
    totalResults: data.meta?.count ?? works.length,
    results: works,
    source: 'OpenAlex (https://openalex.org)',
    attribution: 'Data provided by OpenAlex. Licensed under CC0.',
  });
}
