import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';

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

  // 1. Check Supabase Auth if configured
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
      }
    } catch {
      // Supabase network error or inactive session
    }
  }

  // 2. Check fallback auth cookie
  if (!isAuthenticated) {
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

  // 3. Protected route enforcement
  const isPublicRoute =
    pathname === '/' || pathname === '/login' || pathname.startsWith('/auth');

  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Redirect logged in users away from /login to /dashboard
  if (isAuthenticated && pathname === '/login') {
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
