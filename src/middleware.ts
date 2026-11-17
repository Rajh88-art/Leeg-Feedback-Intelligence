import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isSupabaseConfigured = Boolean(
    url &&
      anonKey &&
      !url.includes('your-project') &&
      !url.includes('placeholder') &&
      url.startsWith('https://')
  );

  let isAuthenticated = false;

  // 1. Check and refresh Supabase Auth session when configured
  if (isSupabaseConfigured) {
    try {
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
      } else {
        // Clear any stale demo cookie if the genuine Supabase session has expired
        if (request.cookies.get('leeg_auth_session')) {
          response.cookies.delete('leeg_auth_session');
        }
      }
    } catch {
      // Supabase network error or inactive session
    }
  } else {
    // 2. Offline prototype fallback cookie (only when Supabase env vars are not configured)
    const demoCookie = request.cookies.get('leeg_auth_session');
    if (demoCookie?.value) {
      try {
        const decoded = decodeURIComponent(demoCookie.value);
        const parsed = JSON.parse(decoded);
        if (parsed?.email) {
          isAuthenticated = true;
        }
      } catch {
        // invalid cookie format
      }
    }
  }

  // 3. Protected route enforcement (API routes enforce their own 401 JSON auth)
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/');

  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Redirect logged in users away from /login to /dashboard (unless completing password reset)
  if (
    isAuthenticated &&
    pathname === '/login' &&
    !request.nextUrl.searchParams.get('reset') &&
    request.nextUrl.searchParams.get('mode') !== 'forgot'
  ) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and icons
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
